/**
 * Resilient Product Ledger Service
 * Ensures products, categories, and catalog modifications persist
 * across serverless restarts and ephemeral SQLite states.
 */
const fs = require("fs");
const path = require("path");

const SEED_PRODUCTS_PATH = path.resolve(__dirname, "../../database/seeds/seed_products.json");
const FRONTEND_PRODUCTS_PATH = path.resolve(__dirname, "../../frontend/data/products.json");
const TMP_PRODUCTS_PATH = "/tmp/products_ledger.json";
const TMP_CATEGORIES_PATH = "/tmp/categories_ledger.json";

const DEFAULT_CATEGORIES = [
  { id: 1, slug: "skincare", name: "Skincare", description: "Cellular restorative formulas & clean botanical elixirs", is_active: 1, status: "active", display_order: 1 },
  { id: 2, slug: "makeup", name: "Makeup", description: "Haute couture pigments, velvet formulas & luminous bases", is_active: 1, status: "active", display_order: 2 },
  { id: 3, slug: "fragrance", name: "Fragrance", description: "Haute parfumerie crafted with precious Grasse essences", is_active: 1, status: "active", display_order: 3 },
  { id: 4, slug: "haircare", name: "Hair Care", description: "Cellular follicle densifying serums, elixirs & silken conditioning masques", is_active: 1, status: "active", display_order: 4 },
  { id: 5, slug: "bath-body", name: "Bath & Body", description: "Luxurious body oils, softening elixirs & silken polishes", is_active: 1, status: "active", display_order: 5 },
  { id: 6, slug: "sets", name: "Sets & Gifts", description: "Curated beauty rituals in gold-embossed coffrets", is_active: 1, status: "active", display_order: 6 },
  { id: 7, slug: "tony", name: "Tony", description: "Exclusive Signature Curations", is_active: 1, status: "active", display_order: 7 }
];

const DEFAULT_COLLECTIONS = [
  { id: 1, slug: "golden-aura", name: "The Golden Aura Collection", tagline: "Infused with 24-Karat Gold & Rare Botanicals" },
  { id: 2, slug: "velvet-noir", name: "Velvet Noir Édit", tagline: "Midnight Elegance & Smoky Sensuality" },
  { id: 3, slug: "rose-de-grasse", name: "Rose de Grasse Ritual", tagline: "Harvested from French Rose Valleys" },
];

let MEMORY_PRODUCTS = [];
let MEMORY_CATEGORIES = [];

function loadSeedProducts() {
  // 1. Check /tmp if modified dynamically
  try {
    if (fs.existsSync(TMP_PRODUCTS_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(TMP_PRODUCTS_PATH, "utf8"));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(formatProduct);
      }
    }
  } catch (_) {}

  // 2. Bundler-safe require fallback (included automatically in Vercel bundle trace)
  try {
    const data = require("../../database/seeds/seed_products.json");
    if (Array.isArray(data) && data.length > 0) {
      return data.map(formatProduct);
    }
  } catch (_) {}

  try {
    const data = require("../../frontend/data/products.json");
    if (Array.isArray(data) && data.length > 0) {
      return data.map(formatProduct);
    }
  } catch (_) {}

  // 3. Try filesystem candidates
  const candidates = [
    SEED_PRODUCTS_PATH,
    FRONTEND_PRODUCTS_PATH,
    path.join(process.cwd(), "database/seeds/seed_products.json"),
    path.join(process.cwd(), "frontend/data/products.json")
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(formatProduct);
        }
      }
    } catch (_) {}
  }
  return [];
}

