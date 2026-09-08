/**
 * Real-Time Product Controller (productController.js)
 * Handles live SQLite database querying, active filtering,
 * Server-Sent Events (SSE) streaming, and catalog mutation broadcasting.
 */
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const productLedger = require('../services/productLedger');

// In-memory catalog version tracker
let catalogVersion = Date.now();

// Active SSE client connections
const sseClients = new Set();

// Send keep-alive heartbeat ping every 25 seconds
setInterval(() => {
  const pingPayload = `event: ping\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.res.write(pingPayload);
    } catch {
      sseClients.delete(client);
    }
  }
}, 25000).unref();

/**
 * Broadcast catalog mutation to all connected SSE clients (Storefront and Admin)
 */
function broadcastCatalogUpdate(payload = {}) {
  catalogVersion = Date.now();
  const eventData = {
    version: catalogVersion,
    action: payload.action || 'catalog_mutation',
    productId: payload.productId || null,
    categoryId: payload.categoryId || null,
    details: payload.details || {},
    timestamp: catalogVersion
  };

  const formattedMsg = `event: catalog_mutation\ndata: ${JSON.stringify(eventData)}\n\n`;
  for (const client of sseClients) {
    try {
      client.res.write(formattedMsg);
    } catch {
      sseClients.delete(client);
    }
  }

  // Keep fallback seed file in sync with real-time mutations
  syncFallbackSeeds();
}

/**
 * Fallback static seed products in case DB is unreachable
 */
let FALLBACK_PRODUCTS = [];
const seedFilePath = path.resolve(__dirname, '../../database/seeds/seed_products.json');
const frontendSeedPath = path.resolve(__dirname, '../../frontend/data/products.json');

try {
  if (fs.existsSync(seedFilePath)) {
    FALLBACK_PRODUCTS = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));
  }
} catch (e) {
  console.warn('[ProductController] Fallback seeds notice:', e.message);
}

async function syncFallbackSeeds() {
  try {
    const rows = await db.query(`
      SELECT 
        p.id, p.sku, p.name, p.slug, p.description, p.price, p.compare_at_price,
        p.category_id, p.collection_id, p.status, p.is_featured, p.is_new_arrival, p.is_bestseller,
        p.badge, p.badge_type, p.stars, p.created_at, p.updated_at,
        c.name as category_name, c.slug as category_slug,
        img.image_url as primary_image,
        inv.stock_quantity, inv.reserved_quantity,
        (COALESCE(inv.stock_quantity, 0) - COALESCE(inv.reserved_quantity, 0)) as available_quantity,
        inv.low_stock_threshold
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_images img ON img.product_id = p.id AND img.is_primary = 1
      LEFT JOIN inventory inv ON inv.product_id = p.id
      WHERE p.status = 'active'
      ORDER BY p.is_new_arrival DESC, p.id DESC
    `);
    if (Array.isArray(rows) && rows.length > 0) {
      FALLBACK_PRODUCTS = rows.map(formatProductRow);
      const jsonStr = JSON.stringify(FALLBACK_PRODUCTS, null, 2);
      try { fs.writeFileSync(seedFilePath, jsonStr, 'utf8'); } catch {}
      try { fs.writeFileSync(frontendSeedPath, jsonStr, 'utf8'); } catch {}
    }
  } catch (err) {
    // Non-blocking fallback sync
  }
}
// Sync on boot
setTimeout(syncFallbackSeeds, 1000).unref();

/**
 * Helper to normalize DB rows into client-compatible luxury product objects
 */
function formatProductRow(row) {
  const avail = row.available_quantity !== null && row.available_quantity !== undefined
    ? row.available_quantity
    : (row.stock_quantity !== null && row.stock_quantity !== undefined ? row.stock_quantity : 50);
  const threshold = row.low_stock_threshold || 5;

  let fallbackImg = 'images/skincare_products_1788328338930.jpg';
  if (row.category_slug === 'fragrance') fallbackImg = 'images/perfume_collection_1788328378783.jpg';
  else if (row.category_slug === 'makeup') fallbackImg = 'images/makeup_products_1788328354838.jpg';
  else if (row.category_slug === 'haircare') fallbackImg = 'images/haircare_luxury.jpg';

  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    category_id: row.category_id,
    category: row.category_slug || 'skincare',
    categoryLabel: row.category_name || 'Skincare',
    desc: row.description || '',
    description: row.description || '',
    price: row.price,
    oldPrice: row.compare_at_price || null,
    compare_at_price: row.compare_at_price || null,
    badge: row.badge || (row.is_new_arrival ? 'New' : (row.is_bestseller ? 'Bestseller' : null)),
    badgeType: row.badge_type || (row.badge ? (row.badge.toLowerCase().includes('new') ? 'new' : 'best') : (row.is_new_arrival ? 'new' : (row.is_bestseller ? 'best' : null))),
    stars: row.stars || 5,
    rating: row.stars || 5,
    reviewsCount: 85 + ((row.id * 19) % 240),
    img: row.primary_image || fallbackImg,
    primary_image: row.primary_image || fallbackImg,
    brand: 'LUMIÈRE',
    status: row.status || 'active',
    isFeatured: Boolean(row.is_featured),
    isBestseller: Boolean(row.is_bestseller),
    isNewArrival: Boolean(row.is_new_arrival),
    stock_quantity: row.stock_quantity !== null && row.stock_quantity !== undefined ? row.stock_quantity : 50,
    reserved_quantity: row.reserved_quantity !== null && row.reserved_quantity !== undefined ? row.reserved_quantity : 0,
    available_quantity: avail,
    low_stock_threshold: threshold,
    is_low_stock: avail <= threshold && avail > 0,
    is_out_of_stock: avail <= 0,
    updated_at: row.updated_at
  };
}

/**
 * GET /api/products
 * Retrieve live catalog from SQLite database with inventory and images
 */
async function getProducts(req, res) {
  const { category, search, minPrice, maxPrice, sort, status, limit = 1000 } = req.query;

  try {
    let sql = `
      SELECT 
        p.id, p.sku, p.name, p.slug, p.description, p.price, p.compare_at_price,
        p.category_id, p.collection_id, p.status, p.is_featured, p.is_new_arrival, p.is_bestseller,
        p.badge, p.badge_type, p.stars, p.created_at, p.updated_at,
        c.name as category_name, c.slug as category_slug,
        img.image_url as primary_image,
        inv.stock_quantity, inv.reserved_quantity,
        (COALESCE(inv.stock_quantity, 0) - COALESCE(inv.reserved_quantity, 0)) as available_quantity,
        inv.low_stock_threshold
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_images img ON img.product_id = p.id AND img.is_primary = 1
      LEFT JOIN inventory inv ON inv.product_id = p.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by status: public storefront default is 'active'
    if (status && status !== 'all') {
      sql += ' AND p.status = ?';
      params.push(status);
    } else if (!status) {
      // By default, only active products are public
      sql += " AND p.status = 'active'";
    }

    if (category && category !== 'all') {
      sql += " AND (c.slug = ? OR c.name = ?) AND COALESCE(c.is_active, 1) = 1 AND COALESCE(c.status, 'active') = 'active'";
      params.push(category, category);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      sql += ' AND p.price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      sql += ' AND p.price <= ?';
      params.push(parseFloat(maxPrice));
    }

    // Sorting (default to newest arrivals & latest curations so owner-listed products are immediately prominent)
    if (sort === 'price-asc') sql += ' ORDER BY p.price ASC, p.id DESC';
    else if (sort === 'price-desc') sql += ' ORDER BY p.price DESC, p.id DESC';
    else if (sort === 'name-asc') sql += ' ORDER BY p.name ASC';
    else if (sort === 'rating') sql += ' ORDER BY p.stars DESC, p.id DESC';
    else if (sort === 'newest') sql += ' ORDER BY p.is_new_arrival DESC, p.id DESC';
    else sql += ' ORDER BY p.is_new_arrival DESC, p.id DESC';

    sql += ' LIMIT ?';
    params.push(parseInt(limit, 10) || 1000);

    let rows = [];
    try {
      rows = await db.query(sql, params);
    } catch (_) {}

    let results = (rows && rows.length > 0) ? rows.map(formatProductRow) : [];
    if (results.length === 0) {
      results = productLedger.getAllProducts({ category, search, minPrice, maxPrice, sort, status, limit });
    }

    let categories = [];
    try {
      categories = await db.query(`
        SELECT c.id, c.name, c.slug, c.description, c.image_url,
               COALESCE(c.is_active, 1) as is_active,
               COALESCE(c.status, 'active') as status,
               COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
        WHERE COALESCE(c.is_active, 1) = 1 AND COALESCE(c.status, 'active') = 'active'
        GROUP BY c.id
        ORDER BY c.id ASC
      `);
    } catch (_) {}

    if (!categories || categories.length === 0) {
      categories = productLedger.getAllCategories();
    }

    return res.json({
      success: true,
      count: results.length,
      catalogVersion,
      data: results,
      products: results,
      categories
    });
  } catch (err) {
    console.error('[ProductController.getProducts] DB Query error, using fallback:', err.message);
    const results = productLedger.getAllProducts({ category, search, minPrice, maxPrice, sort, status, limit });
    return res.json({
      success: true,
      count: results.length,
      catalogVersion,
      data: results,
      products: results,
      categories: productLedger.getAllCategories()
    });
  }
}

