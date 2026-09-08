/**
 * LUMIÈRE BEAUTY — SHOP CONTROLLER (shop.js)
 * 4-Column Luxury Editorial Grid, Full-Bleed Imagery & Complete State Sync
 */

/* ------------------- 1. FILTER & VIEW STATE ------------------- */
let shopFilter = {
  cats: [],
  maxPrice: 300,
  minStars: 0,
  highlights: []
};
let shopView = 'grid';
let searchQuery = '';

/* Read initial URL parameters (e.g. ?cat=skincare) */
(function readURLParams() {
  const params = new URLSearchParams(location.search);
  const cat = params.get('cat');
  if (cat) {
    const slug = cat.toLowerCase();
    shopFilter.cats = [slug];
    document.querySelectorAll(`input[name="cat"][value="${slug}"]`).forEach(el => { el.checked = true; });
    document.querySelectorAll('input[name="cat"][value="all"]').forEach(el => { el.checked = false; });
  }
})();

/* ------------------- 2. EDITORIAL PROMOTIONAL CARDS (SPAN 2 COLS) ------------------- */
const EDITORIAL_PROMOTIONAL_CARDS = [
  {
    afterIndex: 5, // After 6 products (Row 2 in 4-column grid: [P5] [P6] [THE GLOW EDIT (2 cols)])
    img: 'images/editorial_flatlay.jpg',
    title: 'THE GLOW EDIT',
    desc: 'Luminous essentials for your everyday ritual.',
    ctaText: 'EXPLORE COLLECTION',
    ctaLink: 'collections.html'
  },
  {
    afterIndex: 15, // After 16 products
    img: 'images/hero_banner_1788328324240.jpg',
    title: 'THE SCENT SANCTUARY',
    desc: 'Artisanal creations born in Grasse.',
    ctaText: 'DISCOVER FRAGRANCES',
    ctaLink: 'shop.html?cat=fragrance'
  },
  {
    afterIndex: 25, // After 26 products
    img: 'images/haircare_luxury.jpg',
    title: 'LIQUID SILK ELIXIR',
    desc: 'Weightless botanical fluid movement.',
    ctaText: 'SHOP HAIR CARE',
    ctaLink: 'shop.html?cat=haircare'
  }
];

