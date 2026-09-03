/**
 * Transactional Inventory Management Service
 * Enforces atomic stock operations, prevents overselling and negative balances,
 * and logs full historical transactions for every stock adjustment.
 */
const db = require('../config/db');

/**
 * Fetch inventory status for all products
 */
async function getInventoryOverview({ search = '', categoryId = null, filter = 'all' } = {}) {
  let sql = `
    SELECT 
      inv.id as inventory_id,
      inv.product_id,
      inv.stock_quantity,
      inv.reserved_quantity,
      (inv.stock_quantity - inv.reserved_quantity) as available_quantity,
      inv.low_stock_threshold,
      inv.updated_at,
      p.name as product_name,
      p.sku,
      p.price,
      p.status as product_status,
      c.name as category_name,
      img.image_url as primary_image
    FROM inventory inv
    JOIN products p ON p.id = inv.product_id
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_images img ON img.product_id = p.id AND img.is_primary = 1
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    sql += ` AND (p.name LIKE ? OR p.sku LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (categoryId) {
    sql += ` AND p.category_id = ?`;
    params.push(categoryId);
  }

  if (filter === 'low_stock') {
    sql += ` AND (inv.stock_quantity - inv.reserved_quantity) <= inv.low_stock_threshold AND (inv.stock_quantity - inv.reserved_quantity) > 0`;
  } else if (filter === 'out_of_stock') {
    sql += ` AND (inv.stock_quantity - inv.reserved_quantity) <= 0`;
  }

  sql += ` ORDER BY available_quantity ASC, p.name ASC`;

  const rows = await db.query(sql, params);
  return rows.map(r => ({
    ...r,
    is_low_stock: r.available_quantity <= r.low_stock_threshold && r.available_quantity > 0,
    is_out_of_stock: r.available_quantity <= 0,
  }));
}

/**
 * Fetch complete transaction history for an inventory record
 */
async function getInventoryHistory(inventoryId) {
  const sql = `
    SELECT 
      tx.id,
      tx.inventory_id,
      tx.transaction_type,
      tx.quantity_delta,
      tx.balance_after,
      tx.reference_type,
      tx.reference_id,
      tx.reason,
      tx.created_at,
      u.email as performed_by_email,
      u.first_name as performed_by_first_name,
      u.last_name as performed_by_last_name
    FROM inventory_transactions tx
    LEFT JOIN users u ON u.id = tx.performed_by
    WHERE tx.inventory_id = ?
    ORDER BY tx.created_at DESC, tx.id DESC
  `;
  return await db.query(sql, [inventoryId]);
}

/**
 * Reserve inventory for an order inside an atomic transaction.
 * Fails and rolls back if any product does not have sufficient available stock.
 */
async function reserveStockForOrder(orderItems, orderNumber, userId = null) {
  return await db.transaction(async (tx) => {
    for (const item of orderItems) {
      const inv = await tx.get(
        `SELECT id, product_id, stock_quantity, reserved_quantity, low_stock_threshold 
         FROM inventory WHERE product_id = ?`,
        [item.productId]
      );

      if (!inv) {
        throw new Error(`Inventory record not found for product ID ${item.productId}`);
      }

      const available = inv.stock_quantity - inv.reserved_quantity;
      if (available < item.quantity) {
        const prod = await tx.get('SELECT name FROM products WHERE id = ?', [item.productId]);
        const prodName = prod ? prod.name : `Product #${item.productId}`;
        throw new Error(`Insufficient stock for "${prodName}". Requested: ${item.quantity}, Available: ${available}`);
      }

      const newReserved = inv.reserved_quantity + item.quantity;
      const availableAfter = inv.stock_quantity - newReserved;

      await tx.run(
        `UPDATE inventory SET reserved_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [newReserved, inv.id]
      );

      await tx.run(
        `INSERT INTO inventory_transactions 
         (inventory_id, transaction_type, quantity_delta, balance_after, reference_type, reference_id, reason, performed_by)
         VALUES (?, 'ORDER_RESERVED', ?, ?, 'order', ?, ?, ?)`,
        [
          inv.id,
          item.quantity,
          availableAfter,
          orderNumber,
          `Reserved ${item.quantity} unit(s) for Order #${orderNumber}`,
          userId,
        ]
      );
    }
    return true;
  });
}

/**
 * Finalize inventory when order moves to fulfilled/shipped/delivered.
 * Deducts both stock_quantity and reserved_quantity.
 */
