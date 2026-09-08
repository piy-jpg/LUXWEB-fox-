/**
 * Customer Account Controller
 * Handles profile, saved addresses, order history & tracking,
 * and wishlist synchronization.
 */
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { logAudit } = require('../middleware/auditLogger');
const orderLedger = require('../services/orderLedger');

/**
 * Get Customer Profile Overview
 */
async function getProfile(req, res) {
  try {
    let user = null;
    if (req.user && req.user.id) {
      user = await db.get(
        'SELECT id, email, first_name, last_name, phone, age, location, created_at FROM users WHERE id = ?',
        [req.user.id]
      );
    }
    if (!user && req.user && req.user.email) {
      user = await db.get(
        'SELECT id, email, first_name, last_name, phone, age, location, created_at FROM users WHERE email = ?',
        [req.user.email.toLowerCase()]
      );
    }

    if (!user) {
      user = {
        id: req.user ? req.user.id : 1,
        email: req.user ? req.user.email : 'client@lumiere.luxury',
        first_name: req.user ? (req.user.firstName || '') : '',
        last_name: req.user ? (req.user.lastName || '') : '',
        phone: req.user ? (req.user.phone || '') : '',
        age: '',
        location: '',
        created_at: new Date().toISOString(),
      };
    }

    let orderStats = null;
    try {
      orderStats = await db.get(
        `SELECT COUNT(*) as order_count, COALESCE(SUM(total_amount), 0) as total_spent 
         FROM orders WHERE customer_id = ? OR customer_email = ?`,
        [user.id, user.email]
      );
    } catch (_) {}

    // Fallback: check ledger orders if DB has 0
    let resolvedOrderCount = orderStats ? orderStats.order_count : 0;
    let resolvedTotalSpent = orderStats && orderStats.total_spent ? parseFloat(orderStats.total_spent) : 0;
    const ledgerCustomerOrders = orderLedger.getCustomerOrders(user.email || user.id);
    if (resolvedOrderCount === 0 && ledgerCustomerOrders.length > 0) {
      resolvedOrderCount = ledgerCustomerOrders.length;
      resolvedTotalSpent = ledgerCustomerOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    }

    let wishlistStats = null;
    try {
      wishlistStats = await db.get(
        `SELECT COUNT(*) as wishlist_count FROM wishlist_items wi
         JOIN wishlists w ON w.id = wi.wishlist_id
         WHERE w.user_id = ?`,
        [user.id]
      );
    } catch (_) {}

    const uEmail = (user.email || req.user?.email || '').toLowerCase().trim();
    const isOwner = Boolean(
      req.user?.isOwner ||
      (req.user?.roles && (req.user.roles.includes('OWNER') || req.user.roles.includes('ADMIN') || req.user.roles.includes('MANAGER'))) ||
      uEmail.includes('piyushverma') ||
      uEmail === 'piyushverma730929@gmail.com' ||
      uEmail === 'piyushverma9903@gmail.com' ||
      (user.phone && user.phone.includes('7300212948'))
    );

    const allStoreOrders = isOwner ? orderLedger.getAllOrders() : [];
    const storeRevenue = allStoreOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

    return res.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        firstName: user.first_name || (req.user ? req.user.firstName : '') || '',
        lastName: user.last_name || (req.user ? req.user.lastName : '') || '',
        phone: user.phone || (req.user ? req.user.phone : '') || '',
        age: user.age || '',
        location: user.location || '',
        memberSince: user.created_at || new Date().toISOString(),
        isOwner,
        storeRevenue,
        storeOrderCount: allStoreOrders.length,
        orderCount: resolvedOrderCount,
        totalSpent: resolvedTotalSpent,
        wishlistCount: wishlistStats ? wishlistStats.wishlist_count : 0,
      },
    });
  } catch (err) {
    console.error('[Account.getProfile] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve profile data.' });
  }
}

/**
 * Update Customer Profile
 */
async function updateProfile(req, res) {
  const { firstName, lastName, phone, age, location } = req.body;

  try {
    const parsedAge = age ? parseInt(age, 10) : null;
    await db.run(
      `UPDATE users 
       SET first_name = ?, last_name = ?, phone = ?, age = ?, location = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        firstName ? firstName.trim() : null, 
        lastName ? lastName.trim() : null, 
        phone ? phone.trim() : null, 
        parsedAge, 
        location ? location.trim() : null, 
        req.user.id
      ]
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone || '',
        age: parsedAge,
        location: location || '',
      },
    });
  } catch (err) {
    console.error('[Account.updateProfile] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
}

/**
 * Change Customer Password
 */
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Current password and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, error: 'New password must be at least 8 characters long.' });
  }

  try {
    const user = await db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Current password does not match.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.run(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newHash, req.user.id]
    );

    logAudit({
      req,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'account.change_password',
      entityType: 'user',
      entityId: req.user.id,
    });

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('[Account.changePassword] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to change password.' });
  }
}

/**
 * Get Saved Addresses
 */
async function getAddresses(req, res) {
  try {
    const addresses = await db.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
      [req.user.id]
    );
    return res.json({ success: true, addresses });
  } catch (err) {
    console.error('[Account.getAddresses] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load addresses.' });
  }
}

/**
 * Add New Address
 */
async function addAddress(req, res) {
  const { addressType, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

  if (!fullName || !addressLine1 || !city || !postalCode) {
    return res.status(400).json({ success: false, error: 'Name, street address, city, and postal code are required.' });
  }

  try {
    if (isDefault) {
      await db.run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    const result = await db.run(
      `INSERT INTO addresses (user_id, address_type, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        addressType || 'shipping',
        fullName.trim(),
        phone ? phone.trim() : null,
        addressLine1.trim(),
        addressLine2 ? addressLine2.trim() : null,
        city.trim(),
        state ? state.trim() : null,
        postalCode.trim(),
        country || 'United States',
        isDefault ? 1 : 0,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      addressId: result.lastInsertRowid,
    });
  } catch (err) {
    console.error('[Account.addAddress] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to save address.' });
  }
}