/* ------------------- 3. CATEGORY & HIGHLIGHT COUNTERS ------------------- */
function renderShopSidebarCategories() {
  const desktopContainer = document.getElementById('sidebarCatContainer');
  const mobileContainer = document.getElementById('mSidebarCatContainer');
  if (!desktopContainer && !mobileContainer) return;

  const cats = (window.CATEGORIES && window.CATEGORIES.length)
    ? window.CATEGORIES
    : (typeof window.LumiereRealtimeCatalog !== 'undefined' && typeof window.LumiereRealtimeCatalog.getCategories === 'function' ? window.LumiereRealtimeCatalog.getCategories() : [
        { id: 1, name: 'Skincare', slug: 'skincare' },
        { id: 2, name: 'Makeup', slug: 'makeup' },
        { id: 3, name: 'Fragrance', slug: 'fragrance' },
        { id: 4, name: 'Bath & Body', slug: 'bath-body' },
        { id: 5, name: 'Sets & Gifts', slug: 'sets' },
        { id: 6, name: 'Hair Care', slug: 'haircare' }
      ]);

  const catalog = (window.PRODUCTS && window.PRODUCTS.length) ? window.PRODUCTS : (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);

  // Determine currently checked categories
  const checkedInputs = Array.from(document.querySelectorAll('input[name="cat"]:checked'));
  const currentChecked = new Set(checkedInputs.map(i => i.value));
  if (shopFilter.cats && shopFilter.cats.length) {
    shopFilter.cats.forEach(c => currentChecked.add((c || '').toLowerCase()));
  }
  const isAllChecked = (currentChecked.has('all') || currentChecked.size === 0) && (!shopFilter.cats || !shopFilter.cats.length);

  function buildHtml(isMobile = false) {
    const allId = isMobile ? 'mCatAll' : 'catAll';
    const allCountId = isMobile ? 'mCountAll' : 'countAll';
    const prefix = isMobile ? 'mCat_' : 'cat_';
    const countPrefix = isMobile ? 'mCount_' : 'count_';

    let html = `
      <label class="filter-checkbox-label">
        <div class="checkbox-inner-wrap">
          <input type="checkbox" name="cat" value="all" id="${allId}" ${isAllChecked ? 'checked' : ''} class="filter-checkbox-input" />
          <span>All Products</span>
        </div>
        <span class="filter-count-num" id="${allCountId}">(${catalog.length})</span>
      </label>
    `;

    cats.forEach(c => {
      const cSlug = (c.slug || '').toLowerCase();
      let count = catalog.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        return pCat === cSlug || p.category_id === c.id ||
          (cSlug === 'bath-body' && (pCat === 'bath' || pCat === 'bath-body')) ||
          (cSlug === 'haircare' && (pCat === 'haircare' || pCat === 'hair-care' || pCat === 'hair')) ||
          (cSlug === 'sets' && (pCat === 'sets' || pCat === 'sets-gifts'));
      }).length;

      if (count === 0 && typeof c.product_count === 'number') {
        count = c.product_count;
      }

      const isChecked = !isAllChecked && currentChecked.has(cSlug);
      const isJustAdded = Boolean(c.isJustAdded);

      html += `
        <label class="filter-checkbox-label ${isJustAdded ? 'category-just-added' : ''}">
          <div class="checkbox-inner-wrap">
            <input type="checkbox" name="cat" value="${cSlug}" id="${prefix}${cSlug}" ${isChecked ? 'checked' : ''} class="filter-checkbox-input" />
            <span>${c.name} ${isJustAdded ? '<span class="side-nav-new-badge">✦ NEW</span>' : ''}</span>
          </div>
          <span class="filter-count-num" id="${countPrefix}${cSlug}">(${count})</span>
        </label>
      `;
    });

    return html;
  }

  if (desktopContainer) desktopContainer.innerHTML = buildHtml(false);
  if (mobileContainer) mobileContainer.innerHTML = buildHtml(true);

  // Re-bind change listeners
  document.querySelectorAll('input[name="cat"]').forEach(input => {
    input.addEventListener('change', () => handleCategoryToggle(input));
  });
}

window.renderShopSidebarCategories = renderShopSidebarCategories;

(async function initCategoriesForShop() {
  try {
    const base = (typeof Auth !== 'undefined' && typeof Auth.getBaseUrl === 'function') ? Auth.getBaseUrl() : '';
    const res = await fetch(base + '/api/categories?t=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.categories) && data.categories.length) {
        window.CATEGORIES = data.categories;
        if (shopFilter.cats && shopFilter.cats.length) {
          const activeSlugs = new Set(data.categories.map(c => (c.slug || '').toLowerCase()));
          const isValid = shopFilter.cats.some(c => activeSlugs.has(c));
          if (!isValid) {
            shopFilter.cats = [];
            if (typeof updateCatalog === 'function') updateCatalog();
          }
        }
        renderShopSidebarCategories();
      }
    }
  } catch {}
})();

function updateCategoryCounters() {
  renderShopSidebarCategories();

  // Dynamic Highlight Counts
  const newLen = PRODUCTS.filter(p => (p.badge || '').toLowerCase().includes('new')).length;
  const bestLen = PRODUCTS.filter(p => (p.badge || '').toLowerCase().includes('bestseller')).length;
  const saleLen = PRODUCTS.filter(p => (p.badge || '').toLowerCase().includes('sale') || p.oldPrice).length;
  const veganLen = PRODUCTS.filter(p => (p.desc || '').toLowerCase().includes('vegan') || (p.badge || '').toLowerCase().includes('clean')).length;
  const crueltyLen = PRODUCTS.filter(p => (p.desc || '').toLowerCase().includes('clean') || (p.desc || '').toLowerCase().includes('botanical')).length;

  const countHlNew = document.getElementById('countHlNew');
  const countHlBest = document.getElementById('countHlBest');
  const countHlSale = document.getElementById('countHlSale');
  const countHlVegan = document.getElementById('countHlVegan');
  const countHlCruelty = document.getElementById('countHlCruelty');

  if (countHlNew) countHlNew.textContent = `(${newLen})`;
  if (countHlBest) countHlBest.textContent = `(${bestLen})`;
  if (countHlSale) countHlSale.textContent = `(${saleLen})`;
  if (countHlVegan) countHlVegan.textContent = `(${veganLen})`;
  if (countHlCruelty) countHlCruelty.textContent = `(${crueltyLen})`;
}

