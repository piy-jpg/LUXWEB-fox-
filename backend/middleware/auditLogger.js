/**
 * Audit Logging Service
 * Records critical admin/staff actions to the audit_logs table
 */
const db = require('../config/db');

async function logAudit({ req, userId, userEmail, userRole, action, entityType, entityId, details }) {
  try {
    const effectiveUserId = userId || (req && req.user ? req.user.id : null);
    const effectiveEmail = userEmail || (req && req.user ? req.user.email : null);
    const effectiveRole = userRole || (req && req.user && req.user.roles ? req.user.roles[0] : 'SYSTEM');
    const ipAddress = req && req.headers ? (req.headers['x-forwarded-for'] || (req.socket ? req.socket.remoteAddress : null) || null) : null;
    const detailsJson = typeof details === 'object' ? JSON.stringify(details) : (details || null);

    await db.run(
      `INSERT INTO audit_logs (user_id, user_email, user_role, action, entity_type, entity_id, details_json, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [effectiveUserId, effectiveEmail, effectiveRole, action, entityType, String(entityId || ''), detailsJson, ipAddress]
    );
  } catch (err) {
    console.error('[AuditLogger] Failed to write audit log:', err.message);
  }
}

module.exports = { logAudit };
