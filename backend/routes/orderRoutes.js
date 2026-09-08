/**
 * Storefront Order & Checkout Routes
 */
const express = require('express');
const router = express.Router();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const crypto = require('crypto');
const db = require('../config/db');
const inventoryService = require('../services/inventoryService');
const { logAudit } = require('../middleware/auditLogger');
const { broadcastCatalogUpdate } = require('../controllers/productController');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { sendOrderNotificationToOwner, generateOwnerWhatsAppNotification } = require('../services/emailService');
const { sendOrderAlertSmsToOwner } = require('../services/smsService');

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
 * Core order creation engine
 */
async function processOrderCreation({
  items = [],
  customerName,
  customerEmail,
  shippingAddress,
  discountAmount = 0,
  shippingFee = 0,
  notes = '',
  resolvedPaymentMethod = 'Complimentary Concierge Authorization',
  resolvedPaymentStatus = 'Paid',
  user = null
}) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Shopping bag is empty.');
  }

  const name = customerName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Valued Customer');
  const email = customerEmail || (user ? user.email : 'guest@lumiere.com');

  if (!email || !name) {
    throw new Error('Customer name and email are required for checkout.');
  }

  // Generate unique luxury order number
  const orderNumber = `LUM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Calculate subtotal & verify items
  let subtotal = 0;
  const resolvedItems = [];

  for (const item of items) {
    const pId = parseInt(item.id || item.productId, 10);
    const qty = parseInt(item.qty || item.quantity || 1, 10);
    const product = await db.get('SELECT id, name, sku, price FROM products WHERE id = ?', [pId]);

    if (!product) {
      throw new Error(`Product #${pId} is no longer available.`);
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

  let orderUserId = null;
  if (user && user.id) {
    const u = await db.get('SELECT id FROM users WHERE id = ?', [user.id]);
    if (u) orderUserId = u.id;
  }

  // 2. Atomically reserve inventory (will throw and abort if insufficient stock!)
  await inventoryService.reserveStockForOrder(resolvedItems, orderNumber, orderUserId);

  // 3. Create order in database
  const orderRes = await db.run(
    `INSERT INTO orders 
     (order_number, customer_id, customer_email, customer_name, subtotal, discount_amount, shipping_fee, total_amount, status, payment_status, payment_method, shipping_address_json, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?, ?, ?, ?)`,
    [
      orderNumber,
      orderUserId,
      email.trim().toLowerCase(),
      name.trim(),
      subtotal.toFixed(2),
      parseFloat(discountAmount || 0).toFixed(2),
      parseFloat(shippingFee || 0).toFixed(2),
      totalAmount.toFixed(2),
      resolvedPaymentStatus,
      resolvedPaymentMethod,
      JSON.stringify(shippingAddress || { address: 'Standard Complimentary Delivery' }),
      notes || `Payment via ${resolvedPaymentMethod}`,
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
    userId: user ? user.id : null,
    userEmail: email,
    userRole: user ? (user.roles ? user.roles[0] : 'CUSTOMER') : 'GUEST',
    action: 'order.placed',
    entityType: 'order',
    entityId: orderId,
    details: { orderNumber, totalAmount, itemsCount: resolvedItems.length, paymentMethod: resolvedPaymentMethod },
  });

  broadcastCatalogUpdate({ action: 'order.placed', orderNumber, items: resolvedItems });

  // 5. Generate Owner WhatsApp Notification dossier & send email to Owner (Piyush Verma)
  const whatsAppData = generateOwnerWhatsAppNotification({
    orderNumber,
    customerName: name.trim(),
    customerEmail: email.trim().toLowerCase(),
    shippingAddress,
    paymentMethod: resolvedPaymentMethod,
    paymentStatus: resolvedPaymentStatus,
    subtotal,
    totalAmount,
    items: resolvedItems
  });

  // Send Owner Email Notification asynchronously (non-blocking)
  sendOrderNotificationToOwner({
    orderNumber,
    customerName: name.trim(),
    customerEmail: email.trim().toLowerCase(),
    shippingAddress,
    paymentMethod: resolvedPaymentMethod,
    paymentStatus: resolvedPaymentStatus,
    subtotal,
    totalAmount,
    items: resolvedItems
  }).catch(err => console.error('[OrderRoutes] sendOrderNotificationToOwner error:', err.message));

  // Send Real SMS alert to Owner (7300212948)
  sendOrderAlertSmsToOwner({
    orderNumber,
    totalAmount,
    customerName: name.trim()
  }).catch(err => console.error('[OrderRoutes] sendOrderAlertSmsToOwner error:', err.message));

  console.log(`[OrderRoutes] 📲 New Order #${orderNumber} registered. Owner WhatsApp: +91 7300212948 | Owner Email: piyushverma9903@gmail.com`);

  return {
    id: orderId,
    orderNumber,
    subtotal,
    totalAmount,
    status: 'Confirmed',
    paymentStatus: resolvedPaymentStatus,
    paymentMethod: resolvedPaymentMethod,
    items: resolvedItems,
    shippingAddress,
    createdAt: new Date().toISOString(),
    ownerNotification: {
      whatsAppUrl: whatsAppData.url,
      whatsAppText: whatsAppData.text,
      ownerPhone: '+91 7300212948',
      ownerEmail: 'piyushverma9903@gmail.com'
    }
  };
}

