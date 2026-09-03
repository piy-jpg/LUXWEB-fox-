const express = require('express');
const router = express.Router();
const { getReviews, addReview } = require('../controllers/reviewController');

router.get('/', getReviews);
router.post('/', addReview);

module.exports = router;
