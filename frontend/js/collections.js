/* ============================================================
   LUMIÈRE BEAUTY — ATELIER COLLECTIONS JAVASCRIPT SUITE
   ============================================================ */

const COLLECTIONS_DATA = {
  golden: {
    season: 'AW 2026 — Featured Collection',
    batch: 'Limited Run • Batch Nº 082',
    location: 'Place Vendôme, Paris',
    title: 'The Golden Hour<br/><em>Collection</em>',
    desc: 'Inspired by warm amber evenings in Paris, this collection merges luminous skincare with bold, candlelit makeup. Think molten gold highlighters, velvet lips, and serums that glow like the setting sun.',
    heroImg: 'images/hero_banner_1788328324240.jpg',
    insetImg: 'images/model_portrait_1788328392448.jpg',
    insetText: 'Twilight Formulation Nº 01',
    accords: [
      '✦ 24K Molten Gold Mica',
      '✦ Bulgarian Damask Rose',
      '✦ Smoked Ambergris',
      '✦ Cold-Pressed Camellia Seed'
    ],
    products: [
      {
        id: 1,
        name: 'Radiance Glow Serum',
        sub: 'Hydra-Luminance Elixir • 30ml',
        price: '₹128.00',
        rawPrice: 128,
        img: 'images/skincare_products_1788328338930.jpg',
        rating: '5.0 ★'
      },
      {
        id: 8,
        name: 'Gold Highlighter',
        sub: 'Molten 24K Velvet Compact • 10g',
        price: '₹46.00',
        rawPrice: 46,
        img: 'images/makeup_products_1788328354838.jpg',
        rating: '4.9 ★'
      },
      {
        id: 3,
        name: "Noir d'Or Parfum",
        sub: 'Haute Amber Extract • 100ml',
        price: '₹215.00',
        rawPrice: 215,
        img: 'images/perfume_collection_1788328378783.jpg',
        rating: '5.0 ★'
      }
    ],
    cta: { text: 'Shop Golden Hour →', link: 'shop.html' },
    num: '01'
  },
  bloom: {
    season: 'SS 2026 — Forthcoming Edit',
    batch: 'Botanical Release • March 2026',
    location: 'Giverny Gardens, France',
    title: 'Spring Bloom<br/><em>Edit</em>',
    desc: 'Fresh botanicals, dewy finishes, and the lightest touch of blush colour. A celebration of new beginnings, petal-soft textures, and the most radiant skin of your life.',
    heroImg: 'images/skincare_products_1788328338930.jpg',
    insetImg: 'images/glow_edit_campaign.jpg',
    insetText: 'Petal Extract Nº 02',
    accords: [
      '✦ Organic Rosehip Nectar',
      '✦ Wild Damask Rose',
      '✦ Hyaluronic Hydro-Glow',
      '✦ Meadowfoam Seed'
    ],
    products: [
      {
        id: 7,
        name: 'Rosehip Facial Oil',
        sub: 'Cold-Pressed Botanical Elixir • 30ml',
        price: '₹74.00',
        rawPrice: 74,
        img: 'images/skincare_products_1788328338930.jpg',
        rating: '4.9 ★'
      },
      {
        id: 4,
        name: 'Restorative Night Cream',
        sub: 'Triple Peptide Moisture Creme • 50ml',
        price: '₹96.00',
        rawPrice: 96,
        img: 'images/skincare_products_1788328338930.jpg',
        rating: '4.8 ★'
      },
      {
        id: 6,
        name: 'Rose Bloom Eau de Toilette',
        sub: 'Dewy Floral Fragrance • 50ml',
        price: '₹165.00',
        rawPrice: 165,
        img: 'images/perfume_collection_1788328378783.jpg',
        rating: '5.0 ★'
      }
    ],
    cta: { text: 'Shop Spring Bloom →', link: 'shop.html?cat=skincare' },
    num: '02'
  },
  noir: {
    season: 'AW 2025 — Archive Vault',
    batch: 'Limited Pieces Remaining',
    location: 'Le Marais Nocturne, Paris',
    title: 'Noir<br/><em>Edition</em>',
    desc: 'Bold jewel tones, dramatic eyes, and midnight luxury at its finest. The Noir Edition is a love letter to the night — seductive, confident, and utterly unforgettable.',
    heroImg: 'images/makeup_products_1788328354838.jpg',
    insetImg: 'images/editorial_flatlay.jpg',
    insetText: 'Velvet Midnight Nº 03',
    accords: [
      '✦ Midnight Obsidian Mica',
      '✦ French Black Truffle',
      '✦ Crushed Velvet Pigment',
      '✦ Smoked Blackberry'
    ],
    products: [
      {
        id: 2,
        name: 'Velvet Lip Collection',
        sub: 'Satin Matte Lip Color • 4.5g',
        price: '₹58.00',
        rawPrice: 58,
        img: 'images/makeup_products_1788328354838.jpg',
        rating: '5.0 ★'
      },
      {
        id: 5,
        name: 'Pro Eyeshadow Palette',
        sub: '12-Pan Molten Jewel Shadows • 18g',
        price: '₹82.00',
        rawPrice: 82,
        img: 'images/makeup_products_1788328354838.jpg',
        rating: '4.9 ★'
      },
      {
        id: 8,
        name: 'Gold Highlighter',
        sub: 'Molten 24K Velvet Compact • 10g',
        price: '₹46.00',
        rawPrice: 46,
        img: 'images/makeup_products_1788328354838.jpg',
        rating: '4.9 ★'
      }
    ],
    cta: { text: 'Shop Noir Edition →', link: 'shop.html?cat=makeup' },
    num: '03'
  },
  crystal: {
    season: 'SS 2025 — Heritage Selection',
    batch: 'Private Atelier Vault',
    location: 'Cap d\'Antibes, French Riviera',
    title: 'Crystal<br/><em>Clear</em>',
    desc: 'Clean scents, glass-skin formulas, and pure transparency in beauty. The purest expression of the Lumière philosophy — letting your natural radiance lead.',
    heroImg: 'images/perfume_collection_1788328378783.jpg',
    insetImg: 'images/category_3_fragrance_34.jpg',
    insetText: 'Ozone Flacon Nº 04',
    accords: [
      '✦ Pure White Amber',
      '✦ Distilled Ozone Jasmine',
      '✦ Marine Peptide Complex',
      '✦ Glacial Mineral Water'
    ],
    products: [
      {
        id: 3,
        name: "Noir d'Or Eau de Parfum",
        sub: 'Haute Amber Extract • 100ml',
        price: '₹215.00',
        rawPrice: 215,
        img: 'images/perfume_collection_1788328378783.jpg',
        rating: '5.0 ★'
      },
      {
        id: 1,
        name: 'Radiance Glow Serum',
        sub: 'Hydra-Luminance Elixir • 30ml',
        price: '₹128.00',
        rawPrice: 128,
        img: 'images/skincare_products_1788328338930.jpg',
        rating: '5.0 ★'
      },
      {
        id: 6,
        name: 'Rose Bloom Eau de Toilette',
        sub: 'Dewy Floral Fragrance • 50ml',
        price: '₹165.00',
        rawPrice: 165,
        img: 'images/perfume_collection_1788328378783.jpg',
        rating: '4.8 ★'
      }
    ],
    cta: { text: 'Shop Crystal Clear →', link: 'shop.html?cat=fragrance' },
    num: '04'
  }
};

