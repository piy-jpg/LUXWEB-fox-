/**
 * Storefront Order & Checkout Routes
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const inventoryService = require('../services/inventoryService');
const { logAudit } = require('../middleware/auditLogger');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Optional authentication helper (permits guest checkout or links to logged-in customer)
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // Guest
    }
  }
  next();
}

/**
 * Place a new order
 */
router.post('/', optionalAuth, async (req, res) => {
  const {
    items = [],
    customerName,
    customerEmail,
    shippingAddress,
    discountAmount = 0,
    shippingFee = 0,
    notes = '',
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Shopping bag is empty.' });
  }

  const name = customerName || (req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() : 'Valued Customer');
  const email = customerEmail || (req.user ? req.user.email : 'guest@lumiere.com');

  if (!email || !name) {
    return res.status(400).json({ success: false, error: 'Customer name and email are required for checkout.' });
  }

  // Generate unique luxury order number
  const orderNumber = `LUM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    // 1. Calculate subtotal & verify items
    let subtotal = 0;
    const resolvedItems = [];

    for (const item of items) {
      const pId = parseInt(item.id || item.productId, 10);
      const qty = parseInt(item.qty || item.quantity || 1, 10);
      const product = await db.get('SELECT id, name, sku, price FROM products WHERE id = ?', [pId]);

      if (!product) {
        return res.status(400).json({ success: false, error: `Product #${pId} is no longer available.` });
      }

      const itemTotal = product.price * qty;
      subtotal += itemTotal;
      resolvedItems.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        unitPrice: product.price,
        quantity: qty,
        totalPrice: itemTotal,
      });
    }

    const totalAmount = Math.max(0, subtotal - parseFloat(discountAmount || 0) + parseFloat(shippingFee || 0));

    // 2. Atomically reserve inventory (will throw and abort if insufficient stock!)
    await inventoryService.reserveStockForOrder(resolvedItems, orderNumber, req.user ? req.user.id : null);

    // 3. Create order in database
    const orderRes = await db.run(
      `INSERT INTO orders 
       (order_number, customer_id, customer_email, customer_name, subtotal, discount_amount, shipping_fee, total_amount, status, payment_status, shipping_address_json, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'Paid', ?, ?)`,
      [
        orderNumber,
        req.user ? req.user.id : null,
        email.trim().toLowerCase(),
        name.trim(),
        subtotal.toFixed(2),
        parseFloat(discountAmount || 0).toFixed(2),
        parseFloat(shippingFee || 0).toFixed(2),
        totalAmount.toFixed(2),
        JSON.stringify(shippingAddress || { address: 'Standard Complimentary Delivery' }),
        notes || 'Order placed via online storefront',
      ]
    );

    const orderId = orderRes.lastInsertRowid;

    // 4. Create order items
    for (const item of resolvedItems) {
      await db.run(
        `INSERT INTO order_items (order_id, product_id, product_name, sku, unit_price, quantity, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.name, item.sku, item.unitPrice, item.quantity, item.totalPrice]
      );
    }

    logAudit({
      userId: req.user ? req.user.id : null,
      userEmail: email,
      userRole: req.user ? (req.user.roles ? req.user.roles[0] : 'CUSTOMER') : 'GUEST',
      action: 'order.placed',
      entityType: 'order',
      entityId: orderId,
      details: { orderNumber, totalAmount, itemsCount: resolvedItems.length },
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully. Your luxury items are being prepared.',
      order: {
        id: orderId,
        orderNumber,
        subtotal,
        totalAmount,
        status: 'Confirmed',
        items: resolvedItems,
      },
    });
  } catch (err) {
    console.error('[Orders.placeOrder] Error:', err);
    return res.status(400).json({ success: false, error: err.message || 'Failed to process order.' });
  }
});

module.exports = router;
