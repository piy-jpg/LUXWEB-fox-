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
  const uEmail = (user.email || '').toLowerCase().trim();
  const isOwner = Boolean(
    user.isOwner ||
    (roles && roles.includes('OWNER')) ||
    uEmail.includes('piyushverma') ||
    uEmail === 'piyushverma730929@gmail.com' ||
    uEmail === 'piyushverma9903@gmail.com' ||
    (user.phone && user.phone.includes('7300212948'))
  );
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.first_name || user.firstName || '',
      lastName: user.last_name || user.lastName || '',
      phone: user.phone || '',
      roles: (roles && roles.length) ? roles : ['CUSTOMER'],
      permissions: permissions || [],
      isOwner,
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

    // 1. Fetch live user status and permissions from database
    let user = null;
    if (decoded.id) {
      user = await db.get(
        'SELECT id, email, first_name, last_name, phone, status FROM users WHERE id = ?',
        [decoded.id]
      );
    }

    // 2. If not found by ID (e.g. serverless cold start / fresh lambda container), resolve by email or phone
    if (!user && decoded.email) {
      user = await db.get('SELECT id, email, first_name, last_name, phone, status FROM users WHERE email = ?', [decoded.email.toLowerCase()]);
    }
    if (!user && decoded.phone) {
      const last10 = decoded.phone.replace(/\D/g, '').slice(-10);
      user = await db.get('SELECT id, email, first_name, last_name, phone, status FROM users WHERE phone LIKE ?', [`%${last10}`]);
    }

    const dEmail = (decoded.email || '').toLowerCase().trim();
    const isOwnerUser = Boolean(
      decoded.isOwner ||
      dEmail.includes('piyushverma') ||
      dEmail === 'piyushverma730929@gmail.com' ||
      dEmail === 'piyushverma9903@gmail.com' ||
      (decoded.phone && decoded.phone.includes('7300212948'))
    );

    // 3. If user not in DB (e.g. serverless cold start / fresh lambda container on Vercel),
    // auto-provision or restore the verified user so session is never lost!
    if (!user && (decoded.email || decoded.id)) {
      try {
        const uEmail = (decoded.email || `client_${decoded.id || Date.now()}@lumiere.luxury`).toLowerCase();
        const uFirst = decoded.firstName || (decoded.email ? decoded.email.split('@')[0] : 'Valued');
        const uLast = decoded.lastName || 'Client';
        const uPhone = decoded.phone || null;

        try {
          if (decoded.id && typeof decoded.id === 'number') {
            await db.run(
              `INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, phone, status)
               VALUES (?, ?, 'oauth_user', ?, ?, ?, 'active')`,
              [decoded.id, uEmail, uFirst, uLast, uPhone]
            );
          } else {
            await db.run(
              `INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, phone, status)
               VALUES (?, 'oauth_user', ?, ?, ?, 'active')`,
              [uEmail, uFirst, uLast, uPhone]
            );
          }
          user = await db.get('SELECT id, email, first_name, last_name, phone, status FROM users WHERE email = ?', [uEmail]);
          if (user) {
            // Ensure wishlist exists
            try { await db.run('INSERT OR IGNORE INTO wishlists (user_id) VALUES (?)', [user.id]); } catch {}
            // Ensure role exists
            const assignedRoleName = isOwnerUser ? 'OWNER' : ((decoded.roles && decoded.roles[0]) || 'CUSTOMER');
            const roleRow = await db.get('SELECT id FROM roles WHERE name = ?', [assignedRoleName]);
            if (roleRow) {
              try { await db.run('INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)', [user.id, roleRow.id]); } catch {}
            }
          }
        } catch (dbErr) {
          console.warn('[Auth Middleware] DB user auto-provision notice:', dbErr.message);
        }
      } catch (e) {
        console.warn('[Auth Middleware] Auto-sync warning:', e.message);
      }
    }

    // 4. Fallback in-memory reconstruction if DB is read-only or unreachable
    if (!user) {
      if (isOwnerUser) {
        user = {
          id: decoded.id || 1,
          email: 'piyushverma730929@gmail.com',
          first_name: 'Piyush',
          last_name: 'Verma',
          phone: '+91 7300212948',
          status: 'active'
        };
      } else if (decoded.email || decoded.id) {
        user = {
          id: decoded.id || Date.now(),
          email: decoded.email || 'client@lumiere.luxury',
          first_name: decoded.firstName || (decoded.email ? decoded.email.split('@')[0] : 'Valued'),
          last_name: decoded.lastName || 'Client',
          phone: decoded.phone || '',
          status: 'active'
        };
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'User account not found.' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been disabled. Please contact customer support.',
      });
    }

    // Fetch user roles and permissions
    let roles = [];
    let permissions = [];

    if (isOwnerUser) {
      roles = ['OWNER', 'ADMIN', 'MANAGER'];
      permissions = ['*'];
    } else {
      try {
        const roleRows = await db.query(
          `SELECT r.name FROM roles r
           JOIN user_roles ur ON ur.role_id = r.id
           WHERE ur.user_id = ?`,
          [user.id]
        );
        roles = roleRows.map(r => r.name);

        const permRows = await db.query(
          `SELECT DISTINCT p.code FROM permissions p
           JOIN role_permissions rp ON rp.permission_id = p.id
           JOIN user_roles ur ON ur.role_id = rp.role_id
           WHERE ur.user_id = ?`,
          [user.id]
        );
        permissions = permRows.map(p => p.code);
      } catch (roleErr) {
        console.warn('[Auth Middleware] Role query notice:', roleErr.message);
      }

      if (!roles.length && decoded.roles && Array.isArray(decoded.roles)) {
        roles = decoded.roles;
      }
      if (!roles.length) {
        roles = ['CUSTOMER'];
      }
      if (!permissions.length && decoded.permissions && Array.isArray(decoded.permissions)) {
        permissions = decoded.permissions;
      }
    }

    const upperRoles = roles.map(r => r.toUpperCase());

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name || user.firstName || decoded.firstName || '',
      lastName: user.last_name || user.lastName || decoded.lastName || '',
      phone: user.phone || decoded.phone || '',
      roles,
      permissions,
      isOwner: isOwnerUser || upperRoles.includes('OWNER'),
      isStaff: isOwnerUser || upperRoles.some(r => ['OWNER', 'ADMIN', 'MANAGER', 'INVENTORY_STAFF', 'ORDER_STAFF'].includes(r)),
      isCustomer: upperRoles.includes('CUSTOMER'),
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

    if (req.user.isOwner) {
      return next();
    }

    // Strict security: Customers are never permitted to administrative routes
    if (req.user.isCustomer && !allowedRoles.includes('CUSTOMER')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Administrative privileges required.',
      });
    }

    const upperAllowed = allowedRoles.map(r => r.toUpperCase());
    const hasRole = req.user.roles.some(r => upperAllowed.includes(r.toUpperCase()));
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

    // Owner has universal administrative permissions
    if (req.user.isOwner || (req.user.permissions && req.user.permissions.includes('*'))) {
      return next();
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