let currentColl = 'golden';

/* ============================================================
   FEATURED SPOTLIGHT RENDERER
   ============================================================ */
function renderFeatCollection(key) {
  const d = COLLECTIONS_DATA[key] || COLLECTIONS_DATA.golden;
  const el = document.getElementById('featCollInner');
  if (!el) return;

  el.innerHTML = `
    <!-- Left: Haute Media Presentation with Inset Frame -->
    <div class="fc-media-container" style="animation: fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;">
      <div class="fc-hero-frame">
        <div class="fc-location-pill">
          <span class="dot"></span>
          <span>${d.location}</span>
        </div>
        <div class="fc-paris-stamp">PARIS ATELIER</div>
        <img src="${d.heroImg}" alt="${d.title.replace(/<[^>]*>/g, '')}" class="fc-hero-img" onerror="this.src='images/hero_banner_1788328324240.jpg'" />
      </div>

      <div class="fc-inset-frame">
        <img src="${d.insetImg}" alt="${d.insetText}" onerror="this.src='images/model_portrait_1788328392448.jpg'" />
        <div class="fc-inset-caption">✦ ${d.insetText}</div>
      </div>
    </div>

    <!-- Right: Editorial Narrative & Star Products -->
    <div class="fc-editorial-deck" style="animation: fadeInUp 0.7s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both;">
      <div class="fc-badges-row">
        <span class="fc-season-badge">${d.season}</span>
        <span class="fc-batch-badge">${d.batch}</span>
      </div>

      <h2 class="fc-title">${d.title}</h2>
      <p class="fc-desc">${d.desc}</p>

      <div class="fc-accords-wrap">
        ${d.accords.map(a => `<span class="fc-accord-chip">${a}</span>`).join('')}
      </div>

      <!-- Star Products Mini-Showcase -->
      <div class="fc-products-section-header">
        <span>Curated Collection Stars (${d.products.length})</span>
      </div>

      <div class="fc-products-deck">
        ${d.products.map(p => `
          <div class="fc-product-card">
            <img src="${p.img}" alt="${p.name}" class="fc-product-thumb" onerror="this.src='images/skincare_products_1788328338930.jpg'" />
            <div class="fc-product-info">
              <div class="fc-product-name">
                <span>${p.name}</span>
                <span style="font-size:0.75rem; color:var(--color-gold); font-weight:normal;">${p.rating}</span>
              </div>
              <div class="fc-product-sub">${p.sub}</div>
            </div>
            <div class="fc-product-price">${p.price}</div>
            <button type="button" class="fc-add-bag-btn" onclick="addCollectionProductToBag(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.rawPrice}, '${p.img}')">
              + ADD TO BAG
            </button>
          </div>
        `).join('')}
      </div>

      <div class="fc-actions-row">
        <a href="${d.cta.link}" class="btn-luxury-primary" style="padding:0.95rem 2rem;">
          <span>✦</span> ${d.cta.text}
        </a>
        <a href="#campaign-lookbook" class="btn-luxury-outline" style="padding:0.95rem 1.6rem;">
          VIEW LOOKBOOK ARCHIVE &darr;
        </a>
      </div>
    </div>
  `;
}

