/**
 * Admin & Staff Management Controller
 * Handles administrative overview, products, transactional inventory,
 * orders, customer directory, staff RBAC, analytics, and audit logging.
 */
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const inventoryService = require('../services/inventoryService');
const { logAudit } = require('../middleware/auditLogger');

/* ============================================================
   1. DASHBOARD EXECUTIVE OVERVIEW
   ============================================================ */
async function getOverview(req, res) {
  try {
    // Total Revenue (all completed/paid orders)
    const revRow = await db.get(
      "SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status != 'Cancelled'"
    );

    // Total Orders
    const ordersRow = await db.get('SELECT COUNT(*) as total_orders FROM orders');

    // Today's Orders (date matches today)
    const todayRow = await db.get(
      "SELECT COUNT(*) as today_orders, COALESCE(SUM(total_amount), 0) as today_revenue FROM orders WHERE DATE(created_at) = DATE('now') AND status != 'Cancelled'"
    );

    // Total Customers
    const custRow = await db.get(
      `SELECT COUNT(DISTINCT u.id) as total_customers 
       FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id
       WHERE r.name = 'CUSTOMER'`
    );

    // Product & Stock Counts
    const prodCount = await db.get("SELECT COUNT(*) as total_products FROM products WHERE status != 'archived'");
    const lowStockCount = await db.get(
      "SELECT COUNT(*) as low_stock FROM inventory WHERE (stock_quantity - reserved_quantity) <= low_stock_threshold AND (stock_quantity - reserved_quantity) > 0"
    );
    const outOfStockCount = await db.get(
      "SELECT COUNT(*) as out_of_stock FROM inventory WHERE (stock_quantity - reserved_quantity) <= 0"
    );

    // Recent 6 Orders
    const recentOrders = await db.query(
      `SELECT id, order_number, customer_name, customer_email, total_amount, status, payment_status, created_at 
       FROM orders 
       ORDER BY created_at DESC LIMIT 6`
    );

    // Best-selling products based on order_items
    const bestSellers = await db.query(
      `SELECT 
        p.id, p.name, p.sku, p.price,
        COALESCE(SUM(oi.quantity), 0) as total_sold,
        COALESCE(SUM(oi.total_price), 0) as revenue_generated,
        img.image_url
       FROM products p
       JOIN order_items oi ON oi.product_id = p.id
       JOIN orders o ON o.id = oi.order_id AND o.status != 'Cancelled'
       LEFT JOIN product_images img ON img.product_id = p.id AND img.is_primary = 1
       GROUP BY p.id
       ORDER BY total_sold DESC LIMIT 5`
    );

    // Revenue Overview (last 6 months or status breakdown)
    const statusBreakdown = await db.query(
      "SELECT status, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as value FROM orders GROUP BY status"
    );

    return res.json({
      success: true,
      metrics: {
        totalRevenue: parseFloat(revRow.total_revenue || 0),
        totalOrders: parseInt(ordersRow.total_orders || 0, 10),
        todayOrders: parseInt(todayRow.today_orders || 0, 10),
        todayRevenue: parseFloat(todayRow.today_revenue || 0),
        totalCustomers: parseInt(custRow.total_customers || 0, 10),
        totalProducts: parseInt(prodCount.total_products || 0, 10),
        lowStockCount: parseInt(lowStockCount.low_stock || 0, 10),
        outOfStockCount: parseInt(outOfStockCount.out_of_stock || 0, 10),
      },
      recentOrders,
      bestSellers,
      statusBreakdown,
    });
  } catch (err) {
    console.error('[Admin.getOverview] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate overview statistics.' });
  }
}

/* ============================================================
   2. PRODUCT MANAGEMENT
   ============================================================ */
async function getProducts(req, res) {
  const { search, category, status, limit = 250 } = req.query;

  try {
    let sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        col.name as collection_name,
        inv.id as inventory_id,
        inv.stock_quantity,
        inv.reserved_quantity,
        (inv.stock_quantity - inv.reserved_quantity) as available_quantity,
        inv.low_stock_threshold,
        img.image_url as primary_image
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN collections col ON col.id = p.collection_id
      LEFT JOIN inventory inv ON inv.product_id = p.id
      LEFT JOIN product_images img ON img.product_id = p.id AND img.is_primary = 1
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      sql += ' AND c.slug = ?';
      params.push(category);
    }

    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY p.id DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const products = await db.query(sql, params);
    const categories = await db.query('SELECT * FROM categories ORDER BY name ASC');
    const collections = await db.query('SELECT * FROM collections ORDER BY name ASC');

    return res.json({ success: true, products, categories, collections });
  } catch (err) {
    console.error('[Admin.getProducts] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve products.' });
  }
}