async function completeOrderInventory(orderId, userId = null) {
  return await db.transaction(async (tx) => {
    const order = await tx.get('SELECT order_number FROM orders WHERE id = ?', [orderId]);
    const items = await tx.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);

    for (const item of items) {
      const inv = await tx.get('SELECT id, stock_quantity, reserved_quantity FROM inventory WHERE product_id = ?', [item.product_id]);
      if (!inv) continue;

      const newStock = Math.max(0, inv.stock_quantity - item.quantity);
      const newReserved = Math.max(0, inv.reserved_quantity - item.quantity);

      await tx.run(
        `UPDATE inventory SET stock_quantity = ?, reserved_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [newStock, newReserved, inv.id]
      );

      await tx.run(
        `INSERT INTO inventory_transactions 
         (inventory_id, transaction_type, quantity_delta, balance_after, reference_type, reference_id, reason, performed_by)
         VALUES (?, 'ORDER_COMPLETED', ?, ?, 'order', ?, ?, ?)`,
        [
          inv.id,
          -item.quantity,
          newStock,
          order ? order.order_number : String(orderId),
          `Order completed: deducted ${item.quantity} unit(s) from inventory`,
          userId,
        ]
      );
    }
    return true;
  });
}

/**
 * Restore inventory when an order is cancelled or refunded.
 */
async function cancelOrderInventory(orderId, userId = null) {
  return await db.transaction(async (tx) => {
    const order = await tx.get('SELECT order_number, status FROM orders WHERE id = ?', [orderId]);
    const items = await tx.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);

    for (const item of items) {
      const inv = await tx.get('SELECT id, stock_quantity, reserved_quantity FROM inventory WHERE product_id = ?', [item.product_id]);
      if (!inv) continue;

      if (['Shipped', 'Delivered'].includes(order.status)) {
        // Was already deducted from stock: add back to stock
        const newStock = inv.stock_quantity + item.quantity;
        await tx.run(
          `UPDATE inventory SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [newStock, inv.id]
        );
        await tx.run(
          `INSERT INTO inventory_transactions 
           (inventory_id, transaction_type, quantity_delta, balance_after, reference_type, reference_id, reason, performed_by)
           VALUES (?, 'REFUND', ?, ?, 'order', ?, ?, ?)`,
          [
            inv.id,
            item.quantity,
            newStock,
            order.order_number,
            `Restored ${item.quantity} unit(s) due to Order Cancellation/Refund`,
            userId,
          ]
        );
      } else {
        // Was only reserved: release reserved quantity
        const newReserved = Math.max(0, inv.reserved_quantity - item.quantity);
        const availableAfter = inv.stock_quantity - newReserved;
        await tx.run(
          `UPDATE inventory SET reserved_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [newReserved, inv.id]
        );
        await tx.run(
          `INSERT INTO inventory_transactions 
           (inventory_id, transaction_type, quantity_delta, balance_after, reference_type, reference_id, reason, performed_by)
           VALUES (?, 'ORDER_CANCELLED', ?, ?, 'order', ?, ?, ?)`,
          [
            inv.id,
            -item.quantity,
            availableAfter,
            order.order_number,
            `Released ${item.quantity} reserved unit(s) due to Order Cancellation`,
            userId,
          ]
        );
      }
    }
    return true;
  });
}

/**
 * Manual or operational inventory adjustment (Stock Received, Damaged, Adjustment)
 */
async function adjustStock({ inventoryId, quantityDelta, transactionType, reason, userId = null }) {
  const allowedTypes = [
    'STOCK_RECEIVED',
    'DAMAGED',
    'MANUAL_ADJUSTMENT',
    'REFUND',
  ];

  if (!allowedTypes.includes(transactionType)) {
    throw new Error(`Invalid transaction type "${transactionType}".`);
  }

  return await db.transaction(async (tx) => {
    const inv = await tx.get(
      'SELECT id, product_id, stock_quantity, reserved_quantity FROM inventory WHERE id = ?',
      [inventoryId]
    );

    if (!inv) {
      throw new Error(`Inventory item #${inventoryId} not found.`);
    }

    const newStock = inv.stock_quantity + quantityDelta;
    if (newStock < 0) {
      throw new Error(`Negative stock prevented. Current stock is ${inv.stock_quantity}, adjustment is ${quantityDelta}.`);
    }

    if (newStock < inv.reserved_quantity) {
      throw new Error(`Cannot reduce stock below current reserved quantity of ${inv.reserved_quantity}.`);
    }

    await tx.run(
      `UPDATE inventory SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newStock, inventoryId]
    );

    await tx.run(
      `INSERT INTO inventory_transactions 
       (inventory_id, transaction_type, quantity_delta, balance_after, reference_type, reference_id, reason, performed_by)
       VALUES (?, ?, ?, ?, 'adjustment', 'MANUAL', ?, ?)`,
      [
        inventoryId,
        transactionType,
        quantityDelta,
        newStock,
        reason || `Manual adjustment: ${transactionType}`,
        userId,
      ]
    );

    return {
      inventoryId,
      oldStock: inv.stock_quantity,
      newStock,
      availableStock: newStock - inv.reserved_quantity,
    };
  });
}

module.exports = {
  getInventoryOverview,
  getInventoryHistory,
  reserveStockForOrder,
  completeOrderInventory,
  cancelOrderInventory,
  adjustStock,
};