window.updateCategoryCounters = updateCategoryCounters;

/* ------------------- 4. WARM STUDIO EDITORIAL CANVASES ------------------- */
const STUDIO_TONES = [
  'bg-cream',
  'bg-champagne',
  'bg-beige',
  'bg-blush',
  'bg-ivory'
];

const DARK_EXTRAITS = [
  "Noir d'Or Eau de Parfum",
  "Velvet Oud Extrait de Parfum",
  "Jasmin Noir Parfum",
  "Ambre Impérial Extrait de Parfum"
];

/* ------------------- 5. PRODUCT CARD BUILDER ------------------- */
function buildEditorialProductCard(p, index) {
  const card = document.createElement('article');
  card.className = 'editorial-product-card reveal-stagger' + (p.isJustAdded ? ' card-just-added' : '');
  card.style.animationDelay = `${(index % 8) * 45}ms`;
  card.setAttribute('data-id', p.id);

  // Studio background tone
  const isDarkProduct = DARK_EXTRAITS.includes(p.name);
  const bgClass = isDarkProduct ? 'bg-espresso' : STUDIO_TONES[index % STUDIO_TONES.length];

  // Wishlist state check
  const isWishlisted = typeof wishlist !== 'undefined' && wishlist.has(p.id);

  // Live stock & badge logic
  const isSoldOut = (p.available_quantity !== undefined && p.available_quantity <= 0) || p.is_out_of_stock;
  let badgeHTML = '';
  if (isSoldOut) {
    badgeHTML = `<span class="card-floating-badge" style="background: rgba(13,10,14,0.9); color: #ff708f; border: 1px solid rgba(255,112,143,0.3);">SOLD OUT</span>`;
  } else if (p.isJustAdded) {
    badgeHTML = `<span class="card-floating-badge badge-just-added" style="background: linear-gradient(135deg, #DFB15B, #9E7D3B); color: #0D0A0E; font-weight: 700; border: 1px solid #FAF7F2; box-shadow: 0 2px 10px rgba(0,0,0,0.35);">✦ JUST ADDED</span>`;
  } else if (p.badge) {
    const badgeSlug = (p.badgeType || p.badge).toLowerCase().replace(/\s+/g, '-');
    badgeHTML = `<span class="card-floating-badge badge-${badgeSlug}">${p.badge}</span>`;
  }

  // Price & old price
  const oldPriceHTML = p.oldPrice ? `<span class="card-old-price">₹${p.oldPrice.toFixed(2)}</span>` : '';
  const starIcons = '★'.repeat(p.stars || 5) + '☆'.repeat(5 - (p.stars || 5));
  const priceVal = typeof p.price === 'number' ? p.price.toFixed(2) : parseFloat(p.price || 0).toFixed(2);

  const addBtnHTML = isSoldOut
    ? `<button class="expandable-bag-btn" disabled style="opacity: 0.45; cursor: not-allowed; border-color: rgba(250,247,242,0.2);" aria-label="${p.name} is Sold Out">
         <span class="bag-btn-text">SOLD OUT</span>
         <span class="bag-btn-arrow" style="font-size: 0.65rem;">✕</span>
       </button>`
    : `<button class="expandable-bag-btn" onclick="handleAddToCartClick(${p.id}, event)" aria-label="Add ${p.name} to Bag">
         <span class="bag-btn-text">ADD TO BAG</span>
         <span class="bag-btn-arrow">&rarr;</span>
       </button>`;

  card.innerHTML = `
    <!-- 1. FULL BLEED WARM STUDIO EDITORIAL CANVAS -->
    <div class="card-visual-container ${bgClass}" onclick="openProductQuickView(${p.id})">
      <!-- Badge: Top-Left -->
      ${badgeHTML}

      <!-- Circular Wishlist Button: Top-Right (32px, white, dark outline heart) -->
      <button class="card-floating-wishlist ${isWishlisted ? 'active' : ''}" 
              onclick="handleWishlistClick(${p.id}, event)" 
              aria-label="Save ${p.name} to wishlist">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      <!-- Full-Bleed Product Photography Frame -->
      <div class="card-img-frame">
        <img src="${p.img || p.primary_image}" alt="${p.name}" class="card-floating-img" loading="lazy" />
      </div>

      <!-- Quick View Pill (Appears on Hover) -->
      <button class="card-quick-view-pill" onclick="openProductQuickView(${p.id}); event.stopPropagation();">
        QUICK VIEW
      </button>
    </div>

    <!-- 2. PRODUCT INFORMATION (OUTSIDE & UNDERNEATH) -->
    <div class="card-info-zone">
      <!-- Category on Left, Stars on Right -->
      <div class="card-category-strip">
        <span class="card-category-label">${(p.categoryLabel || p.category).toUpperCase()}</span>
        <span class="card-rating-stars">${starIcons}</span>
      </div>

      <!-- Elegant Serif Product Title -->
      <h3 class="card-product-title" onclick="openProductQuickView(${p.id})">${p.name}</h3>

      <!-- 2-Line Description -->
      <p class="card-product-desc">${p.desc || p.description}</p>

      <!-- Price (Left) & Circular Arrow Button (Right) -->
      <div class="card-footer-interaction">
        <div class="card-price-display">
          <span class="card-current-price">₹${priceVal}</span>
          ${oldPriceHTML}
        </div>

        ${addBtnHTML}
      </div>
    </div>
  `;

  return card;
}

