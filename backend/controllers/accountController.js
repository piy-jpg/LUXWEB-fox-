/**
 * Customer Account Controller
 * Handles profile, saved addresses, order history & tracking,
 * and wishlist synchronization.
 */
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { logAudit } = require('../middleware/auditLogger');

/**
 * Get Customer Profile Overview
 */
async function getProfile(req, res) {
  try {
    const user = await db.get(
      'SELECT id, email, first_name, last_name, phone, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    const orderStats = await db.get(
      `SELECT COUNT(*) as order_count, COALESCE(SUM(total_amount), 0) as total_spent 
       FROM orders WHERE customer_id = ? OR customer_email = ?`,
      [req.user.id, req.user.email]
    );

    const wishlistStats = await db.get(
      `SELECT COUNT(*) as wishlist_count FROM wishlist_items wi
       JOIN wishlists w ON w.id = wi.wishlist_id
       WHERE w.user_id = ?`,
      [req.user.id]
    );

    return res.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: user.phone || '',
        memberSince: user.created_at,
        orderCount: orderStats ? orderStats.order_count : 0,
        totalSpent: orderStats ? parseFloat(orderStats.total_spent) : 0,
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
  const { firstName, lastName, phone } = req.body;

  try {
    await db.run(
      `UPDATE users 
       SET first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [firstName ? firstName.trim() : null, lastName ? lastName.trim() : null, phone ? phone.trim() : null, req.user.id]
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
    const orders = await db.query(
      `SELECT 
        o.id,
        o.order_number,
        o.subtotal,
        o.shipping_fee,
        o.total_amount,
        o.status,
        o.payment_status,
        o.tracking_number,
        o.created_at,
        COUNT(oi.id) as item_count
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.customer_id = ? OR o.customer_email = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id, req.user.email]
    );

    return res.json({ success: true, orders });
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

  try {
    const order = await db.get(
      `SELECT * FROM orders 
       WHERE (id = ? OR order_number = ?) AND (customer_id = ? OR customer_email = ?)`,
      [id, id, req.user.id, req.user.email]
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const items = await db.query(
      `SELECT 
        oi.*,
        img.image_url as product_image
       FROM order_items oi
       LEFT JOIN product_images img ON img.product_id = oi.product_id AND img.is_primary = 1
       WHERE oi.order_id = ?`,
      [order.id]
    );

    // Build timeline steps
    const statusOrder = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const timeline = statusOrder.map((step, idx) => ({
      step,
      completed: currentIndex >= idx && order.status !== 'Cancelled' && order.status !== 'Refunded',
      current: order.status === step,
    }));

    let shippingAddress = null;
    try {
      shippingAddress = JSON.parse(order.shipping_address_json);
    } catch {
      shippingAddress = { text: order.shipping_address_json };
    }

    return res.json({
      success: true,
      order: {
        ...order,
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