function loadSeedCategories() {
  try {
    if (fs.existsSync(TMP_CATEGORIES_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(TMP_CATEGORIES_PATH, "utf8"));
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return [...DEFAULT_CATEGORIES];
}

function formatProduct(p) {
  const pId = parseInt(p.id, 10);
  const stock = p.stock_quantity !== null && p.stock_quantity !== undefined ? p.stock_quantity : (p.stock || 50);
  const reserved = p.reserved_quantity !== null && p.reserved_quantity !== undefined ? p.reserved_quantity : 0;
  const avail = p.available_quantity !== null && p.available_quantity !== undefined ? p.available_quantity : Math.max(0, stock - reserved);
  const threshold = p.low_stock_threshold || 5;
  const image = p.primary_image || p.img || "images/skincare_products_1788328338930.jpg";

  let catId = parseInt(p.category_id, 10);
  let catSlug = p.category_slug || p.category || "skincare";
  let catName = p.category_name || p.categoryLabel || "Skincare";

  if (!catId) {
    const matched = DEFAULT_CATEGORIES.find(c => c.slug.toLowerCase() === catSlug.toLowerCase());
    catId = matched ? matched.id : 1;
    if (matched) {
      catSlug = matched.slug;
      catName = matched.name;
    }
  }

  return {
    id: pId,
    sku: p.sku || ("LUM-SKU-" + String(pId).padStart(3, "0")),
    name: p.name || "Lumière Formulation",
    slug: p.slug || (p.name || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    subtitle: p.subtitle || "",
    category_id: catId,
    category_slug: catSlug,
    category_name: catName,
    category: catSlug,
    categoryLabel: catName,
    desc: p.desc || p.description || "",
    description: p.description || p.desc || "",
    ingredients: p.ingredients || "",
    how_to_use: p.how_to_use || "",
    price: parseFloat(p.price) || 0,
    compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price) : (p.oldPrice ? parseFloat(p.oldPrice) : null),
    oldPrice: p.oldPrice ? parseFloat(p.oldPrice) : (p.compare_at_price ? parseFloat(p.compare_at_price) : null),
    badge: p.badge || (p.is_new_arrival || p.isNewArrival ? "New" : (p.is_bestseller || p.isBestseller ? "Bestseller" : null)),
    badge_type: p.badge_type || p.badgeType || (p.badge ? (p.badge.toLowerCase().includes("new") ? "new" : "best") : null),
    badgeType: p.badgeType || p.badge_type || null,
    stars: p.stars || p.rating || 5,
    rating: p.rating || p.stars || 5,
    reviewsCount: p.reviewsCount || (85 + ((pId * 19) % 240)),
    img: image,
    primary_image: image,
    brand: p.brand || "LUMIÈRE",
    status: p.status || "active",
    is_featured: p.is_featured !== undefined ? (p.is_featured ? 1 : 0) : (p.isFeatured ? 1 : 0),
    isFeatured: Boolean(p.is_featured || p.isFeatured),
    is_new_arrival: p.is_new_arrival !== undefined ? (p.is_new_arrival ? 1 : 0) : (p.isNewArrival ? 1 : 0),
    isNewArrival: Boolean(p.is_new_arrival || p.isNewArrival),
    is_bestseller: p.is_bestseller !== undefined ? (p.is_bestseller ? 1 : 0) : (p.isBestseller ? 1 : 0),
    isBestseller: Boolean(p.is_bestseller || p.isBestseller),
    stock_quantity: stock,
    reserved_quantity: reserved,
    available_quantity: avail,
    low_stock_threshold: threshold,
    is_low_stock: avail <= threshold && avail > 0,
    is_out_of_stock: avail <= 0,
    created_at: p.created_at || new Date().toISOString(),
    updated_at: p.updated_at || new Date().toISOString()
  };
}

// Initialize memory state
try {
  MEMORY_PRODUCTS = loadSeedProducts();
  MEMORY_CATEGORIES = loadSeedCategories();
} catch (_) {
  MEMORY_PRODUCTS = [];
  MEMORY_CATEGORIES = [...DEFAULT_CATEGORIES];
}

function saveProductsToDisk(products) {
  if (!Array.isArray(products)) return;
  try {
    fs.writeFileSync(TMP_PRODUCTS_PATH, JSON.stringify(products, null, 2), "utf8");
  } catch (_) {}
  try {
    fs.writeFileSync(SEED_PRODUCTS_PATH, JSON.stringify(products, null, 2), "utf8");
  } catch (_) {}
  try {
    fs.writeFileSync(FRONTEND_PRODUCTS_PATH, JSON.stringify(products, null, 2), "utf8");
  } catch (_) {}
}

function saveCategoriesToDisk(categories) {
  if (!Array.isArray(categories)) return;
  try {
    fs.writeFileSync(TMP_CATEGORIES_PATH, JSON.stringify(categories, null, 2), "utf8");
  } catch (_) {}
}

/**
 * Retrieve all products matching query filters
 */
function getAllProducts(filters = {}) {
  const { category, search, minPrice, maxPrice, sort, status, limit } = filters;
  let list = [...MEMORY_PRODUCTS];

  if (status && status !== "all") {
    list = list.filter(p => (p.status || "active").toLowerCase() === status.toLowerCase());
  } else if (!status) {
    // Default public storefront: active only
    list = list.filter(p => (p.status || "active").toLowerCase() === "active");
  }

  if (category && category !== "all") {
    const cLower = category.toLowerCase().trim();
    list = list.filter(p => 
      String(p.category_id) === cLower ||
      (p.category && p.category.toLowerCase() === cLower) ||
      (p.category_slug && p.category_slug.toLowerCase() === cLower) ||
      (p.categoryLabel && p.categoryLabel.toLowerCase() === cLower) ||
      (p.category_name && p.category_name.toLowerCase() === cLower)
    );
  }

  if (search) {
    const sLower = search.toLowerCase().trim();
    list = list.filter(p => 
      (p.name && p.name.toLowerCase().includes(sLower)) ||
      (p.sku && p.sku.toLowerCase().includes(sLower)) ||
      (p.description && p.description.toLowerCase().includes(sLower)) ||
      (p.desc && p.desc.toLowerCase().includes(sLower))
    );
  }

  if (minPrice !== undefined && minPrice !== "") {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) list = list.filter(p => parseFloat(p.price) >= min);
  }

  if (maxPrice !== undefined && maxPrice !== "") {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) list = list.filter(p => parseFloat(p.price) <= max);
  }

  // Sorting
  if (sort === "price-asc") {
    list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sort === "price-desc") {
    list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  } else if (sort === "name-asc") {
    list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else if (sort === "rating") {
    list.sort((a, b) => (b.stars || 5) - (a.stars || 5));
  } else {
    // Default newest
    list.sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  if (limit) {
    const l = parseInt(limit, 10);
    if (!isNaN(l) && l > 0) list = list.slice(0, l);
  }

  return list;
}

/**
 * Retrieve single product by numeric ID, SKU, or slug
 */
function getProductById(idOrSlug) {
  if (!idOrSlug && idOrSlug !== 0) return null;
  const qStr = String(idOrSlug).toLowerCase().trim();
  return MEMORY_PRODUCTS.find(p => 
    String(p.id).toLowerCase() === qStr ||
    String(p.sku || "").toLowerCase() === qStr ||
    String(p.slug || "").toLowerCase() === qStr
  ) || null;
}

/**
 * Update an existing product formulation in the ledger
 */
function updateProduct(id, updates = {}) {
  if (!id && id !== 0) return null;
  const qStr = String(id).toLowerCase().trim();
  const idx = MEMORY_PRODUCTS.findIndex(p => 
    String(p.id).toLowerCase() === qStr ||
    String(p.sku || "").toLowerCase() === qStr
  );
  if (idx === -1) return null;

  const target = MEMORY_PRODUCTS[idx];

  if (updates.name !== undefined) {
    target.name = updates.name.trim();
    target.slug = target.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  if (updates.subtitle !== undefined) target.subtitle = updates.subtitle.trim();
  if (updates.description !== undefined) {
    target.description = updates.description.trim();
    target.desc = updates.description.trim();
  }
  if (updates.price !== undefined) target.price = parseFloat(updates.price);
  if (updates.compareAtPrice !== undefined) {
    target.compare_at_price = updates.compareAtPrice ? parseFloat(updates.compareAtPrice) : null;
    target.oldPrice = target.compare_at_price;
  }
  if (updates.categoryId !== undefined) {
    target.category_id = parseInt(updates.categoryId, 10);
    const cat = MEMORY_CATEGORIES.find(c => c.id === target.category_id);
    if (cat) {
      target.category = cat.slug;
      target.category_slug = cat.slug;
      target.categoryLabel = cat.name;
      target.category_name = cat.name;
    }
  }
  if (updates.status !== undefined) target.status = updates.status;
  if (updates.isFeatured !== undefined) {
    target.isFeatured = Boolean(updates.isFeatured);
    target.is_featured = target.isFeatured ? 1 : 0;
  }
  if (updates.isNewArrival !== undefined) {
    target.isNewArrival = Boolean(updates.isNewArrival);
    target.is_new_arrival = target.isNewArrival ? 1 : 0;
  }
  if (updates.isBestseller !== undefined) {
    target.isBestseller = Boolean(updates.isBestseller);
    target.is_bestseller = target.isBestseller ? 1 : 0;
  }
  if (updates.badge !== undefined) target.badge = updates.badge;
  if (updates.stockQuantity !== undefined) {
    target.stock_quantity = parseInt(updates.stockQuantity, 10) || 0;
    target.available_quantity = Math.max(0, target.stock_quantity - (target.reserved_quantity || 0));
    target.is_out_of_stock = target.available_quantity <= 0;
  }
  if (updates.lowStockThreshold !== undefined) {
    target.low_stock_threshold = parseInt(updates.lowStockThreshold, 10) || 5;
  }
  if (updates.primaryImage !== undefined && updates.primaryImage) {
    target.primary_image = updates.primaryImage;
    target.img = updates.primaryImage;
  }
  if (updates.ingredients !== undefined) target.ingredients = updates.ingredients;
  if (updates.howToUse !== undefined) target.how_to_use = updates.howToUse;
  target.updated_at = new Date().toISOString();

  saveProductsToDisk(MEMORY_PRODUCTS);
  return target;
}

/**
 * Create a new product in the ledger
 */
function createProduct(data) {
  const maxId = MEMORY_PRODUCTS.reduce((max, p) => Math.max(max, parseInt(p.id, 10) || 0), 0);
  const newId = maxId + 1;
  const sku = data.sku || ("LUM-PRD-" + String(newId).padStart(3, "0"));
  const slug = (data.name || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const catId = parseInt(data.categoryId, 10) || 1;
  const cat = MEMORY_CATEGORIES.find(c => c.id === catId) || DEFAULT_CATEGORIES[0];

  const newProd = formatProduct({
    id: newId,
    sku,
    name: data.name || "New Atelier Formulation",
    slug,
    category_id: catId,
    category: cat.slug,
    category_slug: cat.slug,
    categoryLabel: cat.name,
    category_name: cat.name,
    subtitle: data.subtitle || "",
    description: data.description || "",
    desc: data.description || "",
    price: parseFloat(data.price) || 0,
    compare_at_price: data.compareAtPrice ? parseFloat(data.compareAtPrice) : null,
    oldPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice) : null,
    badge: data.badge || null,
    badgeType: data.badgeType || null,
    stars: 5,
    rating: 5,
    reviewsCount: 1,
    img: data.primaryImage || "images/skincare_products_1788328338930.jpg",
    primary_image: data.primaryImage || "images/skincare_products_1788328338930.jpg",
    brand: "LUMIÈRE",
    status: data.status || "active",
    is_featured: data.isFeatured ? 1 : 0,
    isFeatured: Boolean(data.isFeatured),
    is_new_arrival: data.isNewArrival ? 1 : 0,
    isNewArrival: Boolean(data.isNewArrival),
    is_bestseller: data.isBestseller ? 1 : 0,
    isBestseller: Boolean(data.isBestseller),
    stock_quantity: parseInt(data.stockQuantity, 10) || 50,
    reserved_quantity: 0,
    available_quantity: parseInt(data.stockQuantity, 10) || 50,
    low_stock_threshold: parseInt(data.lowStockThreshold, 10) || 5,
    ingredients: data.ingredients || "",
    how_to_use: data.howToUse || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  MEMORY_PRODUCTS.unshift(newProd);
  saveProductsToDisk(MEMORY_PRODUCTS);
  return newProd;
}

/**
 * Archive a product
 */
function archiveProduct(id) {
  return updateProduct(id, { status: "archived" });
}

/**
 * Restore a product to active catalog
 */
function restoreProduct(id) {
  return updateProduct(id, { status: "active" });
}

/**
 * Permanently delete or soft-archive a product
 */
function deleteProduct(id, permanent = false) {
  const qStr = String(id).toLowerCase().trim();
  const idx = MEMORY_PRODUCTS.findIndex(p => 
    String(p.id).toLowerCase() === qStr ||
    String(p.sku || "").toLowerCase() === qStr
  );
  if (idx === -1) return false;

  if (permanent) {
    MEMORY_PRODUCTS.splice(idx, 1);
  } else {
    MEMORY_PRODUCTS[idx].status = "archived";
    MEMORY_PRODUCTS[idx].updated_at = new Date().toISOString();
  }
  saveProductsToDisk(MEMORY_PRODUCTS);
  return true;
}

/**
 * Retrieve all categories with dynamic live product counts
 */
function getAllCategories() {
  return MEMORY_CATEGORIES.map(cat => {
    const count = MEMORY_PRODUCTS.filter(p => 
      (p.status === "active" || !p.status) &&
      (p.category_id === cat.id || (p.category && p.category.toLowerCase() === cat.slug.toLowerCase()))
    ).length;
    return {
      ...cat,
      product_count: count
    };
  });
}

/**
 * Retrieve single category by ID or slug
 */
function getCategoryById(idOrSlug) {
  if (!idOrSlug && idOrSlug !== 0) return null;
  const qStr = String(idOrSlug).toLowerCase().trim();
  return MEMORY_CATEGORIES.find(c => 
    String(c.id).toLowerCase() === qStr ||
    String(c.slug || "").toLowerCase() === qStr
  ) || null;
}

/**
 * Update category status
 */
function updateCategoryStatus(id, status) {
  const qStr = String(id).toLowerCase().trim();
  const cat = MEMORY_CATEGORIES.find(c => String(c.id).toLowerCase() === qStr || String(c.slug || "").toLowerCase() === qStr);
  if (!cat) return null;
  cat.status = status;
  cat.is_active = (status === "active") ? 1 : 0;
  saveCategoriesToDisk(MEMORY_CATEGORIES);
  return cat;
}

/**
 * Retrieve all collections
 */
function getAllCollections() {
  return [...DEFAULT_COLLECTIONS];
}

module.exports = {
  getAllProducts,
  getProductById,
  updateProduct,
  createProduct,
  archiveProduct,
  restoreProduct,
  deleteProduct,
  getAllCategories,
  getCategoryById,
  updateCategoryStatus,
  getAllCollections
};