function switchColl(key, btn) {
  currentColl = key;
  document.querySelectorAll('.coll-tab').forEach(t => t.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const tabEl = document.querySelector(`.coll-tab[data-coll="${key}"]`);
    if (tabEl) tabEl.classList.add('active');
  }
  renderFeatCollection(key);
}

function addCollectionProductToBag(id, name, price, img) {
  if (typeof addToCart === 'function') {
    addToCart(id, 1);
  } else {
    // Fallback if addToCart global is unavailable
    const raw = localStorage.getItem('lumiere_cart') || '[]';
    let cart = [];
    try { cart = JSON.parse(raw); } catch { cart = []; }
    const existing = cart.find(i => (i.id === id || i.productId === id));
    if (existing) existing.qty = (existing.qty || 1) + 1;
    else cart.push({ id, productId: id, name, price, img, qty: 1 });
    localStorage.setItem('lumiere_cart', JSON.stringify(cart));
    if (typeof updateCartUI === 'function') updateCartUI();
  }

  if (typeof showToast === 'function') {
    showToast(`✦ Added ${name} to your shopping bag.`);
  }
}

/* ============================================================
   LOOKBOOK CAMPAIGN MOMENTS (INTERACTIVE LIGHTBOX)
   ============================================================ */
const LOOKBOOK_DATA = [
  {
    id: 'muse',
    tag: 'MOMENT 01 • 35MM ANALOG • PARIS',
    cat: 'GOLDEN HOUR CAMPAIGN',
    title: 'The Muse',
    desc: 'Behind the lens at Place des Vosges in the heart of Paris. The setting twilight sun illuminates skin with molten amber reflection.',
    quote: '“Light in Paris at 19:42 dusk is irreplaceable. It transforms skin into living poetry.”',
    img: 'images/model_portrait_1788328392448.jpg',
    prodId: 1,
    prodName: 'Radiance Glow Serum',
    prodPrice: '₹128.00',
    prodRawPrice: 128,
    prodImg: 'images/skincare_products_1788328338930.jpg'
  },
  {
    id: 'ritual',
    tag: 'MOMENT 02 • BOTANICAL FORMULATION',
    cat: 'SKINCARE EDIT',
    title: 'Ritual',
    desc: 'Cold-pressed botanical elixirs formulated under temperature-controlled darkness to preserve living molecular integrity.',
    quote: '“True luxury begins in silence, where natural botanicals distill into pure skin luminescence.”',
    img: 'images/skincare_products_1788328338930.jpg',
    prodId: 7,
    prodName: 'Rosehip Facial Oil',
    prodPrice: '₹74.00',
    prodRawPrice: 74,
    prodImg: 'images/skincare_products_1788328338930.jpg'
  },
  {
    id: 'drama',
    tag: 'MOMENT 03 • 24K MOLTEN PIGMENT',
    cat: 'MAKEUP COLLECTION',
    title: 'Drama',
    desc: 'Hand-milled 24K gold mica suspended in hydrating velvet medium for high-impact reflection and weightless comfort.',
    quote: '“Drama in beauty is not about masking — it is about commanding the room with molten illumination.”',
    img: 'images/makeup_products_1788328354838.jpg',
    prodId: 8,
    prodName: 'Gold Highlighter',
    prodPrice: '₹46.00',
    prodRawPrice: 46,
    prodImg: 'images/makeup_products_1788328354838.jpg'
  },
  {
    id: 'house',
    tag: 'MOMENT 04 • SALON PRIVÉ SUITE',
    cat: 'AUTUMN / WINTER 2026',
    title: 'The House',
    desc: 'The private Parisian boutique atelier where formula, architecture, and high fashion converge.',
    quote: '“Our house is built on the conviction that personal beauty deserves white-glove couture care.”',
    img: 'images/collections_hero.jpg',
    prodId: 3,
    prodName: "Noir d'Or Parfum",
    prodPrice: '₹215.00',
    prodRawPrice: 215,
    prodImg: 'images/perfume_collection_1788328378783.jpg'
  },
  {
    id: 'signature',
    tag: 'MOMENT 05 • HAUTE PARFUMERIE',
    cat: 'FRAGRANCE EDIT',
    title: 'Signature',
    desc: 'Hand-blown crystal flacons carrying rare smoked ambergris, Bulgarian damask rose absolute, and dark cedarwood.',
    quote: '“A perfume is the invisible couture gown you wear into midnight.”',
    img: 'images/perfume_collection_1788328378783.jpg',
    prodId: 3,
    prodName: "Noir d'Or Eau de Parfum",
    prodPrice: '₹215.00',
    prodRawPrice: 215,
    prodImg: 'images/perfume_collection_1788328378783.jpg'
  }
];

