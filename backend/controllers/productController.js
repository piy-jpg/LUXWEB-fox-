/**
 * Product Controller
 * Handles product listing, filtering, and retrieval
 */
const path = require('path');
const fs = require('fs');

// Load full 150-product luxury catalogue from seeds
let PRODUCTS = [];
try {
  const seedFile = path.resolve(__dirname, '../../database/seeds/seed_products.json');
  if (fs.existsSync(seedFile)) {
    PRODUCTS = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
  }
} catch (e) {
  console.warn('[ProductController] Warning loading seed_products.json:', e.message);
}

exports.getProducts = (req, res) => {
  const { category, search, minPrice, maxPrice, sort } = req.query;
  let results = [...PRODUCTS];

  if (category && category !== 'all') {
    results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  }

  if (minPrice) {
    results = results.filter(p => p.price >= parseFloat(minPrice));
  }

  if (maxPrice) {
    results = results.filter(p => p.price <= parseFloat(maxPrice));
  }

  if (sort === 'price-asc') results.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') results.sort((a, b) => b.price - a.price);
  if (sort === 'name-asc') results.sort((a, b) => a.name.localeCompare(b.name));

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
};

exports.getProductById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = PRODUCTS.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ success: false, message: `Product #${id} not found` });
  }

  res.json({ success: true, data: product });
};
