/**
 * Authentication & Role-Based Access Control (RBAC) Middleware
 * Enforces JWT verification, role hierarchies, and permission codes server-side.
 */
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'lumiere_luxury_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate a secure signed JWT
 */
function generateToken(user, roles = [], permissions = []) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roles,
      permissions,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token and attach user + roles + permissions to req.user
 */
async function authenticateToken(req, res, next) {
  let token = null;

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch live user status and permissions from database
    const user = await db.get(
      'SELECT id, email, first_name, last_name, phone, status FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'User account not found.' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been disabled. Please contact customer support.',
      });
    }

    // Fetch user roles
    const roleRows = await db.query(
      `SELECT r.name FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    const roles = roleRows.map(r => r.name);

    // Fetch user permissions through roles
    const permRows = await db.query(
      `SELECT DISTINCT p.code FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       JOIN user_roles ur ON ur.role_id = rp.role_id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    const permissions = permRows.map(p => p.code);

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      roles,
      permissions,
      isOwner: roles.includes('OWNER'),
      isStaff: roles.some(r => ['OWNER', 'MANAGER', 'INVENTORY_STAFF', 'ORDER_STAFF'].includes(r)),
      isCustomer: roles.includes('CUSTOMER'),
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid token. Please sign in again.',
    });
  }
}

/**
 * Middleware: Require one of the specified roles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    // Strict security: Customers are never permitted to administrative routes
    if (req.user.isCustomer && !allowedRoles.includes('CUSTOMER')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Administrative privileges required.',
      });
    }

    const hasRole = req.user.roles.some(r => allowedRoles.includes(r));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: `Access denied: Requires ${allowedRoles.join(' or ')} role.`,
      });
    }

    next();
  };
}

/**
 * Middleware: Require a specific permission code
 */
function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    // Owner has superuser bypass
    if (req.user.isOwner) {
      return next();
    }

    // Customer has no admin permissions
    if (req.user.isCustomer) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Administrative privileges required.',
      });
    }

    const hasPermission = requiredPermissions.every(p => req.user.permissions.includes(p));
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: `Access denied: Missing required permission (${requiredPermissions.join(', ')}).`,
      });
    }

    next();
  };
}

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticateToken,
  requireRole,
  requirePermission,
};
