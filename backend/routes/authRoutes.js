/**
 * Authentication Routes
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.post('/google', authLimiter, authController.googleAuth);

module.exports = router;
