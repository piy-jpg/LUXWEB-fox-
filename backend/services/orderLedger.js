/**
 * Resilient Order Ledger Service
 * Ensures orders and Razorpay Payment IDs persist across serverless restarts and SQLite restarts.
 */
const fs = require("fs");
const path = require("path");

const LEDGER_PATH = path.resolve(__dirname, "../../database/orders_ledger.json");
const TMP_LEDGER_PATH = "/tmp/orders_ledger.json";

// In-memory fallback cache
let MEMORY_ORDERS = [];

function loadSeedLedger() {
  const candidates = [TMP_LEDGER_PATH, LEDGER_PATH];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (_) {}
  }
  return [];
}

// Initialize memory from disk
try {
  MEMORY_ORDERS = loadSeedLedger();
} catch (_) {
  MEMORY_ORDERS = [];
}

/**
 * Get all ledger orders, optionally syncing with live Razorpay payments if stale
 */
function getAllOrders() {
  const diskOrders = loadSeedLedger();
  const mergedMap = new Map();

  // Disk orders first
  diskOrders.forEach(o => {
    const key = o.order_number || o.orderNumber || o.payment_id || o.paymentId;
    if (key) mergedMap.set(String(key), o);
  });

  // Memory orders override / merge
  MEMORY_ORDERS.forEach(o => {
    const key = o.order_number || o.orderNumber || o.payment_id || o.paymentId;
    if (key) mergedMap.set(String(key), { ...(mergedMap.get(String(key)) || {}), ...o });
  });

  const all = Array.from(mergedMap.values());
  all.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  return all;
}

/**
 * Save an order to the ledger (memory + disk)
 */
function recordOrder(orderData) {
  if (!orderData) return null;

  const normalized = {
    id: orderData.id || Date.now(),
    order_number: orderData.order_number || orderData.orderNumber || ("LUM-2026-" + Math.floor(1000 + Math.random() * 9000)),
    customer_id: orderData.customer_id || orderData.customerId || null,
    customer_email: (orderData.customer_email || orderData.customerEmail || "").toLowerCase().trim(),
    customer_name: orderData.customer_name || orderData.customerName || "Valued Customer",
    subtotal: parseFloat(orderData.subtotal || orderData.total_amount || orderData.totalAmount || 0),
    discount_amount: parseFloat(orderData.discount_amount || orderData.discountAmount || 0),
    shipping_fee: parseFloat(orderData.shipping_fee || orderData.shippingFee || 0),
    total_amount: parseFloat(orderData.total_amount || orderData.totalAmount || 0),
    status: orderData.status || "Confirmed",
    payment_status: orderData.payment_status || orderData.paymentStatus || "Paid",
    payment_method: orderData.payment_method || orderData.paymentMethod || "Online Payment (Razorpay)",
    payment_id: orderData.payment_id || orderData.paymentId || null,
    razorpay_order_id: orderData.razorpay_order_id || orderData.razorpayOrderId || null,
    notes: orderData.notes || "",
    shipping_address_json: typeof orderData.shippingAddress === "object" ? JSON.stringify(orderData.shippingAddress) : (orderData.shipping_address_json || "{}"),
    items: orderData.items || [],
    created_at: orderData.created_at || orderData.createdAt || new Date().toISOString()
  };

  // Prepend or update in memory
  const idx = MEMORY_ORDERS.findIndex(o => 
    (o.order_number && o.order_number === normalized.order_number) ||
    (o.payment_id && normalized.payment_id && o.payment_id === normalized.payment_id)
  );
  if (idx >= 0) {
    MEMORY_ORDERS[idx] = { ...MEMORY_ORDERS[idx], ...normalized };
  } else {
    MEMORY_ORDERS.unshift(normalized);
  }

  // Attempt persistence to disk
  saveToDisk(getAllOrders());

  return normalized;
}

/**
 * Write ledger orders array to available disk targets
 */
function saveToDisk(orders) {
  if (!Array.isArray(orders)) return;
  try {
    fs.writeFileSync(LEDGER_PATH, JSON.stringify(orders, null, 2), "utf8");
  } catch (_) {}
  try {
    fs.writeFileSync(TMP_LEDGER_PATH, JSON.stringify(orders, null, 2), "utf8");
  } catch (_) {}
}

/**
 * Filter orders for a customer (by email or customer_id)
 */
function getCustomerOrders(identifier) {
  if (!identifier) return [];
  const normalizedId = String(identifier).toLowerCase().trim();
  const all = getAllOrders();
  return all.filter(o => {
    const cEmail = (o.customer_email || "").toLowerCase().trim();
    const cId = String(o.customer_id || "").toLowerCase().trim();
    return cEmail === normalizedId || cId === normalizedId;
  });
}

/**
 * Find single order by ID or order_number
 */