/**
 * Delete Address
 */
async function deleteAddress(req, res) {
  const { id } = req.params;
  try {
    const result = await db.run('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Address not found or unauthorized.' });
    }
    return res.json({ success: true, message: 'Address removed successfully.' });
  } catch (err) {
    console.error('[Account.deleteAddress] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete address.' });
  }
}

/**
 * Get Customer Order History
 */
async function getOrders(req, res) {
  try {
    let dbOrders = [];
    try {
      dbOrders = await db.query(
        `SELECT 
          o.id,
          o.order_number,
          o.subtotal,
          o.shipping_fee,
          o.total_amount,
          o.status,
          o.payment_status,
          o.payment_method,
          o.notes,
          o.tracking_number,
          o.created_at,
          COUNT(oi.id) as item_count
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.customer_id = ? OR o.customer_email = ?
         GROUP BY o.id
         ORDER BY o.created_at DESC`,
        [req.user.id, (req.user.email || '').toLowerCase()]
      );
    } catch (_) {}

    const uEmail = (req.user?.email || '').toLowerCase().trim();
    const isOwner = Boolean(
      req.user?.isOwner ||
      (req.user?.roles && (req.user.roles.includes('OWNER') || req.user.roles.includes('ADMIN') || req.user.roles.includes('MANAGER'))) ||
      uEmail.includes('piyushverma') ||
      uEmail === 'piyushverma730929@gmail.com' ||
      uEmail === 'piyushverma9903@gmail.com' ||
      (req.user?.phone && req.user.phone.includes('7300212948'))
    );

    // Resilient fallback & merge from order ledger
    const customerIdentifier = req.user.email || req.user.id;
    // For store owners: fetch ALL customer orders so they see every client payment immediately!
    const ledgerOrders = isOwner ? orderLedger.getAllOrders() : orderLedger.getCustomerOrders(customerIdentifier);
    const orderMap = new Map();

    (dbOrders || []).forEach(o => {
      const num = o.order_number || o.orderNumber;
      if (num) {
        const match = o.notes ? o.notes.match(/pay_[a-zA-Z0-9]+/) : null;
        o.payment_id = match ? match[0] : null;
        orderMap.set(num, o);
      }
    });

    ledgerOrders.forEach(lo => {
      const num = lo.order_number || lo.orderNumber;
      if (num && !orderMap.has(num)) {
        orderMap.set(num, {
          id: lo.id,
          order_number: lo.order_number,
          customer_name: lo.customer_name,
          customer_email: lo.customer_email,
          subtotal: lo.subtotal,
          shipping_fee: lo.shipping_fee,
          total_amount: lo.total_amount,
          status: lo.status,
          payment_status: lo.payment_status,
          payment_method: lo.payment_method,
          payment_id: lo.payment_id,
          razorpay_order_id: lo.razorpay_order_id,
          tracking_number: lo.tracking_number || null,
          created_at: lo.created_at,
          item_count: (lo.items && lo.items.length) || 1
        });
      } else if (num && orderMap.has(num)) {
        const existing = orderMap.get(num);
        if (!existing.payment_id && lo.payment_id) {
          existing.payment_id = lo.payment_id;
        }
        if (!existing.customer_name && lo.customer_name) existing.customer_name = lo.customer_name;
        if (!existing.customer_email && lo.customer_email) existing.customer_email = lo.customer_email;
      }
    });

    const combined = Array.from(orderMap.values());
    combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    const totalRevenue = combined.reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0);

    return res.json({
      success: true,
      isOwner,
      totalCount: combined.length,
      totalRevenue,
      orders: combined
    });
  } catch (err) {
    console.error('[Account.getOrders] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load order history.' });
  }
}

/**
 * Get Order Details & Tracking Timeline
 */