/* ------------------- 6. 2-COLUMN EDITORIAL FEATURE CARD (THE GLOW EDIT) ------------------- */
function buildEditorialFeatureCard(item) {
  const card = document.createElement('div');
  card.className = 'editorial-interstitial-card reveal-stagger';
  card.innerHTML = `
    <img src="${item.img}" alt="${item.title}" class="interstitial-bg-img" loading="lazy" />
    <div class="interstitial-vignette"></div>
    <div class="interstitial-content">
      <h2 class="interstitial-title">${item.title}</h2>
      <p class="interstitial-desc">${item.desc}</p>
      <a href="${item.ctaLink}" class="interstitial-cta">${item.ctaText} &rarr;</a>
    </div>
  `;
  return card;
}

/* ------------------- 7. FILTER & RENDER ENGINE ------------------- */
function applyFilters() {
  const grid = document.getElementById('shopProductsGrid');
  const empty = document.getElementById('shopEmpty');
  const priceSlider = document.getElementById('priceSlider');
  const mPriceSlider = document.getElementById('mPriceSlider');

  if (!grid || typeof PRODUCTS === 'undefined') return;

  // Category selection
  const catInputs = document.querySelectorAll('input[name="cat"]:checked');
  shopFilter.cats = Array.from(catInputs).map(i => i.value).filter(v => v !== 'all');
  const allChecked = document.getElementById('catAll')?.checked || (catInputs.length === 0);

  // Price slider
  const activeSlider = priceSlider || mPriceSlider;
  shopFilter.maxPrice = parseInt(activeSlider?.value || 300);

  const priceMaxEl = document.getElementById('priceMax');
  if (priceMaxEl) priceMaxEl.textContent = shopFilter.maxPrice;
  const mPriceMaxEl = document.getElementById('mPriceMax');
  if (mPriceMaxEl) mPriceMaxEl.textContent = shopFilter.maxPrice;

  // Rating selection
  const starInput = document.querySelector('input[name="stars"]:checked');
  shopFilter.minStars = parseInt(starInput?.value || 0);

  // Highlights (New, Bestseller, Sale, Vegan, Cruelty-Free)
  const highlightInputs = document.querySelectorAll('input[name="highlight"]:checked');
  shopFilter.highlights = Array.from(highlightInputs).map(i => i.value);

  // Sort value
  const sortVal = document.getElementById('sortSelect')?.value || 'default';

  // Filter Catalog
  let filtered = [...PRODUCTS].filter(p => {
    if (!allChecked && shopFilter.cats.length) {
      const pCat = (p.category || '').toLowerCase();
      const matchCat = shopFilter.cats.some(c => {
        const slug = c.toLowerCase();
        const catObj = (window.CATEGORIES || []).find(catItem => (catItem.slug || '').toLowerCase() === slug);
        return pCat === slug ||
          (catObj && p.category_id === catObj.id) ||
          (slug === 'bath-body' && (pCat === 'bath' || pCat === 'bath-body')) ||
          (slug === 'haircare' && (pCat === 'haircare' || pCat === 'hair-care' || pCat === 'hair')) ||
          (slug === 'sets' && (pCat === 'sets' || pCat === 'sets-gifts'));
      });
      if (!matchCat) return false;
    }
    if (p.price > shopFilter.maxPrice) return false;
    if (shopFilter.minStars > 0 && (p.stars || 5) < shopFilter.minStars) return false;
    
    // Highlight matching
    if (shopFilter.highlights.length) {
      const pBadge = (p.badge || '').toLowerCase();
      const pDesc = (p.desc || '').toLowerCase();
      const matchesHighlight = shopFilter.highlights.some(h => {
        const hl = h.toLowerCase();
        return pBadge.includes(hl) || pDesc.includes(hl) || (hl === 'sale' && p.oldPrice);
      });
      if (!matchesHighlight) return false;
    }

    // Search query matching
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.desc.toLowerCase().includes(q);
      const matchCat = (p.categoryLabel || p.category).toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    return true;
  });

  // Sort Catalog
  if (sortVal === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sortVal === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sortVal === 'rating') filtered.sort((a, b) => (b.stars || 5) - (a.stars || 5));
  else if (sortVal === 'newest') filtered.sort((a, b) => (b.isJustAdded ? 1 : 0) - (a.isJustAdded ? 1 : 0) || (b.badge === 'New' || b.isNewArrival ? 1 : 0) - (a.badge === 'New' || a.isNewArrival ? 1 : 0) || b.id - a.id);
  else {
    // In default curation, prioritize newly listed products by owner at the top for real-time visibility
    filtered.sort((a, b) => (b.isJustAdded ? 1 : 0) - (a.isJustAdded ? 1 : 0) || (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0) || b.id - a.id);
  }

  // Update Toolbar Count
  const countEl = document.getElementById('resultCount');
  if (countEl) {
    countEl.style.opacity = '0.3';
    setTimeout(() => {
      countEl.textContent = filtered.length;
      countEl.style.opacity = '1';
    }, 100);
  }

  // Render Grid
  grid.innerHTML = '';

  if (filtered.length === 0) {
    if (empty) empty.style.display = 'block';
    updateActiveFilterChips();
    return;
  }

  if (empty) empty.style.display = 'none';

  // Render products and insert 2-column horizontal feature card after product 6 (index 5)
  let promoIndex = 0;

  filtered.forEach((p, index) => {
    grid.appendChild(buildEditorialProductCard(p, index));

    // Check for promotional card insertion (Row 2: products 5 & 6 + 2-col promo = 4 cols)
    if (promoIndex < EDITORIAL_PROMOTIONAL_CARDS.length && shopView === 'grid') {
      const targetPromo = EDITORIAL_PROMOTIONAL_CARDS[promoIndex];
      if (index === targetPromo.afterIndex) {
        grid.appendChild(buildEditorialFeatureCard(targetPromo));
        promoIndex++;
      }
    }
  });

  // Update Slider Track
  if (priceSlider) {
    const pct = (shopFilter.maxPrice / 300) * 100;
    priceSlider.style.background = `linear-gradient(to right, var(--color-gold) 0%, var(--color-gold) ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`;
  }
  if (mPriceSlider) {
    const pct = (shopFilter.maxPrice / 300) * 100;
    mPriceSlider.style.background = `linear-gradient(to right, var(--color-gold) 0%, var(--color-gold) ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`;
  }

  updateActiveFilterChips();
}

