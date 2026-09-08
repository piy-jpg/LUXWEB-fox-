/**
 * Rate Limiting Middleware
 * Protects authentication endpoints from brute force attempts
 */
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 login/signup attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 600, // Generous ceiling for active real-time cross-tab updates
  skip: (req) => {
    const url = req.originalUrl || req.url || '';
    return url.includes('/products/stream') ||
           url.includes('/products/version') ||
           url.includes('/health');
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please slow down.',
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
};