/**
 * Public Config: Get Razorpay Public Key ID
 */
router.get('/razorpay-config', (req, res) => {
  res.json({
    success: true,
    keyId: process.env.RAZORPAY_KEY_ID || '',
    isConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  });
});

/**
 * Razorpay: Create Order Session
 */
router.post('/razorpay-create-order', optionalAuth, async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ success: false, error: 'Razorpay keys not configured on server.' });
    }

    const amountInPaise = Math.round(parseFloat(amount) * 100);
    if (!amountInPaise || amountInPaise <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid order amount.' });
    }

    const receipt = `RCPT_${Date.now()}`;
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: currency || 'INR',
        receipt: receipt,
        payment_capture: 1,
        notes: {
          store: 'Lumiere Beauty / Townhub'
        }
      })
    });

    const rzpData = await rzpRes.json();
    if (!rzpRes.ok) {
      console.error('[Razorpay] Order creation failed:', rzpData);
      return res.status(rzpRes.status).json({ success: false, error: rzpData.error?.description || 'Razorpay order creation failed.' });
    }

    return res.json({
      success: true,
      orderId: rzpData.id,
      amount: rzpData.amount,
      currency: rzpData.currency,
      keyId: keyId
    });
  } catch (err) {
    const detail = err.cause?.code || err.code || err.message;
    console.error('[Razorpay] Create order exception:', detail, err);
    return res.status(500).json({ 
      success: false, 
      error: `Razorpay connection error (${detail}). Please ensure the server has internet connectivity.` 
    });
  }
});

/**
 * Razorpay: Verify Payment Signature & Confirm Order
 */
router.post('/razorpay-verify', optionalAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderPayload
    } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ success: false, error: 'Razorpay secret key not found.' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing Razorpay signature verification parameters.' });
    }

    // Cryptographic HMAC-SHA256 signature verification
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('[Razorpay] Signature mismatch!', { expected: expectedSignature, received: razorpay_signature });
      return res.status(400).json({ success: false, error: 'Cryptographic signature mismatch! Payment cannot be verified.' });
    }

    // Payment is verified! Create order in database
    const orderRecord = await processOrderCreation({
      ...(orderPayload || {}),
      resolvedPaymentMethod: 'Online Payment (PhonePe / UPI / Cards via Razorpay)',
      resolvedPaymentStatus: 'Paid',
      notes: `Razorpay Verified: ${razorpay_payment_id} | Order: ${razorpay_order_id}`,
      user: req.user
    });

    return res.status(201).json({
      success: true,
      message: 'Payment verified and order confirmed successfully!',
      order: orderRecord
    });
  } catch (err) {
    console.error('[Razorpay] Verification exception:', err);
    return res.status(400).json({ success: false, error: err.message || 'Failed to verify and process order.' });
  }
});

/**
 * Standard Order Placement (COD, Manual UPI/QR)
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
    paymentMethod,
    paymentDetails = {}
  } = req.body;

  let resolvedPaymentMethod = 'Complimentary Concierge Authorization';
  let resolvedPaymentStatus = 'Paid';

  const pm = String(paymentMethod || '').toUpperCase();
  if (pm === 'COD' || pm.includes('CASH')) {
    resolvedPaymentMethod = 'Cash on Delivery (COD)';
    resolvedPaymentStatus = 'Pending (Pay on Delivery)';
  } else if (pm === 'UPI') {
    const upiId = paymentDetails && paymentDetails.upiId ? ` (${paymentDetails.upiId})` : '';
    resolvedPaymentMethod = `UPI Payment${upiId}`;
    resolvedPaymentStatus = 'Paid';
  } else if (pm === 'QR' || pm.includes('QR')) {
    const ref = paymentDetails && paymentDetails.refNo ? ` [UTR: ${paymentDetails.refNo}]` : '';
    resolvedPaymentMethod = `UPI QR Code${ref}`;
    resolvedPaymentStatus = 'Paid';
  } else if (paymentMethod) {
    resolvedPaymentMethod = paymentMethod;
    resolvedPaymentStatus = 'Paid';
  }

  try {
    const orderRecord = await processOrderCreation({
      items,
      customerName,
      customerEmail,
      shippingAddress,
      discountAmount,
      shippingFee,
      notes,
      resolvedPaymentMethod,
      resolvedPaymentStatus,
      user: req.user
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully. Your luxury items are being prepared.',
      order: orderRecord
    });
  } catch (err) {
    console.error('[Orders.placeOrder] Error:', err);
    return res.status(400).json({ success: false, error: err.message || 'Failed to process order.' });
  }
});

module.exports = router;