let activeLookbookIdx = 0;

function openLookbookModal(idx) {
  activeLookbookIdx = Math.max(0, Math.min(idx, LOOKBOOK_DATA.length - 1));
  const data = LOOKBOOK_DATA[activeLookbookIdx];
  const modal = document.getElementById('lookbookModal');
  if (!modal) return;

  document.getElementById('lbModalImg').src = data.img;
  document.getElementById('lbModalTag').textContent = data.tag;
  document.getElementById('lbModalCat').textContent = data.cat;
  document.getElementById('lbModalTitle').textContent = data.title;
  document.getElementById('lbModalDesc').textContent = data.desc;
  document.getElementById('lbModalQuote').textContent = data.quote;
  document.getElementById('lbModalProdImg').src = data.prodImg;
  document.getElementById('lbModalProdName').textContent = data.prodName;
  document.getElementById('lbModalProdPrice').textContent = data.prodPrice;

  const btn = document.getElementById('lbModalProdBtn');
  if (btn) {
    btn.onclick = () => {
      addCollectionProductToBag(data.prodId, data.prodName, data.prodRawPrice, data.prodImg);
    };
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLookbookModal() {
  const modal = document.getElementById('lookbookModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function navLookbook(dir) {
  let newIdx = activeLookbookIdx + dir;
  if (newIdx < 0) newIdx = LOOKBOOK_DATA.length - 1;
  if (newIdx >= LOOKBOOK_DATA.length) newIdx = 0;
  openLookbookModal(newIdx);
}

function filterLookbook(cat, btn) {
  document.querySelectorAll('.lb-filter-chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const items = document.querySelectorAll('.lookbook-masonry .lb-item');
  items.forEach(item => {
    const itemCat = item.getAttribute('data-moment-cat');
    if (cat === 'all' || itemCat === cat) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

/* ============================================================
   SEASONS FILTER
   ============================================================ */
function filterSeasons(type, btn) {
  document.querySelectorAll('.season-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('.all-colls-grid .ac-card');
  cards.forEach(card => {
    const season = card.getAttribute('data-season-type');
    if (type === 'all' || season === type) {
      card.style.display = 'grid';
    } else {
      card.style.display = 'none';
    }
  });
}

/* ============================================================
   SALON PRIVÉ NEWSLETTER INVITATION
   ============================================================ */
function handleCollNL(e) {
  e.preventDefault();
  const emailInput = document.getElementById('cnEmail');
  const email = (emailInput ? emailInput.value : '').trim();
  if (!email || !email.includes('@')) {
    if (typeof showToast === 'function') showToast('⚠️ Please provide a valid email for salon access.');
    return;
  }

  const vipPass = document.getElementById('cnVipPass');
  const vipEmail = document.getElementById('cnVipEmail');
  const vipId = document.getElementById('cnVipPassId');
  const form = document.getElementById('cnForm');

  if (vipEmail) vipEmail.textContent = email;
  if (vipId) vipId.textContent = `VIP-SALON-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  if (vipPass) vipPass.style.display = 'block';
  if (form) form.style.display = 'none';

  if (typeof showToast === 'function') {
    showToast(`✦ Welcome to the Lumière Salon Privé! VIP Invitation sent to ${email}`);
  }
}

// Global exposure
window.switchColl = switchColl;
window.renderFeatCollection = renderFeatCollection;
window.addCollectionProductToBag = addCollectionProductToBag;
window.openLookbookModal = openLookbookModal;
window.closeLookbookModal = closeLookbookModal;
window.navLookbook = navLookbook;
window.filterLookbook = filterLookbook;
window.filterSeasons = filterSeasons;
window.handleCollNL = handleCollNL;

// Keyboard navigation for lookbook modal
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('lookbookModal');
  if (modal && modal.classList.contains('active')) {
    if (e.key === 'Escape') closeLookbookModal();
    if (e.key === 'ArrowLeft') navLookbook(-1);
    if (e.key === 'ArrowRight') navLookbook(1);
  }
});

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  renderFeatCollection('golden');
});

