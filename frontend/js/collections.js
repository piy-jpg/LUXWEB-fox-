/* collections.js */

const COLLECTIONS_DATA = {
  golden: {
    season: 'AW 2026 — Featured',
    title: 'The Golden Hour<br/><em>Collection</em>',
    desc: 'Inspired by warm amber evenings in Paris, this collection merges luminous skincare with bold, candlelit makeup. Think molten gold highlighters, velvet lips, and serums that glow like the setting sun.',
    img: 'images/hero_banner_1788328324240.jpg',
    products: [
      { name: 'Radiance Glow Serum', price: '$128' },
      { name: 'Gold Highlighter', price: '$46' },
      { name: "Noir d'Or Parfum", price: '$215' },
    ],
    cta: { text: 'Shop Golden Hour →', link: 'shop.html' },
    num: '01',
  },
  bloom: {
    season: 'SS 2026',
    title: 'Spring Bloom<br/><em>Edit</em>',
    desc: 'Fresh botanicals, dewy finishes, and the lightest touch of blush colour. A celebration of new beginnings, petal-soft textures, and the most radiant skin of your life.',
    img: 'images/skincare_products_1788328338930.jpg',
    products: [
      { name: 'Rosehip Facial Oil', price: '$74' },
      { name: 'Hyaluronic Plump Mist', price: '$55' },
      { name: 'Rose Bloom Eau de Toilette', price: '$165' },
    ],
    cta: { text: 'Shop Spring Bloom →', link: 'shop.html?cat=skincare' },
    num: '02',
  },
  noir: {
    season: 'AW 2025',
    title: 'Noir<br/><em>Edition</em>',
    desc: 'Bold jewel tones, dramatic eyes, and midnight luxury at its finest. The Noir Edition is a love letter to the night — seductive, confident, and utterly unforgettable.',
    img: 'images/makeup_products_1788328354838.jpg',
    products: [
      { name: 'Velvet Lip Collection', price: '$58' },
      { name: 'Pro Eyeshadow Palette', price: '$82' },
      { name: 'Velvet Bronzing Drops', price: '$64' },
    ],
    cta: { text: 'Shop Noir Edition →', link: 'shop.html?cat=makeup' },
    num: '03',
  },
  crystal: {
    season: 'SS 2025',
    title: 'Crystal<br/><em>Clear</em>',
    desc: 'Transparency in beauty. Clean scents, glass-skin formulas, and minimal luxury that lets your natural beauty lead. The purest expression of the Lumière philosophy.',
    img: 'images/perfume_collection_1788328378783.jpg',
    products: [
      { name: 'Jasmin Noir Parfum', price: '$195' },
      { name: 'Peptide Eye Complex', price: '$88' },
      { name: 'Rose Bloom Eau de Toilette', price: '$165' },
    ],
    cta: { text: 'Shop Crystal Clear →', link: 'shop.html?cat=fragrance' },
    num: '04',
  },
};

let currentColl = 'golden';

function renderFeatCollection(key) {
  const d = COLLECTIONS_DATA[key];
  const el = document.getElementById('featCollInner');
  el.innerHTML = `
    <div class="fc-img-col" style="animation:scaleIn 0.6s both">
      <img src="${d.img}" alt="${d.title.replace(/<[^>]*>/g,'')}" />
    </div>
    <div class="fc-content" data-num="${d.num}" style="animation:fadeInUp 0.6s 0.1s both">
      <div class="fc-season">${d.season}</div>
      <h2 class="fc-title">${d.title}</h2>
      <p class="fc-desc">${d.desc}</p>
      <div class="fc-products">
        ${d.products.map(p => `
          <div class="fc-product-line">
            <span class="fp-dot"></span>
            <span>${p.name}</span>
            <span class="fp-price">${p.price}</span>
          </div>`).join('')}
      </div>
      <a href="${d.cta.link}" class="btn-primary">${d.cta.text}</a>
    </div>`;
}

function switchColl(key, btn) {
  currentColl = key;
  document.querySelectorAll('.coll-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderFeatCollection(key);
}

function handleCollNL(e) {
  e.preventDefault();
  const email = document.getElementById('cnEmail').value;
  showToast(`<span class="toast-icon">✦</span> You'll be first to know! <strong>${email}</strong>`);
  e.target.reset();
}

// Init
renderFeatCollection('golden');