async function createProduct(req, res) {
  const {
    sku, name, description, price, compareAtPrice, categoryId, collectionId,
    stockQuantity = 50, lowStockThreshold = 5, status = 'active',
    isFeatured = 0, isNewArrival = 0, isBestseller = 0, badge = null,
    images = [], variants = []
  } = req.body;

  if (!sku || !name || price === undefined) {
    return res.status(400).json({ success: false, error: 'SKU, Name, and Price are required.' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const existingSku = await db.get('SELECT id FROM products WHERE sku = ?', [sku.trim()]);
    if (existingSku) {
      return res.status(409).json({ success: false, error: `SKU "${sku}" is already in use.` });
    }

    const productId = await db.transaction(async (tx) => {
      const pRes = await tx.run(
        `INSERT INTO products 
         (sku, name, slug, description, price, compare_at_price, category_id, collection_id, status, is_featured, is_new_arrival, is_bestseller, badge)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sku.trim(), name.trim(), slug, description || '', price, compareAtPrice || null,
          categoryId || null, collectionId || null, status, isFeatured ? 1 : 0,
          isNewArrival ? 1 : 0, isBestseller ? 1 : 0, badge || null,
        ]
      );
      const newProdId = pRes.lastInsertRowid;

      // Images
      if (Array.isArray(images) && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imgUrl = typeof images[i] === 'string' ? images[i] : images[i].url;
          if (imgUrl) {
            await tx.run(
              'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
              [newProdId, imgUrl, i === 0 ? 1 : 0, i]
            );
          }
        }
      }

      // Initial Inventory
      const initialStock = parseInt(stockQuantity || 0, 10);
      const invRes = await tx.run(
        `INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, low_stock_threshold)
         VALUES (?, ?, 0, ?)`,
        [newProdId, initialStock, parseInt(lowStockThreshold || 5, 10)]
      );

      // Record initial inventory transaction
      await tx.run(
        `INSERT INTO inventory_transactions 
         (inventory_id, transaction_type, quantity_delta, balance_after, reference_type, reference_id, reason, performed_by)
         VALUES (?, 'STOCK_RECEIVED', ?, ?, 'creation', 'NEW-PRODUCT', 'Initial stock on product creation', ?)`,
        [invRes.lastInsertRowid, initialStock, initialStock, req.user.id]
      );

      // Variants
      if (Array.isArray(variants) && variants.length > 0) {
        for (const v of variants) {
          if (v.variantName) {
            const vSku = v.sku || `${sku.trim()}-${v.variantName.toUpperCase().replace(/\s+/g, '')}`;
            await tx.run(
              'INSERT INTO product_variants (product_id, sku, variant_name, variant_type, price_override) VALUES (?, ?, ?, ?, ?)',
              [newProdId, vSku, v.variantName, v.variantType || 'shade', v.priceOverride || null]
            );
          }
        }
      }

      return newProdId;
    });

    logAudit({
      req,
      action: 'product.created',
      entityType: 'product',
      entityId: productId,
      details: { sku, name, price, stockQuantity },
    });

    return res.status(201).json({
      success: true,
      message: `Product "${name}" created successfully.`,
      productId,
    });
  } catch (err) {
    console.error('[Admin.createProduct] Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to create product.' });
  }
}

async function updateProduct(req, res) {
  const { id } = req.params;
  const {
    sku, name, description, price, compareAtPrice, categoryId, collectionId,
    status, isFeatured, isNewArrival, isBestseller, badge, lowStockThreshold
  } = req.body;

  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    await db.run(
      `UPDATE products 
       SET sku = ?, name = ?, description = ?, price = ?, compare_at_price = ?,
           category_id = ?, collection_id = ?, status = ?, is_featured = ?, 
           is_new_arrival = ?, is_bestseller = ?, badge = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        sku || product.sku,
        name || product.name,
        description !== undefined ? description : product.description,
        price !== undefined ? price : product.price,
        compareAtPrice !== undefined ? compareAtPrice : product.compare_at_price,
        categoryId !== undefined ? categoryId : product.category_id,
        collectionId !== undefined ? collectionId : product.collection_id,
        status || product.status,
        isFeatured !== undefined ? (isFeatured ? 1 : 0) : product.is_featured,
        isNewArrival !== undefined ? (isNewArrival ? 1 : 0) : product.is_new_arrival,
        isBestseller !== undefined ? (isBestseller ? 1 : 0) : product.is_bestseller,
        badge !== undefined ? badge : product.badge,
        id,
      ]
    );

    if (lowStockThreshold !== undefined) {
      await db.run('UPDATE inventory SET low_stock_threshold = ? WHERE product_id = ?', [lowStockThreshold, id]);
    }

    logAudit({
      req,
      action: 'product.edited',
      entityType: 'product',
      entityId: id,
      details: { name: name || product.name, price },
    });

    return res.json({ success: true, message: 'Product updated successfully.' });
  } catch (err) {
    console.error('[Admin.updateProduct] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update product.' });
  }
}

async function archiveProduct(req, res) {
  const { id } = req.params;

  try {
    await db.run("UPDATE products SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);

    logAudit({
      req,
      action: 'product.archived',
      entityType: 'product',
      entityId: id,
    });

    return res.json({ success: true, message: 'Product archived successfully.' });
  } catch (err) {
    console.error('[Admin.archiveProduct] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to archive product.' });
  }
}

async function createCategory(req, res) {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'Category name is required.' });
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  try {
    const existing = await db.get('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existing) {
      return res.status(409).json({ success: false, error: `Category "${name}" already exists.` });
    }
    const result = await db.run(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
      [name.trim(), slug, description || '']
    );
    return res.status(201).json({
      success: true,
      message: `Category "${name}" created successfully.`,
      categoryId: result.lastInsertRowid,
      slug,
    });
  } catch (err) {
    console.error('[Admin.createCategory] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getProductVariants(req, res) {
  const { productId } = req.query;
  try {
    let sql = `
      SELECT pv.*, p.name as product_name, p.sku as product_sku
      FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
    `;
    const params = [];
    if (productId) {
      sql += ' WHERE pv.product_id = ?';
      params.push(productId);
    }
    sql += ' ORDER BY pv.id DESC LIMIT 100';
    const variants = await db.query(sql, params);
    return res.json({ success: true, variants });
  } catch (err) {
    console.error('[Admin.getProductVariants] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/* ============================================================
   3. INVENTORY SYSTEM (TRANSACTIONAL)
   ============================================================ */
async function getInventory(req, res) {
  const { search, categoryId, filter } = req.query;

  try {
    const inventory = await inventoryService.getInventoryOverview({ search, categoryId, filter });
    return res.json({ success: true, inventory });
  } catch (err) {
    console.error('[Admin.getInventory] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve inventory data.' });
  }
}

async function getInventoryHistory(req, res) {
  const { id } = req.params;

  try {
    const history = await inventoryService.getInventoryHistory(id);
    return res.json({ success: true, history });
  } catch (err) {
    console.error('[Admin.getInventoryHistory] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve inventory history.' });
  }
}

async function adjustInventory(req, res) {
  let { inventoryId, productId, quantityDelta, transactionType, reason } = req.body;

  if (!inventoryId && productId) {
    const invRow = await db.get('SELECT id FROM inventory WHERE product_id = ?', [productId]);
    if (invRow) {
      inventoryId = invRow.id;
    } else {
      const newInv = await db.run(
        'INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, low_stock_threshold) VALUES (?, 0, 0, 5)',
        [productId]
      );
      inventoryId = newInv.lastInsertRowid;
    }
  }

  if (!inventoryId || quantityDelta === undefined || !transactionType) {
    return res.status(400).json({
      success: false,
      error: 'inventoryId (or productId), quantityDelta, and transactionType are required.',
    });
  }

  const delta = parseInt(quantityDelta, 10);
  if (isNaN(delta) || delta === 0) {
    return res.status(400).json({ success: false, error: 'quantityDelta must be a non-zero integer.' });
  }

  try {
    const result = await inventoryService.adjustStock({
      inventoryId,
      quantityDelta: delta,
      transactionType,
      reason,
      userId: req.user.id,
    });

    logAudit({
      req,
      action: 'inventory.adjusted',
      entityType: 'inventory',
      entityId: inventoryId,
      details: { delta, transactionType, reason, balanceAfter: result.newStock },
    });

    return res.json({
      success: true,
      message: `Inventory adjusted successfully. New stock: ${result.newStock}`,
      result,
    });
  } catch (err) {
    console.error('[Admin.adjustInventory] Error:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
}

/* ============================================================
   4. ORDER MANAGEMENT
   ============================================================ */
async function getOrders(req, res) {
  const { status, search, limit = 100 } = req.query;

  try {
    let sql = `
      SELECT 
        o.*,
        COUNT(oi.id) as total_items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const orders = await db.query(sql, params);
    return res.json({ success: true, orders });
  } catch (err) {
    console.error('[Admin.getOrders] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve orders.' });
  }
}

async function getOrderDetails(req, res) {
  const { id } = req.params;

  try {
    const order = await db.get('SELECT * FROM orders WHERE id = ? OR order_number = ?', [id, id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const items = await db.query(
      `SELECT oi.*, img.image_url as product_image, inv.stock_quantity as current_stock, (inv.stock_quantity - inv.reserved_quantity) as available_stock
       FROM order_items oi
       LEFT JOIN product_images img ON img.product_id = oi.product_id AND img.is_primary = 1
       LEFT JOIN inventory inv ON inv.product_id = oi.product_id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    let shippingAddress = {};
    try {
      shippingAddress = JSON.parse(order.shipping_address_json);
    } catch {
      shippingAddress = { text: order.shipping_address_json };
    }

    return res.json({ success: true, order: { ...order, shippingAddress, items } });
  } catch (err) {
    console.error('[Admin.getOrderDetails] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve order details.' });
  }
}

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status, trackingNumber, notes } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status "${status}".` });
  }

  try {
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const previousStatus = order.status;

    // Handle inventory state transitions
    if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
      // Order cancelled: restore inventory!
      await inventoryService.cancelOrderInventory(order.id, req.user.id);
    } else if (['Shipped', 'Delivered'].includes(status) && !['Shipped', 'Delivered'].includes(previousStatus)) {
      // Order fulfilled/delivered: finalize inventory deduction!
      await inventoryService.completeOrderInventory(order.id, req.user.id);
    }

    await db.run(
      `UPDATE orders 
       SET status = ?, tracking_number = COALESCE(?, tracking_number), notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, trackingNumber || null, notes || null, id]
    );

    logAudit({
      req,
      action: 'order.status_changed',
      entityType: 'order',
      entityId: id,
      details: { previousStatus, newStatus: status, trackingNumber },
    });

    return res.json({
      success: true,
      message: `Order #${order.order_number} status updated to "${status}".`,
    });
  } catch (err) {
    console.error('[Admin.updateOrderStatus] Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update order status.' });
  }
}