/**
 * GET /api/products/categories or /api/categories
 * Retrieve active categories with product counts (or all if include_suspended=true)
 */
async function getCategories(req, res) {
  try {
    const includeSuspended = req.query.include_suspended === 'true';
    const whereClause = includeSuspended
      ? ''
      : "WHERE COALESCE(c.is_active, 1) = 1 AND COALESCE(c.status, 'active') = 'active'";

    let categories = [];
    try {
      categories = await db.query(`
        SELECT c.id, c.name, c.slug, c.description, c.image_url,
               COALESCE(c.is_active, 1) as is_active,
               COALESCE(c.status, 'active') as status,
               COALESCE(c.display_order, 10) as display_order,
               COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
        ${whereClause}
        GROUP BY c.id
        ORDER BY COALESCE(c.display_order, 10) ASC, c.id ASC
      `);
    } catch (_) {}

    if (!categories || categories.length === 0) {
      categories = productLedger.getAllCategories();
    }

    return res.json({ success: true, categories });
  } catch (err) {
    console.error('[ProductController.getCategories] Error:', err);
    return res.json({ success: true, categories: productLedger.getAllCategories() });
  }
}

/**
 * GET /api/products/:id
 */
async function getProductById(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  try {
    let row = null;
    try {
      row = await db.get(
        `SELECT 
          p.id, p.sku, p.name, p.slug, p.description, p.price, p.compare_at_price,
          p.category_id, p.collection_id, p.status, p.is_featured, p.is_new_arrival, p.is_bestseller,
          p.badge, p.badge_type, p.stars, p.created_at, p.updated_at,
          c.name as category_name, c.slug as category_slug,
          img.image_url as primary_image,
          inv.stock_quantity, inv.reserved_quantity,
          (COALESCE(inv.stock_quantity, 0) - COALESCE(inv.reserved_quantity, 0)) as available_quantity,
          inv.low_stock_threshold
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN product_images img ON img.product_id = p.id AND img.is_primary = 1
        LEFT JOIN inventory inv ON inv.product_id = p.id
        WHERE p.id = ?`,
        [id]
      );
    } catch (_) {}

    if (!row) {
      const fallback = productLedger.getProductById(id);
      if (fallback) {
        return res.json({ success: true, data: fallback, product: fallback });
      }
      return res.status(404).json({ success: false, message: `Product #${id} not found` });
    }

    const product = formatProductRow(row);
    return res.json({ success: true, data: product, product });
  } catch (err) {
    console.error('[ProductController.getProductById] Error:', err.message);
    const fallback = productLedger.getProductById(id);
    if (fallback) {
      return res.json({ success: true, data: fallback, product: fallback });
    }
    return res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
}

/**
 * GET /api/products/stream
 * Server-Sent Events (SSE) real-time streaming endpoint
 */
function streamProducts(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  const clientId = Date.now() + Math.random();
  const clientObj = { id: clientId, res };
  sseClients.add(clientObj);

  // Initial connection acknowledgement
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', version: catalogVersion, timestamp: Date.now() })}\n\n`);

  req.on('close', () => {
    sseClients.delete(clientObj);
  });
}

/**
 * GET /api/products/version
 * Fast lightweight endpoint for client polling / version checking
 * Combines in-memory event timestamp with database max update timestamp
 */
async function getCatalogVersion(req, res) {
  let dbTimestamp = 0;
  try {
    const stat = await db.get("SELECT MAX(updated_at) as last_updated, count(*) as count FROM products WHERE status = 'active'");
    const catStat = await db.get("SELECT count(*) as count FROM categories");
    if (stat && stat.last_updated) {
      dbTimestamp = new Date(stat.last_updated).getTime() + (parseInt(stat.count, 10) || 0) + ((parseInt(catStat?.count, 10) || 0) * 1000);
    }
  } catch {}

  const effectiveVersion = Math.max(catalogVersion, dbTimestamp);

  res.json({
    success: true,
    version: effectiveVersion,
    timestamp: Date.now(),
    clientsConnected: sseClients.size
  });
}

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  streamProducts,
  getCatalogVersion,
  broadcastCatalogUpdate,
  syncFallbackSeeds
};
