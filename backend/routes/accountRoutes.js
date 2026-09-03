/**
 * Customer Account Routes
 * All routes protected: Requires valid customer or staff token.
 */
const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/profile', accountController.getProfile);
router.put('/profile', accountController.updateProfile);
router.put('/change-password', accountController.changePassword);

router.get('/addresses', accountController.getAddresses);
router.post('/addresses', accountController.addAddress);
router.delete('/addresses/:id', accountController.deleteAddress);

router.get('/orders', accountController.getOrders);
router.get('/orders/:id', accountController.getOrderDetails);

router.get('/wishlist', accountController.getWishlist);
router.post('/wishlist', accountController.addToWishlist);
router.delete('/wishlist/:productId', accountController.removeFromWishlist);

module.exports = router;
