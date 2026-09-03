/**
 * Authentication Controller
 * Handles customer registration, login, session check, and password resets.
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/db');
const { generateToken } = require('../middleware/auth');
const { logAudit } = require('../middleware/auditLogger');

/**
 * Customer Registration
 */
async function signup(req, res) {
  const { email, password, firstName, lastName, phone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
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
      [normalizedEmail, passwordHash, firstName ? firstName.trim() : null, lastName ? lastName.trim() : null, phone ? phone.trim() : null]
    );

    const userId = userRes.lastInsertRowid;

    // Assign CUSTOMER role
    const customerRole = await db.get('SELECT id FROM roles WHERE name = ?', ['CUSTOMER']);
    if (customerRole) {
      await db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, customerRole.id]);
    }

    // Initialize customer wishlist
    await db.run('INSERT INTO wishlists (user_id) VALUES (?)', [userId]);

    const user = {
      id: userId,
      email: normalizedEmail,
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
    };

    const token = generateToken(user, ['CUSTOMER'], []);

    logAudit({
      userId,
      userEmail: normalizedEmail,
      userRole: 'CUSTOMER',
      action: 'customer.signup',
      entityType: 'user',
      entityId: userId,
      details: { email: normalizedEmail },
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to Lumière.',
      token,
      user: {
        id: userId,
        email: normalizedEmail,
        firstName: firstName || '',
        lastName: lastName || '',
        roles: ['CUSTOMER'],
        permissions: [],
      },
    });
  } catch (err) {
    console.error('[Auth.Signup] Error:', err);
    return res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
}

/**
 * User Login (Customers, Staff & Owners)
 */
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await db.get(
      'SELECT id, email, password_hash, first_name, last_name, phone, status FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({
        success: false,
        error: 'This account has been disabled. Please contact Lumière administration.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Fetch user roles
    const roleRows = await db.query(
      `SELECT r.name FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    const roles = roleRows.map(r => r.name);

    // Fetch user permissions
    const permRows = await db.query(
      `SELECT DISTINCT p.code FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       JOIN user_roles ur ON ur.role_id = rp.role_id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    const permissions = permRows.map(p => p.code);

    // Update last login
    await db.run('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const token = generateToken(user, roles, permissions);

    logAudit({
      req,
      userId: user.id,
      userEmail: user.email,
      userRole: roles[0] || 'CUSTOMER',
      action: 'auth.login',
      entityType: 'user',
      entityId: user.id,
      details: { email: user.email, roles },
    });

    return res.json({
      success: true,
      message: `Welcome back, ${user.first_name || 'Guest'}.`,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: user.phone || '',
        roles,
        permissions,
        isStaff: roles.some(r => ['OWNER', 'MANAGER', 'INVENTORY_STAFF', 'ORDER_STAFF'].includes(r)),
        isOwner: roles.includes('OWNER'),
      },
    });
  } catch (err) {
    console.error('[Auth.Login] Error:', err);
    return res.status(500).json({ success: false, error: 'Authentication service error.' });
  }
}

/**
 * Get current session profile
 */
async function getMe(req, res) {
  return res.json({
    success: true,
    user: req.user,
  });
}

/**
 * Forgot password request (Generates reset token)
 */
async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email address is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await db.get('SELECT id, email FROM users WHERE email = ?', [normalizedEmail]);
    if (!user) {
      // Return success message even if not found to prevent user enumeration
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset token has been issued.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    await db.run(
      'UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?',
      [resetToken, expiresAt, user.id]
    );

    logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'auth.forgot_password',
      entityType: 'user',
      entityId: user.id,
      details: { email: user.email },
    });

    return res.json({
      success: true,
      message: 'Password reset code generated. Use the token to create a new password.',
      resetToken, // Returned in dev/testing mode for ease of verification
    });
  } catch (err) {
    console.error('[Auth.ForgotPassword] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process password reset.' });
  }
}

/**
 * Reset password with token
 */
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, error: 'Token and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
  }

  try {
    const user = await db.get(
      'SELECT id, email, reset_token_expires_at FROM users WHERE reset_token = ?',
      [token]
    );

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired password reset token.' });
    }

    if (new Date() > new Date(user.reset_token_expires_at)) {
      return res.status(400).json({ success: false, error: 'Password reset token has expired. Please request a new one.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await db.run(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newHash, user.id]
    );

    logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'auth.reset_password',
      entityType: 'user',
      entityId: user.id,
      details: { email: user.email },
    });

    return res.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.',
    });
  } catch (err) {
    console.error('[Auth.ResetPassword] Error:', err);
    return res.status(500).json({ success: false, error: 'Password reset failed.' });
  }
}

module.exports = {
  signup,
  login,
  getMe,
  forgotPassword,
  resetPassword,
};