/* ------------------- 8. ACTIVE FILTER CHIPS ------------------- */
function updateActiveFilterChips() {
  const container = document.getElementById('activeFilters');
  if (!container) return;

  const chips = [];

  if (shopFilter.cats.length) {
    shopFilter.cats.forEach(c => {
      chips.push({ label: c, action: `removeCatFilter('${c}')` });
    });
  }

  if (shopFilter.maxPrice < 300) {
    chips.push({ label: `Under ₹${shopFilter.maxPrice}`, action: `resetPrice()` });
  }

  if (shopFilter.minStars > 0) {
    chips.push({ label: `${shopFilter.minStars}★ & Up`, action: `resetStars()` });
  }

  shopFilter.highlights.forEach(h => {
    chips.push({ label: h, action: `removeHighlightFilter('${h}')` });
  });

  if (searchQuery) {
    chips.push({ label: `"${searchQuery}"`, action: `clearSearch()` });
  }

  container.innerHTML = chips.map(c => `
    <button class="shop-filter-chip" onclick="${c.action}" aria-label="Remove filter ${c.label}">
      <span>${c.label}</span>
      <span class="chip-close-icon">&times;</span>
    </button>
  `).join('');
}

function removeCatFilter(cat) {
  const slug = (cat || '').toLowerCase();
  document.querySelectorAll(`input[name="cat"][value="${slug}"]`).forEach(el => { el.checked = false; });

  const remaining = Array.from(document.querySelectorAll('input[name="cat"]:not([value="all"]):checked'));
  if (!remaining.length) {
    document.querySelectorAll('input[name="cat"][value="all"]').forEach(el => { el.checked = true; });
  }

  applyFilters();
}