/* ============================================================
   5. CUSTOMER DIRECTORY
   ============================================================ */
async function getCustomers(req, res) {
  const { search, limit = 100 } = req.query;

  try {
    let sql = `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.status,
        u.created_at,
        u.last_login_at,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      JOIN user_roles ur ON ur.user_id = u.id
      JOIN roles r ON r.id = ur.role_id AND r.name = 'CUSTOMER'
      LEFT JOIN orders o ON (o.customer_id = u.id OR o.customer_email = u.email) AND o.status != 'Cancelled'
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' GROUP BY u.id ORDER BY total_spent DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const customers = await db.query(sql, params);
    return res.json({ success: true, customers });
  } catch (err) {
    console.error('[Admin.getCustomers] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve customer directory.' });
  }
}

async function getCustomerDetails(req, res) {
  const { id } = req.params;

  try {
    const customer = await db.get(
      'SELECT id, email, first_name, last_name, phone, status, created_at, last_login_at FROM users WHERE id = ?',
      [id]
    );

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found.' });
    }

    const orders = await db.query(
      'SELECT * FROM orders WHERE customer_id = ? OR customer_email = ? ORDER BY created_at DESC',
      [customer.id, customer.email]
    );

    const addresses = await db.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC',
      [customer.id]
    );

    return res.json({
      success: true,
      customer: { ...customer, orders, addresses },
    });
  } catch (err) {
    console.error('[Admin.getCustomerDetails] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve customer details.' });
  }
}

/* ============================================================
   6. STAFF MANAGEMENT & RBAC (OWNER ONLY)
   ============================================================ */
async function getStaff(req, res) {
  try {
    const staff = await db.query(
      `SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.status,
        u.created_at,
        u.last_login_at,
        r.name as role_name,
        r.id as role_id
       FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id AND r.name != 'CUSTOMER'
       ORDER BY (CASE WHEN r.name = 'OWNER' THEN 1 WHEN r.name = 'MANAGER' THEN 2 ELSE 3 END), u.first_name ASC`
    );

    const roles = await db.query("SELECT * FROM roles WHERE name != 'CUSTOMER'");
    const permissions = await db.query('SELECT * FROM permissions ORDER BY code ASC');

    return res.json({ success: true, staff, roles, permissions });
  } catch (err) {
    console.error('[Admin.getStaff] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve staff directory.' });
  }
}

async function createStaff(req, res) {
  const { email, password, firstName, lastName, phone, roleName } = req.body;

  if (!email || !password || !roleName) {
    return res.status(400).json({ success: false, error: 'Email, password, and role are required.' });
  }

  const validRoles = ['MANAGER', 'INVENTORY_STAFF', 'ORDER_STAFF'];
  if (!validRoles.includes(roleName)) {
    return res.status(400).json({ success: false, error: `Invalid staff role "${roleName}".` });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userRes = await db.run(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [normalizedEmail, passwordHash, firstName || '', lastName || '', phone || '']
    );

    const newUserId = userRes.lastInsertRowid;
    const role = await db.get('SELECT id FROM roles WHERE name = ?', [roleName]);
    if (role) {
      await db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [newUserId, role.id]);
    }

    logAudit({
      req,
      action: 'staff.created',
      entityType: 'staff',
      entityId: newUserId,
      details: { email: normalizedEmail, role: roleName },
    });

    return res.status(201).json({
      success: true,
      message: `Staff account for ${firstName} (${roleName}) created successfully.`,
      staffId: newUserId,
    });
  } catch (err) {
    console.error('[Admin.createStaff] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create staff account.' });
  }
}

async function updateStaff(req, res) {
  const { id } = req.params;
  const { firstName, lastName, phone, roleName, status } = req.body;

  try {
    const staffUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!staffUser) {
      return res.status(404).json({ success: false, error: 'Staff member not found.' });
    }

    await db.run(
      `UPDATE users 
       SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), 
           phone = COALESCE(?, phone), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [firstName, lastName, phone, status, id]
    );

    if (roleName) {
      const role = await db.get('SELECT id FROM roles WHERE name = ?', [roleName]);
      if (role) {
        await db.run('DELETE FROM user_roles WHERE user_id = ?', [id]);
        await db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [id, role.id]);
      }
    }

    logAudit({
      req,
      action: 'staff.updated',
      entityType: 'staff',
      entityId: id,
      details: { roleName, status },
    });

    return res.json({ success: true, message: 'Staff member updated successfully.' });
  } catch (err) {
    console.error('[Admin.updateStaff] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update staff member.' });
  }
}

async function resetStaffPassword(req, res) {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, error: 'New password must be at least 8 characters long.' });
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [passwordHash, id]);

    logAudit({
      req,
      action: 'staff.password_reset',
      entityType: 'staff',
      entityId: id,
    });

    return res.json({ success: true, message: 'Staff credentials reset successfully.' });
  } catch (err) {
    console.error('[Admin.resetStaffPassword] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to reset staff password.' });
  }
}

/* ============================================================
   7. AUDIT LOGS & SETTINGS
   ============================================================ */
async function getAuditLogs(req, res) {
  const { limit = 100 } = req.query;

  try {
    const logs = await db.query(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?`,
      [parseInt(limit, 10)]
    );
    return res.json({ success: true, logs });
  } catch (err) {
    console.error('[Admin.getAuditLogs] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve audit logs.' });
  }
}

module.exports = {
  getOverview,
  getProducts,
  createProduct,
  updateProduct,
  archiveProduct,
  createCategory,
  getProductVariants,
  getInventory,
  getInventoryHistory,
  adjustInventory,
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  getCustomers,
  getCustomerDetails,
  getStaff,
  createStaff,
  updateStaff,
  resetStaffPassword,
  getAuditLogs,
};
