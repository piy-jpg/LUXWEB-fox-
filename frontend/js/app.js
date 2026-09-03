/* ============================================================
   LUMIÈRE BEAUTY — App Logic (app.js)
   ============================================================ */

/* ---------- PRODUCT DATA ---------- */
const PRODUCTS = [
  {
    id: 1,
    name: 'Radiance Glow Serum',
    category: 'skincare',
    categoryLabel: 'Skincare',
    desc: 'Vitamin C & hyaluronic acid blend for glass-skin luminosity',
    price: 128,
    oldPrice: null,
    badge: 'Bestseller',
    stars: 5,
    img: 'images/skincare_products_1788328338930.jpg',
  },
  {
    id: 2,
    name: 'Velvet Lip Collection',
    category: 'makeup',
    categoryLabel: 'Makeup',
    desc: 'Richly pigmented matte lipstick with 12-hour lasting power',
    price: 58,
    oldPrice: 78,
    badge: 'Sale',
    stars: 5,
    img: 'images/makeup_products_1788328354838.jpg',
  },
  {
    id: 3,
    name: 'Noir d\'Or Eau de Parfum',
    category: 'fragrance',
    categoryLabel: 'Fragrance',
    desc: 'Warm oud, amber & vanilla — your signature evening scent',
    price: 215,
    oldPrice: null,
    badge: 'New',
    stars: 5,
    img: 'images/perfume_collection_1788328378783.jpg',
  },
  {
    id: 4,
    name: 'Restorative Night Cream',
    category: 'skincare',
    categoryLabel: 'Skincare',
    desc: 'Peptide-rich overnight treatment for plump, rested skin',
    price: 96,
    oldPrice: null,
    badge: null,
    stars: 4,
    img: 'images/skincare_products_1788328338930.jpg',
  },
  {
    id: 5,
    name: 'Pro Eyeshadow Palette',
    category: 'makeup',
    categoryLabel: 'Makeup',
    desc: '12 jewel-toned shades from satin to ultra-metallic',
    price: 82,
    oldPrice: 110,
    badge: 'Sale',
    stars: 5,
    img: 'images/makeup_products_1788328354838.jpg',
  },
  {
    id: 6,
    name: 'Rose Bloom Eau de Toilette',
    category: 'fragrance',
    categoryLabel: 'Fragrance',
    desc: 'Fresh Bulgarian rose, peony & white musk — a daylight dream',
    price: 165,
    oldPrice: null,
    badge: null,
    stars: 4,
    img: 'images/perfume_collection_1788328378783.jpg',
  },
  {
    id: 7,
    name: 'Rosehip Facial Oil',
    category: 'skincare',
    categoryLabel: 'Skincare',
    desc: 'Cold-pressed rosehip & squalane for deep nourishment',
    price: 74,
    oldPrice: null,
    badge: 'New',
    stars: 5,
    img: 'images/skincare_products_1788328338930.jpg',
  },
  {
    id: 8,
    name: 'Gold Highlighter',
    category: 'makeup',
    categoryLabel: 'Makeup',
    desc: 'Ultra-fine champagne gold pigment for ethereal glow',
    price: 46,
    oldPrice: null,
    badge: 'Bestseller',
    stars: 5,
    img: 'images/makeup_products_1788328354838.jpg',
  },
];

/* ---------- STATE ---------- */
let cart = [];
let activeFilter = 'all';
let currentTestimonial = 0;
let countdownEnd = Date.now() + (8 * 3600 + 45 * 60) * 1000;

/* ============================================================
   NAVBAR SCROLL BEHAVIOR
   ============================================================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/* ============================================================
   HAMBURGER MENU
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  navLinks.style.flexDirection = 'column';
  navLinks.style.position = 'absolute';
  navLinks.style.top = '100%';
  navLinks.style.left = '0';
  navLinks.style.right = '0';
  navLinks.style.background = 'rgba(13,10,14,0.97)';
  navLinks.style.padding = '2rem';
  navLinks.style.gap = '1.5rem';
  navLinks.style.borderBottom = '1px solid rgba(201,169,110,0.15)';
  navbar.style.position = 'fixed';
});

/* ============================================================
   HERO PARTICLES
   ============================================================ */
function createParticles() {
  const container = document.getElementById('heroParticles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.setProperty('--dur', (4 + Math.random() * 6) + 's');
    p.style.setProperty('--delay', -(Math.random() * 6) + 's');
    p.style.width = (1 + Math.random() * 3) + 'px';
    p.style.height = p.style.width;
    container.appendChild(p);
  }
}
createParticles();

/* ============================================================
   PRODUCT RENDERING
   ============================================================ */
function renderStars(n) {
  let html = '<div class="product-stars">';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star${i > n ? ' empty' : ''}">★</span>`;
  }
  return html + '</div>';
}