function resetPrice() {
  const slider = document.getElementById('priceSlider');
  if (slider) slider.value = 300;
  const mSlider = document.getElementById('mPriceSlider');
  if (mSlider) mSlider.value = 300;
  applyFilters();
}

function resetStars() {
  const starsAll = document.getElementById('starsAll');
  if (starsAll) starsAll.checked = true;
  const mStarsAll = document.getElementById('mStarsAll');
  if (mStarsAll) mStarsAll.checked = true;
  applyFilters();
}

function removeHighlightFilter(h) {
  document.querySelectorAll('input[name="highlight"]').forEach(el => {
    if (el.value === h) el.checked = false;
  });
  applyFilters();
}

function clearSearch() {
  searchQuery = '';
  applyFilters();
}

function clearAllFilters() {
  document.querySelectorAll('input[name="cat"][value="all"]').forEach(i => { i.checked = true; });
  document.querySelectorAll('input[name="cat"]:not([value="all"])').forEach(i => { i.checked = false; });

  const slider = document.getElementById('priceSlider');
  if (slider) slider.value = 300;
  const mSlider = document.getElementById('mPriceSlider');
  if (mSlider) mSlider.value = 300;

  const starsAll = document.getElementById('starsAll');
  if (starsAll) starsAll.checked = true;
  const mStarsAll = document.getElementById('mStarsAll');
  if (mStarsAll) mStarsAll.checked = true;

  document.querySelectorAll('input[name="highlight"]').forEach(i => { i.checked = false; });

  searchQuery = '';
  applyFilters();
}