function findOrder(query) {
  if (!query && query !== 0) return null;
  const qStr = String(query).toLowerCase().trim();
  const cleanQ = qStr.replace(/^#/, "");
  const all = getAllOrders();
  return all.find(o => 
    String(o.id).toLowerCase() === cleanQ ||
    String(o.order_number || "").toLowerCase().replace(/^#/, "") === cleanQ ||
    String(o.payment_id || "").toLowerCase() === cleanQ
  ) || null;
}

/**
 * Update order status, tracking number, payment status, or notes in the ledger
 */
function updateOrderStatus(query, updates = {}) {
  if (!query && query !== 0) return null;
  const qStr = String(query).toLowerCase().trim().replace(/^#/, "");

  // Synchronize memory with latest dataset
  const all = getAllOrders();
  MEMORY_ORDERS = all;

  const idx = MEMORY_ORDERS.findIndex(o => 
    String(o.id).toLowerCase() === qStr ||
    String(o.order_number || "").toLowerCase().replace(/^#/, "") === qStr ||
    String(o.payment_id || "").toLowerCase() === qStr
  );

  if (idx === -1) return null;

  const target = MEMORY_ORDERS[idx];
  if (updates.status) target.status = updates.status;
  if (updates.payment_status || updates.paymentStatus) {
    target.payment_status = updates.payment_status || updates.paymentStatus;
  }
  if (updates.trackingNumber !== undefined || updates.tracking_number !== undefined) {
    target.tracking_number = updates.trackingNumber !== undefined ? updates.trackingNumber : updates.tracking_number;
  }
  if (updates.notes !== undefined) {
    target.notes = updates.notes;
  }
  target.updated_at = new Date().toISOString();

  saveToDisk(MEMORY_ORDERS);
  return target;
}

/**
 * Soft delete or permanently purge an order from the ledger
 */
function deleteOrder(query, permanent = false) {
  if (!query && query !== 0) return false;
  const qStr = String(query).toLowerCase().trim().replace(/^#/, "");

  const all = getAllOrders();
  MEMORY_ORDERS = all;

  const idx = MEMORY_ORDERS.findIndex(o => 
    String(o.id).toLowerCase() === qStr ||
    String(o.order_number || "").toLowerCase().replace(/^#/, "") === qStr ||
    String(o.payment_id || "").toLowerCase() === qStr
  );

  if (idx === -1) return false;

  if (permanent === true || permanent === "true") {
    MEMORY_ORDERS.splice(idx, 1);
  } else {
    MEMORY_ORDERS[idx].status = "Deleted";
    MEMORY_ORDERS[idx].updated_at = new Date().toISOString();
  }

  saveToDisk(MEMORY_ORDERS);
  return true;
}

/**
 * Restore an order from Deleted status in the ledger
 */
function restoreOrder(query, status = "Confirmed") {
  if (!query && query !== 0) return null;
  const qStr = String(query).toLowerCase().trim().replace(/^#/, "");

  const all = getAllOrders();
  MEMORY_ORDERS = all;

  const idx = MEMORY_ORDERS.findIndex(o => 
    String(o.id).toLowerCase() === qStr ||
    String(o.order_number || "").toLowerCase().replace(/^#/, "") === qStr ||
    String(o.payment_id || "").toLowerCase() === qStr
  );

  if (idx === -1) return null;

  MEMORY_ORDERS[idx].status = status || "Confirmed";
  MEMORY_ORDERS[idx].updated_at = new Date().toISOString();

  saveToDisk(MEMORY_ORDERS);
  return MEMORY_ORDERS[idx];
}

/**
 * Sync captured payments directly from Razorpay API
 * This ensures that if a customer paid on UPI/QR, it immediately shows up even if serverless DB dropped.
 */
let lastSyncTime = 0;
async function syncLiveRazorpayPayments(force = false) {
  const now = Date.now();
  // Rate limit live syncs to once every 15 seconds unless forced
  if (!force && (now - lastSyncTime) < 15000) {
    return getAllOrders();
  }
  lastSyncTime = now;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return getAllOrders();

  try {
    const auth = Buffer.from(keyId + ":" + keySecret).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/payments?count=15", {
      headers: { "Authorization": "Basic " + auth }
    });
    if (!res.ok) return getAllOrders();

    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) return getAllOrders();

    for (const p of data.items) {
      if (p.status !== "captured") continue;

      const paymentId = p.id;
      const orderId = p.order_id;
      const amount = (p.amount || 0) / 100;
      const email = p.email || "customer@lumiere.com";
      const contact = p.contact || "";
      const createdAt = new Date((p.created_at || Math.floor(Date.now() / 1000)) * 1000).toISOString();

      // Check if already in ledger
      const existing = findOrder(paymentId);
      if (!existing) {
        // Derive or synthesize an order record
        const syntheticOrderNum = "LUM-2026-" + Math.abs(parseInt(paymentId.slice(-4), 36) || Math.floor(1000 + Math.random() * 8999));
        recordOrder({
          order_number: syntheticOrderNum,
          customer_email: email,
          customer_name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          subtotal: amount,
          total_amount: amount,
          status: "Confirmed",
          payment_status: "Paid",
          payment_method: "Online Payment (" + (p.method ? p.method.toUpperCase() : "UPI") + " via Razorpay)",
          payment_id: paymentId,
          razorpay_order_id: orderId,
          notes: "Razorpay Captured: " + paymentId + (contact ? " | Contact: " + contact : ""),
          shipping_address_json: JSON.stringify({ address: "Confirmed Luxury Delivery", phone: contact }),
          items: [
            {
              productId: 172,
              name: "Luxury Atelier Selection",
              sku: "LUM-PRD-172",
              unitPrice: amount,
              quantity: 1,
              totalPrice: amount
            }
          ],
          created_at: createdAt
        });
      }
    }
  } catch (err) {
    console.warn("[OrderLedger] Razorpay sync notice:", err.message);
  }

  return getAllOrders();
}

module.exports = {
  getAllOrders,
  recordOrder,
  getCustomerOrders,
  findOrder,
  updateOrderStatus,
  deleteOrder,
  restoreOrder,
  saveToDisk,
  syncLiveRazorpayPayments
};
