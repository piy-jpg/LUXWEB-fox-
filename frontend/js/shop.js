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
    shopFilter.cats = [cat];
    const el = document.getElementById('cat' + cat.charAt(0).toUpperCase() + cat.slice(1));
    if (el) {
      el.checked = true;
      const catAll = document.getElementById('catAll');
      if (catAll) catAll.checked = false;
    }
    const mEl = document.getElementById('mCat' + cat.charAt(0).toUpperCase() + cat.slice(1));
    if (mEl) {
      mEl.checked = true;
      const mCatAll = document.getElementById('mCatAll');
      if (mCatAll) mCatAll.checked = false;
    }
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
function updateCategoryCounters() {
  if (typeof PRODUCTS === 'undefined') return;

  const countAll = document.getElementById('countAll');
  const countSkincare = document.getElementById('countSkincare');
  const countMakeup = document.getElementById('countMakeup');
  const countFragrance = document.getElementById('countFragrance');
  const countHaircare = document.getElementById('countHaircare');

  const mCountAll = document.getElementById('mCountAll');
  const mCountSkincare = document.getElementById('mCountSkincare');
  const mCountMakeup = document.getElementById('mCountMakeup');
  const mCountFragrance = document.getElementById('mCountFragrance');
  const mCountHaircare = document.getElementById('mCountHaircare');

  const skinLen = PRODUCTS.filter(p => p.category === 'skincare').length;
  const makeLen = PRODUCTS.filter(p => p.category === 'makeup').length;
  const fragLen = PRODUCTS.filter(p => p.category === 'fragrance').length;
  const hairLen = PRODUCTS.filter(p => p.category === 'haircare').length;

  if (countAll) countAll.textContent = `(${PRODUCTS.length})`;
  if (countSkincare) countSkincare.textContent = `(${skinLen})`;
  if (countMakeup) countMakeup.textContent = `(${makeLen})`;
  if (countFragrance) countFragrance.textContent = `(${fragLen})`;
  if (countHaircare) countHaircare.textContent = `(${hairLen})`;

  if (mCountAll) mCountAll.textContent = `(${PRODUCTS.length})`;
  if (mCountSkincare) mCountSkincare.textContent = `(${skinLen})`;
  if (mCountMakeup) mCountMakeup.textContent = `(${makeLen})`;
  if (mCountFragrance) mCountFragrance.textContent = `(${fragLen})`;
  if (mCountHaircare) mCountHaircare.textContent = `(${hairLen})`;

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
  card.className = 'editorial-product-card reveal-stagger';
  card.style.animationDelay = `${(index % 8) * 45}ms`;
  card.setAttribute('data-id', p.id);

  // Studio background tone
  const isDarkProduct = DARK_EXTRAITS.includes(p.name);
  const bgClass = isDarkProduct ? 'bg-espresso' : STUDIO_TONES[index % STUDIO_TONES.length];

  // Wishlist state check
  const isWishlisted = typeof wishlist !== 'undefined' && wishlist.has(p.id);

  // Badge logic (Bestseller, Sale, New, Limited)
  let badgeHTML = '';
  if (p.badge) {
    const badgeSlug = (p.badgeType || p.badge).toLowerCase().replace(/\s+/g, '-');
    badgeHTML = `<span class="card-floating-badge badge-${badgeSlug}">${p.badge}</span>`;
  }

  // Price & old price
  const oldPriceHTML = p.oldPrice ? `<span class="card-old-price">$${p.oldPrice.toFixed(2)}</span>` : '';
  const starIcons = '★'.repeat(p.stars || 5) + '☆'.repeat(5 - (p.stars || 5));

  /*
   * EXACT REFERENCE STRUCTURE:
   * 1. [ FLOATING BADGE (Left) + WHITE CIRCLE ♡ (Right) ]
   * 2. [ 28px ROUNDED WARM STUDIO CANVAS (1.08 : 1) - FULL BLEED 100% ]
   * 3. [ CATEGORY (Left) + ★★★★★ (Right) ]
   * 4. [ PRODUCT TITLE (Serif) ]
   * 5. [ SHORT 2-LINE DESCRIPTION ]
   * 6. [ PRICE (Left) + CIRCULAR ARROW BUTTON (Right) ]
   */
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
        <img src="${p.img}" alt="${p.name}" class="card-floating-img" loading="lazy" />
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
      <p class="card-product-desc">${p.desc}</p>

      <!-- Price (Left) & Circular Arrow Button (Right) -->
      <div class="card-footer-interaction">
        <div class="card-price-display">
          <span class="card-current-price">$${p.price.toFixed(2)}</span>
          ${oldPriceHTML}
        </div>

        <button class="expandable-bag-btn" onclick="handleAddToCartClick(${p.id}, event)" aria-label="Add ${p.name} to Bag">
          <span class="bag-btn-text">ADD TO BAG</span>
          <span class="bag-btn-arrow">&rarr;</span>
        </button>
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
    if (!allChecked && shopFilter.cats.length && !shopFilter.cats.includes(p.category)) return false;
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
  else if (sortVal === 'newest') filtered.sort((a, b) => (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0) || b.id - a.id);

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
    chips.push({ label: `Under $${shopFilter.maxPrice}`, action: `resetPrice()` });
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
  const el = document.getElementById('cat' + cat.charAt(0).toUpperCase() + cat.slice(1));
  if (el) el.checked = false;
  const mEl = document.getElementById('mCat' + cat.charAt(0).toUpperCase() + cat.slice(1));
  if (mEl) mEl.checked = false;

  const remaining = Array.from(document.querySelectorAll('input[name="cat"]:not(#catAll):not(#mCatAll):checked'));
  if (!remaining.length) {
    const catAll = document.getElementById('catAll');
    if (catAll) catAll.checked = true;
    const mCatAll = document.getElementById('mCatAll');
    if (mCatAll) mCatAll.checked = true;
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
  const catAll = document.getElementById('catAll');
  if (catAll) catAll.checked = true;
  const mCatAll = document.getElementById('mCatAll');
  if (mCatAll) mCatAll.checked = true;

  document.querySelectorAll('input[name="cat"]').forEach(i => {
    if (i.value !== 'all') i.checked = false;
  });

  const slider = document.getElementById('priceSlider');
  if (slider) slider.value = 300;
  const mSlider = document.getElementById('mPriceSlider');
  if (mSlider) mSlider.value = 300;

  const starsAll = document.getElementById('starsAll');
  if (starsAll) starsAll.checked = true;
  const mStarsAll = document.getElementById('mStarsAll');
  if (mStarsAll) mStarsAll.checked = true;

  document.querySelectorAll('input[name="highlight"]').forEach(i => i.checked = false);

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
  const specificInputs = Array.from(document.querySelectorAll(`input[name="cat"]`)).filter(i => i.value !== 'all');

  const catAll = document.getElementById('catAll');
  const mCatAll = document.getElementById('mCatAll');

  if (isAll) {
    if (input.checked) {
      specificInputs.forEach(i => i.checked = false);
    } else {
      input.checked = true;
    }
  } else {
    const anyChecked = specificInputs.some(i => i.checked);
    if (anyChecked) {
      if (catAll) catAll.checked = false;
      if (mCatAll) mCatAll.checked = false;
    } else {
      if (catAll) catAll.checked = true;
      if (mCatAll) mCatAll.checked = true;
    }
  }

  // Synchronize desktop & mobile checkboxes
  document.querySelectorAll(`input[name="cat"][value="${input.value}"]`).forEach(peer => {
    peer.checked = input.checked;
  });

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