/* ------------------- 9. VIEW MODE TOGGLE (GRID / LIST) ------------------- */
function setViewMode(mode) {
  shopView = mode;
  const grid = document.getElementById('shopProductsGrid');
  const btnGrid = document.getElementById('viewModeGrid');
  const btnList = document.getElementById('viewModeList');

  if (grid) {
    grid.classList.toggle('list-view', mode === 'list');
  }
  if (btnGrid) btnGrid.classList.toggle('active', mode === 'grid');
  if (btnList) btnList.classList.toggle('active', mode === 'list');

  // Re-render to adapt feature card placement
  applyFilters();
}

/* ------------------- 10. CATEGORY TOGGLE SYNC ------------------- */
function handleCategoryToggle(input) {
  const isAll = input.value === 'all';
  const specificInputs = Array.from(document.querySelectorAll('input[name="cat"]')).filter(i => i.value !== 'all');
  const catAllInputs = document.querySelectorAll('input[name="cat"][value="all"]');

  if (isAll) {
    if (input.checked) {
      specificInputs.forEach(i => { i.checked = false; });
    } else {
      input.checked = true;
    }
  } else {
    // Synchronize peer checkboxes across desktop & mobile
    document.querySelectorAll(`input[name="cat"][value="${input.value}"]`).forEach(peer => {
      peer.checked = input.checked;
    });

    const anyChecked = specificInputs.some(i => i.checked);
    catAllInputs.forEach(i => { i.checked = !anyChecked; });
  }

  if (isAll) {
    catAllInputs.forEach(i => { i.checked = input.checked; });
  }

  applyFilters();
}

/* ------------------- 11. CARD ACTIONS (BAG & WISHLIST) ------------------- */
function handleAddToCartClick(productId, e) {
  if (e) e.stopPropagation();
  if (typeof addToCart === 'function') {
    addToCart(productId, 1);
  }
}

function handleWishlistClick(productId, e) {
  if (e) e.stopPropagation();
  if (typeof toggleWishlist === 'function') {
    toggleWishlist(productId, e);
  }
}

function openProductQuickView(productId) {
  if (typeof openQuickView === 'function') {
    openQuickView(productId);
  }
}

/* ------------------- 12. ACCORDION TOGGLE ------------------- */
function toggleFilterGroup(titleEl) {
  titleEl.classList.toggle('collapsed');
  const body = titleEl.nextElementSibling;
  if (body) body.classList.toggle('collapsed');
}

/* ------------------- 13. MOBILE DRAWER CONTROLS ------------------- */
function openMobileFilterDrawer() {
  const drawer = document.getElementById('mobileFilterDrawer');
  const backdrop = document.getElementById('lumiereBackdrop');
  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileFilterDrawer() {
  const drawer = document.getElementById('mobileFilterDrawer');
  const backdrop = document.getElementById('lumiereBackdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop && (typeof isAnyOtherModalOpen !== 'function' || !isAnyOtherModalOpen())) {
    backdrop.classList.remove('open');
  }
  document.body.style.overflow = '';
}

/* ------------------- 14. INITIALIZATION ------------------- */
document.addEventListener('DOMContentLoaded', () => {
  updateCategoryCounters();

  // Category listeners
  document.querySelectorAll('input[name="cat"]').forEach(input => {
    input.addEventListener('change', () => handleCategoryToggle(input));
  });

  // Price slider listeners (bi-directional sync)
  const priceSlider = document.getElementById('priceSlider');
  const mPriceSlider = document.getElementById('mPriceSlider');
  if (priceSlider) {
    priceSlider.addEventListener('input', () => {
      if (mPriceSlider) mPriceSlider.value = priceSlider.value;
      applyFilters();
    });
  }
  if (mPriceSlider) {
    mPriceSlider.addEventListener('input', () => {
      if (priceSlider) priceSlider.value = mPriceSlider.value;
      applyFilters();
    });
  }

  // Highlight listeners (bi-directional sync)
  document.querySelectorAll('input[name="highlight"]').forEach(input => {
    input.addEventListener('change', () => {
      document.querySelectorAll(`input[name="highlight"][value="${input.value}"]`).forEach(peer => {
        peer.checked = input.checked;
      });
      applyFilters();
    });
  });

  // Rating stars listeners (bi-directional sync)
  document.querySelectorAll('input[name="stars"]').forEach(input => {
    input.addEventListener('change', () => {
      document.querySelectorAll(`input[name="stars"][value="${input.value}"]`).forEach(peer => {
        peer.checked = input.checked;
      });
      applyFilters();
    });
  });

  // Sort dropdown listeners (bi-directional sync)
  const sortSelect = document.getElementById('sortSelect');
  const mSortSelect = document.getElementById('mSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      if (mSortSelect) mSortSelect.value = this.value;
      applyFilters();
    });
  }
  if (mSortSelect) {
    mSortSelect.addEventListener('change', function() {
      if (sortSelect) sortSelect.value = this.value;
      applyFilters();
    });
  }

  applyFilters();
});