function renderProducts(filter = 'all') {
  const grid = document.getElementById('productsGrid');
  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  grid.innerHTML = '';
  filtered.forEach((p, idx) => {
    const card = document.createElement('div');
    card.className = 'product-card reveal';
    card.style.animationDelay = (idx * 0.07) + 's';
    card.innerHTML = `
      <div class="product-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <div class="product-actions">
          <button class="product-action-btn" onclick="toggleWishlist(${p.id}, this)" aria-label="Add to wishlist" id="wish-${p.id}">♡</button>
          <button class="product-action-btn" onclick="quickView(${p.id})" aria-label="Quick view" id="qv-${p.id}">👁</button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${p.categoryLabel}</div>
        ${renderStars(p.stars)}
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div class="product-price">
            ${p.oldPrice ? `<span class="old-price">$${p.oldPrice}</span>` : ''}
            $${p.price}
          </div>
          <button class="add-to-cart-btn" onclick="addToCart(${p.id})" id="cart-btn-${p.id}" aria-label="Add ${p.name} to cart">+ Add</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  observeReveal();
}
renderProducts();

/* ============================================================
   FILTER PRODUCTS
   ============================================================ */
function filterProducts(filter, btn) {
  activeFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(filter);
}

function filterCategory(cat) {
  window.location.hash = 'featured';
  setTimeout(() => filterProducts(cat, document.querySelector(`[data-filter="${cat}"]`)), 300);
}

/* ============================================================
   CART
   ============================================================ */
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCart();
  showToast(`<span class="toast-icon">✦</span> <strong>${product.name}</strong> added to your bag`);
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  updateCart();
  renderCartItems();
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(productId);
  else { updateCart(); renderCartItems(); }
}

function updateCart() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cartBadge');
  badge.textContent = total;
  badge.classList.toggle('show', total > 0);
  document.getElementById('cartItemCount').textContent = `(${total})`;
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cartTotalPrice').textContent = `$${totalPrice.toFixed(2)}`;
  document.getElementById('cartFooter').style.display = cart.length ? 'flex' : 'none';
  document.getElementById('cartEmpty').style.display = cart.length ? 'none' : 'block';
  renderCartItems();
}

function renderCartItems() {
  const el = document.getElementById('cartItems');
  el.innerHTML = cart.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)" aria-label="Decrease quantity">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})" aria-label="Remove item">✕ Remove</button>
    </div>
  `).join('');
}

function toggleCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  const open = drawer.classList.toggle('open');
  overlay.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

document.getElementById('cartBtn').addEventListener('click', toggleCart);
document.getElementById('checkoutBtn').addEventListener('click', () => {
  showToast('<span class="toast-icon">✦</span> Checkout feature coming soon!');
});

/* ============================================================
   WISHLIST
   ============================================================ */
const wishlist = new Set();
function toggleWishlist(id, btn) {
  if (wishlist.has(id)) {
    wishlist.delete(id);
    btn.style.color = '';
    showToast('Removed from wishlist');
  } else {
    wishlist.add(id);
    btn.textContent = '♥';
    btn.style.color = '#d4758a';
    showToast('<span class="toast-icon">♥</span> Added to wishlist!');
  }
}

function quickView(id) {
  const p = PRODUCTS.find(x => x.id === id);
  showToast(`<span class="toast-icon">👁</span> <strong>${p.name}</strong> — $${p.price}`);
}

/* ============================================================
   TESTIMONIALS CAROUSEL
   ============================================================ */
const testimonials = document.querySelectorAll('.testimonial-card');
const dots = document.querySelectorAll('.dot');

function goToTestimonial(idx) {
  testimonials[currentTestimonial].classList.remove('active');
  dots[currentTestimonial].classList.remove('active');
  currentTestimonial = idx;
  testimonials[currentTestimonial].classList.add('active');
  dots[currentTestimonial].classList.add('active');
}

let autoSlide = setInterval(() => {
  goToTestimonial((currentTestimonial + 1) % testimonials.length);
}, 5000);

document.querySelector('.testimonials-carousel').addEventListener('click', () => {
  clearInterval(autoSlide);
});

/* ============================================================
   COUNTDOWN TIMER
   ============================================================ */
function updateCountdown() {
  const remaining = Math.max(0, countdownEnd - Date.now());
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  document.getElementById('cdHours').textContent = String(h).padStart(2, '0');
  document.getElementById('cdMins').textContent = String(m).padStart(2, '0');
  document.getElementById('cdSecs').textContent = String(s).padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

/* ============================================================
   NEWSLETTER
   ============================================================ */
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('newsletterEmail').value;
  showToast(`<span class="toast-icon">✦</span> Welcome to the inner circle! Check <strong>${email}</strong>`);
  document.getElementById('newsletterForm').reset();
}

/* ============================================================
   TOAST
   ============================================================ */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ============================================================
   SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
function observeReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal:not(.revealed)').forEach(el => observer.observe(el));
}

// Add reveal class to section elements
document.querySelectorAll('.section-header, .cat-card, .pillar, .testimonial-card, .about-text, .about-title').forEach(el => {
  el.classList.add('reveal');
});
observeReveal();

/* ============================================================
   SEARCH (stub)
   ============================================================ */
document.getElementById('searchBtn').addEventListener('click', () => {
  showToast('<span class="toast-icon">🔍</span> Search coming soon — stay tuned!');
});

/* ============================================================
   SMOOTH SCROLL FOR NAV LINKS
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile nav
      if (window.innerWidth < 900) navLinks.style.display = 'none';
    }
  });
});

/* ============================================================
   ACTIVE NAV ON SCROLL
   ============================================================ */
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY + 120;
  sections.forEach(sec => {
    const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
    if (!link) return;
    if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
      document.querySelectorAll('.nav-links a').forEach(l => l.style.color = '');
      link.style.color = 'var(--gold-light)';
    }
  });
}, { passive: true });

console.log('%c✦ Lumière Beauty ✦', 'color: #c9a96e; font-size: 20px; font-family: Georgia, serif;');
console.log('%cLuxury cosmetics, crafted with conscience.', 'color: #9a8a83; font-size: 12px;');