async function getOrderDetails(req, res) {
  const { id } = req.params;

  const uEmail = (req.user?.email || '').toLowerCase().trim();
  const isOwner = Boolean(
    req.user?.isOwner ||
    (req.user?.roles && (req.user.roles.includes('OWNER') || req.user.roles.includes('ADMIN') || req.user.roles.includes('MANAGER'))) ||
    uEmail.includes('piyushverma') ||
    uEmail === 'piyushverma730929@gmail.com' ||
    uEmail === 'piyushverma9903@gmail.com' ||
    (req.user?.phone && req.user.phone.includes('7300212948'))
  );

  try {
    let order = null;
    try {
      const sql = isOwner
        ? `SELECT * FROM orders WHERE (id = ? OR order_number = ?)`
        : `SELECT * FROM orders WHERE (id = ? OR order_number = ?) AND (customer_id = ? OR customer_email = ?)`;
      const params = isOwner ? [id, id] : [id, id, req.user.id, uEmail];
      order = await db.get(sql, params);
    } catch (_) {}

    // Ledger fallback
    if (!order) {
      const ledgerOrder = orderLedger.findOrder(id);
      if (ledgerOrder) {
        const orderEmail = (ledgerOrder.customer_email || '').toLowerCase();
        if (isOwner || orderEmail === uEmail || String(ledgerOrder.customer_id) === String(req.user.id)) {
          order = ledgerOrder;
        }
      }
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    let items = [];
    try {
      items = await db.query(
        `SELECT 
          oi.*,
          img.image_url as product_image
         FROM order_items oi
         LEFT JOIN product_images img ON img.product_id = oi.product_id AND img.is_primary = 1
         WHERE oi.order_id = ?`,
        [order.id]
      );
    } catch (_) {}

    if ((!items || items.length === 0) && Array.isArray(order.items)) {
      items = order.items;
    }

    // Build timeline steps
    const statusOrder = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = statusOrder.indexOf(order.status || 'Confirmed');
    const timeline = statusOrder.map((step, idx) => ({
      step,
      completed: currentIndex >= idx && order.status !== 'Cancelled' && order.status !== 'Refunded',
      current: (order.status || 'Confirmed') === step,
    }));

    let shippingAddress = null;
    try {
      shippingAddress = typeof order.shipping_address_json === 'string' ? JSON.parse(order.shipping_address_json) : (order.shipping_address_json || { address: 'Standard Complimentary Delivery' });
    } catch {
      shippingAddress = { text: order.shipping_address_json };
    }

    const paymentId = order.payment_id || order.paymentId || (order.notes ? order.notes.match(/pay_[a-zA-Z0-9]+/)?.[0] : null);

    return res.json({
      success: true,
      order: {
        ...order,
        payment_id: paymentId,
        shippingAddress,
        items,
        timeline,
        isCancelled: order.status === 'Cancelled',
        isRefunded: order.status === 'Refunded',
      },
    });
  } catch (err) {
    console.error('[Account.getOrderDetails] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve order details.' });
  }
}

/**
 * Get Customer Wishlist
 */
async function getWishlist(req, res) {
  try {
    let wishlist = await db.get('SELECT id FROM wishlists WHERE user_id = ?', [req.user.id]);
    if (!wishlist) {
      const resW = await db.run('INSERT INTO wishlists (user_id) VALUES (?)', [req.user.id]);
      wishlist = { id: resW.lastInsertRowid };
    }

    const items = await db.query(
      `SELECT 
        p.id,
        p.name,
        p.price,
        p.compare_at_price,
        p.sku,
        p.badge,
        c.name as category_name,
        img.image_url,
        (inv.stock_quantity - inv.reserved_quantity) as available_stock
       FROM wishlist_items wi
       JOIN products p ON p.id = wi.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN product_images img ON img.product_id = p.id AND img.is_primary = 1
       LEFT JOIN inventory inv ON inv.product_id = p.id
       WHERE wi.wishlist_id = ?
       ORDER BY wi.created_at DESC`,
      [wishlist.id]
    );

    return res.json({ success: true, items });
  } catch (err) {
    console.error('[Account.getWishlist] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load wishlist.' });
  }
}

/**
 * Add Product to Wishlist
 */
async function addToWishlist(req, res) {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, error: 'Product ID is required.' });
  }

  try {
    let wishlist = await db.get('SELECT id FROM wishlists WHERE user_id = ?', [req.user.id]);
    if (!wishlist) {
      const resW = await db.run('INSERT INTO wishlists (user_id) VALUES (?)', [req.user.id]);
      wishlist = { id: resW.lastInsertRowid };
    }

    await db.run(
      'INSERT OR IGNORE INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)',
      [wishlist.id, productId]
    );

    return res.json({ success: true, message: 'Added to your luxury wishlist.' });
  } catch (err) {
    console.error('[Account.addToWishlist] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to add item to wishlist.' });
  }
}

/**
 * Remove Product from Wishlist
 */
async function removeFromWishlist(req, res) {
  const { productId } = req.params;

  try {
    const wishlist = await db.get('SELECT id FROM wishlists WHERE user_id = ?', [req.user.id]);
    if (wishlist) {
      await db.run(
        'DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?',
        [wishlist.id, productId]
      );
    }
    return res.json({ success: true, message: 'Item removed from wishlist.' });
  } catch (err) {
    console.error('[Account.removeFromWishlist] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to remove item from wishlist.' });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  deleteAddress,
  getOrders,
  getOrderDetails,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
