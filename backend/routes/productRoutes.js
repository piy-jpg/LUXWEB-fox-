const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getCategories,
  streamProducts,
  getCatalogVersion
} = require('../controllers/productController');

router.get('/stream', streamProducts);
router.get('/version', getCatalogVersion);
router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;