// Fallback execution if DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  updateCategoryCounters();
  applyFilters();
}

/* ------------------- 15. REAL-TIME CATALOG SYNCHRONIZATION ------------------- */
function updatePriceSliderBounds() {
  const catalog = (window.PRODUCTS && window.PRODUCTS.length) ? window.PRODUCTS : (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
  let highest = 300;
  if (catalog.length) {
    catalog.forEach(p => {
      const pr = typeof p.price === 'number' ? p.price : parseFloat(p.price || 0);
      if (pr > highest) highest = Math.ceil(pr / 50) * 50;
    });
  }
  const slider = document.getElementById('priceSlider');
  const mSlider = document.getElementById('mPriceSlider');
  if (slider) {
    const isAtMax = parseInt(slider.value, 10) >= parseInt(slider.max || 300, 10);
    slider.max = highest;
    if (isAtMax) slider.value = highest;
  }
  if (mSlider) {
    const isAtMax = parseInt(mSlider.value, 10) >= parseInt(mSlider.max || 300, 10);
    mSlider.max = highest;
    if (isAtMax) mSlider.value = highest;
  }
  const priceMaxEl = document.getElementById('priceMax');
  if (priceMaxEl && (!slider || slider.value == highest)) priceMaxEl.textContent = highest;
  const mPriceMaxEl = document.getElementById('mPriceMax');
  if (mPriceMaxEl && (!mSlider || mSlider.value == highest)) mPriceMaxEl.textContent = highest;
}

function updateShopLive(liveItems, meta) {
  updatePriceSliderBounds();
  updateCategoryCounters();
  applyFilters();
  const countEl = document.getElementById('resultCount');
  if (countEl) {
    countEl.style.transition = 'color 0.4s ease, transform 0.4s ease';
    countEl.style.color = 'var(--color-gold, #C9A96E)';
    countEl.style.transform = 'scale(1.15)';
    setTimeout(() => {
      countEl.style.color = '';
      countEl.style.transform = '';
    }, 1400);
  }
  // If brand new curations arrived in real time, smoothly guide the viewport toward the grid
  if (meta && meta.newItems && meta.newItems.length > 0) {
    const grid = document.getElementById('shopProductsGrid');
    if (grid) {
      const rect = grid.getBoundingClientRect();
      if (rect.top < -50 || rect.top > window.innerHeight) {
        window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - 120), behavior: 'smooth' });
      }
    }
  }
}

window.updateShopLive = updateShopLive;
window.applyFilters = applyFilters;
window.updateCategoryCounters = updateCategoryCounters;
window.renderShopSidebarCategories = renderShopSidebarCategories;
window.updatePriceSliderBounds = updatePriceSliderBounds;

if (typeof window.LumiereRealtimeCatalog !== 'undefined') {
  window.LumiereRealtimeCatalog.subscribe(updateShopLive);
} else {
  let subAttempts = 0;
  const subInterval = setInterval(() => {
    subAttempts++;
    if (typeof window.LumiereRealtimeCatalog !== 'undefined') {
      window.LumiereRealtimeCatalog.subscribe(updateShopLive);
      clearInterval(subInterval);
    } else if (subAttempts > 30) {
      clearInterval(subInterval);
    }
  }, 200);
}
