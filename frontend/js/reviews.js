/* ============================================================
   LUMIÈRE BEAUTY — ATELIER REVIEWS JAVASCRIPT SUITE
   ============================================================ */

const ALL_REVIEWS = [
  {
    id: 1,
    name: 'Camille Laurent',
    initials: 'CL',
    avatar: 'images/clients/client1.jpg',
    location: 'Paris, France',
    cat: 'skincare',
    product: 'Radiance Glow Serum',
    prodId: 1,
    prodImg: 'images/skincare_products_1788328338930.jpg',
    prodPrice: '₹128.00',
    prodRawPrice: 128,
    rating: 5,
    title: 'The indisputable pinnacle of skincare',
    text: 'Lumière completely transformed my complexion. The Radiance Serum gave me that elusive glass-skin glow I had been chasing across Parisian salons for years. After 14 days my skin was brighter, visibly lifted, and strangers on Avenue Montaigne stopped to ask what I was wearing. Worth every single cent.',
    date: 'August 2026',
    helpful: 184,
    featured: true,
    verified: true,
    tags: ['Glowing Skin', 'Holy Grail', 'Glass Skin']
  },
  {
    id: 2,
    name: 'Amelia Rossi',
    initials: 'AR',
    avatar: 'images/clients/client2.jpg',
    location: 'London, UK',
    cat: 'skincare',
    product: 'Restorative Night Cream',
    prodId: 4,
    prodImg: 'images/skincare_products_1788328338930.jpg',
    prodPrice: '₹96.00',
    prodRawPrice: 96,
    rating: 5,
    title: 'Woke up looking like I slept for a century',
    text: 'I was hesitant about a £96 night cream, but the Restorative Night Cream is genuinely life-altering. My skin looks replenished, plush, and calm even during frantic London fashion schedules. The texture is divine — rich without being heavy, melting instantly into cell depth.',
    date: 'August 2026',
    helpful: 129,
    verified: true,
    tags: ['Rich Texture', 'Fast Results']
  },
  {
    id: 3,
    name: 'Marie Dupont',
    initials: 'MD',
    avatar: 'images/clients/client3.jpg',
    location: 'Paris, France',
    cat: 'fragrance',
    product: "Noir d'Or Eau de Parfum",
    prodId: 3,
    prodImg: 'images/perfume_collection_1788328378783.jpg',
    prodPrice: '₹215.00',
    prodRawPrice: 215,
    rating: 5,
    title: 'A fragrance that commands every room',
    text: 'Noir d\'Or is pure poetry in a bottle. The opening of smoked ambergris and Bulgarian damask rose is warm and hypnotic; the dry-down is intimate, velvety, and addictive. I receive compliments every single evening I wear it to the opera.',
    date: 'July 2026',
    helpful: 112,
    verified: true,
    tags: ['Divine Longevity', 'Holy Grail']
  },
  {
    id: 4,
    name: 'Rachel Kim',
    initials: 'RK',
    avatar: 'images/clients/client4.jpg',
    location: 'Los Angeles, USA',
    cat: 'makeup',
    product: 'Pro Eyeshadow Palette',
    prodId: 5,
    prodImg: 'images/makeup_products_1788328354838.jpg',
    prodPrice: '₹82.00',
    prodRawPrice: 82,
    rating: 5,
    title: 'Every red-carpet makeup artist needs this',
    text: 'I am a working celebrity makeup artist in Beverly Hills and this palette is a permanent staple in my kit. The pigmentation is insane, the molten mica blends like liquefied silk, and it stays pristine under 4K studio spotlights for 14+ hours.',
    date: 'July 2026',
    helpful: 95,
    verified: true,
    tags: ['24K Molten Pigment', 'Long-lasting']
  },
  {
    id: 5,
    name: 'Priya Sharma',
    initials: 'PS',
    avatar: 'images/clients/client5.jpg',
    location: 'Mumbai, India',
    cat: 'skincare',
    product: 'Rosehip Facial Oil',
    prodId: 7,
    prodImg: 'images/skincare_products_1788328338930.jpg',
    prodPrice: '₹74.00',
    prodRawPrice: 74,
    rating: 5,
    title: 'Healed my parched skin barrier completely',
    text: 'I had battled dry flaky patches in monsoon-to-winter transitions for years. One drop of this cold-pressed elixir warms between the palms and leaves a dewy, non-comedogenic shield that lasts till morning. The subtle botanical rose aroma is pure mindfulness.',
    date: 'June 2026',
    helpful: 84,
    verified: true,
    tags: ['Clean Formula', 'Glowing Skin']
  },
  {
    id: 6,
    name: 'Isabella Torres',
    initials: 'IT',
    avatar: 'images/clients/client6.jpg',
    location: 'Barcelona, Spain',
    cat: 'makeup',
    product: 'Gold Highlighter',
    prodId: 8,
    prodImg: 'images/makeup_products_1788328354838.jpg',
    prodPrice: '₹46.00',
    prodRawPrice: 46,
    rating: 5,
    title: 'The most ethereal, lit-from-within sheen',
    text: 'I own virtually every luxury compact produced over the last decade. This highlighter retired all of them. The 24K pigment is so microscopic that it mimics natural wet skin refraction rather than chunky glitter. Utterly sublime.',
    date: 'June 2026',
    helpful: 79,
    verified: true,
    tags: ['24K Molten Pigment', 'Luxury Feel']
  },
  {
    id: 7,
    name: 'Zoe Williams',
    initials: 'ZW',
    avatar: 'images/clients/client7.jpg',
    location: 'Sydney, Australia',
    cat: 'fragrance',
    product: 'Rose Bloom Eau de Toilette',
    prodId: 6,
    prodImg: 'images/perfume_collection_1788328378783.jpg',
    prodPrice: '₹165.00',
    prodRawPrice: 165,
    rating: 4,
    title: 'Crisp, contemporary petal freshness',
    text: 'Rose Bloom delivers exactly what modern fragrance lovers seek — a dewy, crystalline rose accord that feels crisp and contemporary rather than grandmotherly. Longevity is a solid 7 hours with beautiful moderate sillage.',
    date: 'May 2026',
    helpful: 61,
    verified: true,
    tags: ['French Rose', 'Clean Formula']
  },
  {
    id: 8,
    name: 'Chloe Martin',
    initials: 'CM',
    avatar: 'images/clients/client8.jpg',
    location: 'Toronto, Canada',
    cat: 'makeup',
    product: 'Velvet Lip Collection',
    prodId: 2,
    prodImg: 'images/makeup_products_1788328354838.jpg',
    prodPrice: '₹58.00',
    prodRawPrice: 58,
    rating: 5,
    title: 'Matte perfection with zero flaking',
    text: 'Traditional matte lipsticks usually dry out my lips within hours. Not this one. The French black truffle butter base keeps lips cushioned while delivering rich saturated colour that survives dining. I now own four shades.',
    date: 'May 2026',
    helpful: 68,
    verified: true,
    tags: ['Velvet Lips', 'Long-lasting']
  },
  {
    id: 9,
    name: 'Nadia Hassan',
    initials: 'NH',
    avatar: 'images/clients/client9.jpg',
    location: 'Dubai, UAE',
    cat: 'skincare',
    product: 'Radiance Glow Serum',
    prodId: 1,
    prodImg: 'images/skincare_products_1788328338930.jpg',
    prodPrice: '₹128.00',
    prodRawPrice: 128,
    rating: 5,
    title: 'A true oasis for skin under the desert sun',
    text: 'Between air conditioning and desert heat, my skin was constantly stressed. The cellular hydration provided by this formulation created a luminous barrier. It also layers flawlessly under evening makeup.',
    date: 'April 2026',
    helpful: 52,
    verified: true,
    tags: ['Glowing Skin', 'Fast Results']
  }
];

// UGC Community Data
const UGC_STORIES = [
  {
    id: 1,
    name: 'Camille L.',
    city: 'Paris',
    tag: '✦ 14 DAYS OF GLOW',
    product: 'Radiance Glow Serum',
    quote: '“My skin texture before and after 14 days of the ritual. The radiance is real.”',
    img: 'images/community/beauty1.jpg',
    rating: 5,
    prodId: 1,
    prodPrice: '₹128.00'
  },
  {
    id: 2,
    name: 'Elena R.',
    city: 'Milan',
    tag: '✦ RED CARPET FINISH',
    product: 'Gold Highlighter',
    quote: '“Molten 24K gold on cheekbones. Catches ambient candlelight like magic.”',
    img: 'images/community/beauty2.jpg',
    rating: 5,
    prodId: 8,
    prodPrice: '₹46.00'
  },
  {
    id: 3,
    name: 'Sophia S.',
    city: 'New York',
    tag: '✦ GLASS SKIN EDIT',
    product: 'Restorative Night Cream',
    quote: '“Zero filter, zero foundation. Just waking up after applying the night cream.”',
    img: 'images/community/beauty3.jpg',
    rating: 5,
    prodId: 4,
    prodPrice: '₹96.00'
  },
  {
    id: 4,
    name: 'Aurelia D.',
    city: 'Geneva',
    tag: '✦ VELVET ATELIER',
    product: 'Velvet Lip Collection',
    quote: '“The deep berry pigment stayed intact through a 4-course dinner.”',
    img: 'images/community/beauty4.jpg',
    rating: 5,
    prodId: 2,
    prodPrice: '₹58.00'
  }
];

let revFilter = 'all';
let starFilter = 'all';
let searchQuery = '';
let activeSentimentTag = '';
let visibleCount = 6;
let selectedRating = 5;
let selectedStudioTags = ['Dry Skin', 'Radiant Finish'];

/* ============================================================
   1. 24K GOLD STARDUST PARTICLES CANVAS (HERO BACKGROUND)
   ============================================================ */
function initGoldDustCanvas() {
  const canvas = document.getElementById('goldDustCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = 85;

  let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
    height = canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left;
    mouse.targetY = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.targetX = -1000;
    mouse.targetY = -1000;
  });

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.5 + 0.2);
      this.radius = Math.random() * 2.2 + 0.6;
      this.alpha = Math.random() * 0.7 + 0.2;
      this.baseAlpha = this.alpha;
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      // Gentle attraction toward mouse
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        const force = (180 - dist) / 180;
        this.vx += (dx / dist) * force * 0.08;
        this.vy += (dy / dist) * force * 0.08;
      }

      this.vx *= 0.98;
      this.vy *= 0.98;
      this.x += this.vx;
      this.y += this.vy;

      this.pulse += this.pulseSpeed;
      this.alpha = this.baseAlpha + Math.sin(this.pulse) * 0.25;

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 169, 126, ${Math.max(0, this.alpha)})`;
      ctx.shadowColor = 'rgba(200, 169, 126, 0.8)';
      ctx.shadowBlur = this.radius * 3;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    // Ambient mouse light flare
    if (mouse.x > 0 && mouse.y > 0) {
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220);
      grad.addColorStop(0, 'rgba(200, 169, 126, 0.12)');
      grad.addColorStop(0.5, 'rgba(200, 169, 126, 0.04)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

/* ============================================================
   2. ROLLING TELEMETRY STATS COUNTERS
   ============================================================ */
function initRollingCounters() {
  const statsWrap = document.querySelector('.rev-hero-stats');
  if (!statsWrap) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter('cntAvgRating', 4.95, 2, '');
        animateCounter('cntCollectors', 52480, 0, '+');
        animateCounter('cntRadiance', 99.2, 1, '%');
        animateCounter('cntPurity', 100, 0, '%');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(statsWrap);
}

function animateCounter(id, target, decimals, suffix) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * ease;

    if (decimals > 0) {
      el.innerHTML = `${current.toFixed(decimals)} <span class="rhs-suffix">${suffix}</span>`;
    } else {
      const formatted = Math.floor(current).toLocaleString();
      el.innerHTML = `${formatted} <span class="rhs-suffix">${suffix}</span>`;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ============================================================
   3. ANIMATED RATING BARS & CLINICAL RADAR GAUGES
   ============================================================ */
function initBreakdownAndGauges() {
  const panel = document.getElementById('ratingPanel');
  if (!panel) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Bars
        panel.querySelectorAll('.rp-bar-fill').forEach(bar => {
          bar.classList.add('animated');
        });

        // Gauges
        const g1 = document.getElementById('gaugeCircle1');
        const g2 = document.getElementById('gaugeCircle2');
        const g3 = document.getElementById('gaugeCircle3');
        // Circumference is 2 * PI * 36 ≈ 226
        if (g1) g1.style.strokeDashoffset = 226 - (226 * 0.98);
        if (g2) g2.style.strokeDashoffset = 226 - (226 * 0.96);
        if (g3) g3.style.strokeDashoffset = 226 - (226 * 0.99);

        observer.unobserve(panel);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(panel);
}

/* ============================================================
   4. RENDER FEATURED SPOTLIGHT REVIEW
   ============================================================ */
function renderFeatured(reviews) {
  const el = document.getElementById('featuredReview');
  if (!el) return;
  const r = reviews.find(rv => rv.featured) || reviews[0];
  if (!r) {
    el.style.display = 'none';
    return;
  }
  el.style.display = 'block';
  el.innerHTML = `
    <div class="fr-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
    <p class="fr-text">“${r.text}”</p>
    <div class="fr-footer">
      <div class="fr-author">
        <img src="${r.avatar || 'images/clients/client1.jpg'}" alt="${r.name}" class="fr-avatar-img" onerror="this.src='images/clients/client1.jpg'" />
        <div>
          <span class="fr-name">${r.name}</span>
          <span class="fr-meta">${r.location} &bull; ${r.date} &bull; ✦ Verified Collector</span>
        </div>
      </div>
      <div class="fr-product-card">
        <img src="${r.prodImg || 'images/skincare_products_1788328338930.jpg'}" alt="${r.product}" class="fr-prod-thumb" />
        <div>
          <div style="font-size:0.8rem; font-weight:600; color:var(--color-cream);">${r.product}</div>
          <div style="font-size:0.75rem; color:var(--color-gold);">${r.prodPrice || '₹128.00'}</div>
        </div>
        <button type="button" class="btn-luxury-primary" style="padding:0.45rem 1.1rem; font-size:0.72rem; margin-left:0.6rem;" onclick="quickAddReviewProduct(${r.prodId || 1}, '${r.product}', ${r.prodRawPrice || 128}, '${r.prodImg || 'images/skincare_products_1788328338930.jpg'}')">
          + ADD TO BAG
        </button>
      </div>
    </div>
  `;
}

/* ============================================================
   5. 3D GYROSCOPIC TILT PHYSICS FOR REVIEW CARDS
   ============================================================ */
function attachCardTilt(card) {
  const glare = card.querySelector('.rev-glare');

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

    if (glare) {
      glare.style.left = `${x}px`;
      glare.style.top = `${y}px`;
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

/* ============================================================
   6. RENDER REVIEWS GRID WITH LIVE SEARCH & FILTERS
   ============================================================ */
function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

function renderReviews() {
  const sortVal = document.getElementById('revSort')?.value || 'newest';
  
  let filtered = ALL_REVIEWS.filter(r => {
    // Category filter
    if (revFilter !== 'all' && r.cat !== revFilter) return false;
    // Star rating filter
    if (starFilter !== 'all' && r.rating !== parseInt(starFilter, 10)) return false;
    // Sentiment tag filter
    if (activeSentimentTag && (!r.tags || !r.tags.some(t => t.toLowerCase().includes(activeSentimentTag.toLowerCase())))) {
      return false;
    }
    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchProd = r.product.toLowerCase().includes(q);
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchText = r.text.toLowerCase().includes(q);
      const matchLoc = r.location.toLowerCase().includes(q);
      if (!matchName && !matchProd && !matchTitle && !matchText && !matchLoc) return false;
    }
    return true;
  });

  // Sorting
  if (sortVal === 'highest') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortVal === 'helpful') {
    filtered.sort((a, b) => b.helpful - a.helpful);
  } else {
    // Newest first
    filtered.sort((a, b) => b.id - a.id);
  }

  renderFeatured(filtered);

  const grid = document.getElementById('reviewsGrid');
  if (!grid) return;

  const toShow = filtered.filter(r => !r.featured).slice(0, visibleCount);
  grid.innerHTML = '';

  if (toShow.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:4rem 2rem; background:rgba(18,13,15,0.4); border:1px solid var(--border-gold); border-radius:8px;">
        <div style="font-size:2.5rem; margin-bottom:1rem; color:var(--color-gold);">✦</div>
        <h3 style="font-family:'Cormorant Garamond',serif; font-size:1.8rem; color:var(--color-cream); margin-bottom:0.6rem;">No Atelier Reviews Found</h3>
        <p style="color:rgba(250,247,242,0.6); max-width:450px; margin:0 auto 1.5rem; font-size:0.9rem;">
          No verified collector entries match your current search and filter criteria.
        </p>
        <button type="button" class="btn-luxury-primary" onclick="resetAllFilters()">Reset All Filters</button>
      </div>
    `;
    const loadBtn = document.getElementById('loadMoreBtn');
    if (loadBtn) loadBtn.style.display = 'none';
    updateActiveFiltersBar();
    return;
  }

  toShow.forEach((r, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'rev-card-perspective-wrap reveal revealed';
    wrap.style.transitionDelay = `${(i % 3) * 0.08}s`;

    const card = document.createElement('div');
    card.className = `rev-card ${r.isNew ? 'new-submission' : ''}`;
    if (r.isNew) {
      card.style.boxShadow = '0 0 40px rgba(200, 169, 126, 0.45)';
      card.style.borderColor = 'var(--color-gold)';
    }

    const titleHl = highlightText(r.title, searchQuery);
    const textHl = highlightText(r.text, searchQuery);
    const prodHl = highlightText(r.product, searchQuery);

    card.innerHTML = `
      <div class="rev-glare"></div>
      <div class="rev-card-header">
        <div class="rev-card-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        <div class="rev-verified-tag"><span>✓</span> <span>Verified</span></div>
      </div>
      <div class="rev-card-product">✦ ${prodHl}</div>
      <h3 class="rev-card-title">${titleHl}</h3>
      <p class="rev-card-text">“${textHl}”</p>
      
      <div class="rev-card-footer">
        <div class="rev-card-author">
          ${
            r.avatar
              ? `<img src="${r.avatar}" alt="${r.name}" class="rev-author-avatar" onerror="this.outerHTML='<div class=\\'rev-author-initials\\'>${r.initials}</div>'" />`
              : `<div class="rev-author-initials">${r.initials}</div>`
          }
          <div>
            <div class="rev-card-name">${r.name}</div>
            <div class="rev-card-date">${r.location} &bull; ${r.date}</div>
          </div>
        </div>

        <div class="rev-helpful-wrap">
          <div class="starburst-container" id="starburst-${r.id}"></div>
          <button type="button" class="rev-helpful" onclick="markHelpful(${r.id}, this)" id="help-${r.id}" aria-label="Mark review helpful">
            <span>👍</span> <span>Helpful (${r.helpful})</span>
          </button>
        </div>
      </div>
    `;

    attachCardTilt(card);
    wrap.appendChild(card);
    grid.appendChild(wrap);
  });

  const loadBtn = document.getElementById('loadMoreBtn');
  if (loadBtn) {
    loadBtn.style.display = filtered.filter(r => !r.featured).length > visibleCount ? 'inline-flex' : 'none';
  }

  updateActiveFiltersBar();
}

function updateActiveFiltersBar() {
  const bar = document.getElementById('activeFiltersBar');
  if (!bar) return;

  const pills = [];
  if (revFilter !== 'all') {
    pills.push(`Category: <strong>${revFilter.toUpperCase()}</strong> <button onclick="filterReviews('all', document.getElementById('revTabAll'))">&times;</button>`);
  }
  if (starFilter !== 'all') {
    pills.push(`Rating: <strong>${starFilter} STARS</strong> <button onclick="setStarFilter('all')">&times;</button>`);
  }
  if (activeSentimentTag) {
    pills.push(`Topic: <strong>${activeSentimentTag}</strong> <button onclick="clearSentimentFilter()">&times;</button>`);
  }
  if (searchQuery) {
    pills.push(`Search: <strong>"${searchQuery}"</strong> <button onclick="clearSearch()">&times;</button>`);
  }

  if (pills.length > 0) {
    bar.innerHTML = `
      <span style="font-size:0.7rem; letter-spacing:0.12em; text-transform:uppercase; color:rgba(250,247,242,0.5);">Active Filters:</span>
      ${pills.map(p => `<span class="active-filter-pill">${p}</span>`).join('')}
      <button type="button" style="background:none; border:none; color:var(--color-gold); font-size:0.72rem; cursor:pointer; text-decoration:underline; margin-left:0.5rem;" onclick="resetAllFilters()">Clear All</button>
    `;
    bar.style.display = 'flex';
  } else {
    bar.style.display = 'none';
  }
}

function resetAllFilters() {
  revFilter = 'all';
  starFilter = 'all';
  searchQuery = '';
  activeSentimentTag = '';
  visibleCount = 6;

  const searchInput = document.getElementById('revSearchInput');
  if (searchInput) searchInput.value = '';
  const clearBtn = document.getElementById('revClearSearch');
  if (clearBtn) clearBtn.style.display = 'none';

  document.querySelectorAll('.rev-tab').forEach(t => t.classList.remove('active'));
  const tabAll = document.getElementById('revTabAll');
  if (tabAll) tabAll.classList.add('active');

  document.querySelectorAll('.rp-bar-row').forEach(b => b.classList.remove('active-filter'));
  document.querySelectorAll('.rp-tag').forEach(t => t.classList.remove('active'));

  renderReviews();
}

/* Category Tab Filtering */
function filterReviews(cat, btn) {
  revFilter = cat;
  visibleCount = 6;
  document.querySelectorAll('.rev-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderReviews();
}

/* Star Breakdown Bar Filtering */
function filterByRating(stars, el) {
  if (starFilter === String(stars)) {
    starFilter = 'all';
    el.classList.remove('active-filter');
  } else {
    starFilter = String(stars);
    document.querySelectorAll('.rp-bar-row').forEach(b => b.classList.remove('active-filter'));
    el.classList.add('active-filter');
  }
  visibleCount = 6;
  renderReviews();
  document.getElementById('reviewsMain')?.scrollIntoView({ behavior: 'smooth' });
}

function setStarFilter(stars) {
  starFilter = String(stars);
  document.querySelectorAll('.rp-bar-row').forEach(b => {
    b.classList.toggle('active-filter', b.getAttribute('data-star') === String(stars));
  });
  renderReviews();
}

/* Sentiment Tag Filtering */
function filterBySentiment(tag, el) {
  if (activeSentimentTag === tag) {
    activeSentimentTag = '';
    el.classList.remove('active');
  } else {
    activeSentimentTag = tag;
    document.querySelectorAll('.rp-tag').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
  }
  visibleCount = 6;
  renderReviews();
  document.getElementById('reviewsMain')?.scrollIntoView({ behavior: 'smooth' });
}

function clearSentimentFilter() {
  activeSentimentTag = '';
  document.querySelectorAll('.rp-tag').forEach(t => t.classList.remove('active'));
  renderReviews();
}

/* Live Search Input */
let searchDebounceTimer = null;
function handleReviewSearch(e) {
  const val = e.target.value.trim();
  searchQuery = val;
  const clearBtn = document.getElementById('revClearSearch');
  if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';

  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    visibleCount = 6;
    renderReviews();
  }, 220);
}

function clearSearch() {
  const input = document.getElementById('revSearchInput');
  if (input) input.value = '';
  searchQuery = '';
  const clearBtn = document.getElementById('revClearSearch');
  if (clearBtn) clearBtn.style.display = 'none';
  renderReviews();
}

function loadMore() {
  visibleCount += 3;
  renderReviews();
}

/* ============================================================
   7. HELPFUL MICRO-ANIMATION WITH GOLD STARBURST
   ============================================================ */
function markHelpful(id, btn) {
  const r = ALL_REVIEWS.find(x => x.id === id);
  if (!r || btn.classList.contains('voted')) return;

  r.helpful++;
  btn.classList.add('voted');
  btn.innerHTML = `<span>👍</span> <span>Helpful (${r.helpful})</span>`;

  // Particle explosion
  const container = document.getElementById(`starburst-${id}`);
  if (container) {
    container.innerHTML = '';
    const particleCount = 10;
    for (let i = 0; i < particleCount; i++) {
      const dot = document.createElement('div');
      dot.className = 'starburst-dot';
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = Math.random() * 35 + 25;
      const dx = `${Math.cos(angle) * distance}px`;
      const dy = `${Math.sin(angle) * distance}px`;
      dot.style.setProperty('--dx', dx);
      dot.style.setProperty('--dy', dy);
      container.appendChild(dot);
    }
    setTimeout(() => {
      container.innerHTML = '';
    }, 700);
  }

  if (typeof showToast === 'function') {
    showToast('✦ Thank you for verifying this review!');
  }
}

/* ============================================================
   8. UGC RESULTS LIGHTBOX MODAL
   ============================================================ */
function openUgcModal(idx) {
  const item = UGC_STORIES[idx];
  if (!item) return;

  const modal = document.getElementById('ugcModal');
  if (!modal) return;

  document.getElementById('ugcModalImg').src = item.img;
  document.getElementById('ugcModalTag').textContent = item.tag;
  document.getElementById('ugcModalAuthor').textContent = `${item.name} (${item.city})`;
  document.getElementById('ugcModalQuote').textContent = item.quote;
  document.getElementById('ugcModalProduct').textContent = item.product;
  document.getElementById('ugcModalPrice').textContent = item.prodPrice;

  const btn = document.getElementById('ugcModalAddBag');
  if (btn) {
    btn.onclick = () => {
      quickAddReviewProduct(item.prodId, item.product, 128, item.img);
      closeUgcModal();
    };
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeUgcModal() {
  const modal = document.getElementById('ugcModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

/* ============================================================
   9. ATELIER REVIEW STUDIO (LIVE HOLOGRAM CARD PREVIEW)
   ============================================================ */
const RATING_DESCRIPTIONS = {
  5: '✦ 5 Stars: Pure Holy Grail Luxury!',
  4: '✦ 4 Stars: Radiant & High Performance',
  3: '✦ 3 Stars: Pleasant Experience',
  2: '✦ 2 Stars: Underwhelming Formulation',
  1: '✦ 1 Star: Not Suitable For My Skin'
};

function setRating(val) {
  selectedRating = val;
  document.querySelectorAll('.sp-star').forEach(s => {
    s.classList.toggle('lit', parseInt(s.dataset.val, 10) <= val);
  });
  const descEl = document.getElementById('spRatingDesc');
  if (descEl) descEl.textContent = RATING_DESCRIPTIONS[val] || '';
  updateLiveReviewPreview();
}

function toggleStudioTag(tag, el) {
  if (selectedStudioTags.includes(tag)) {
    selectedStudioTags = selectedStudioTags.filter(t => t !== tag);
    el.classList.remove('selected');
  } else {
    selectedStudioTags.push(tag);
    el.classList.add('selected');
  }
  updateLiveReviewPreview();
}

function updateLiveReviewPreview() {
  const nameVal = document.getElementById('wrName')?.value.trim() || 'Sofia Chen';
  const cityVal = document.getElementById('wrLocation')?.value.trim() || 'Paris, France';
  const prodVal = document.getElementById('wrProduct')?.value || 'Radiance Glow Serum';
  const titleVal = document.getElementById('wrTitle')?.value.trim() || 'Unbelievable glass-skin radiance';
  const bodyVal = document.getElementById('wrBody')?.value.trim() ||
    'The formulation absorbs immediately into cellular depth without residue. My skin has never looked so luminous and calm.';

  const initials = nameVal.split(' ').map(n => n[0]).filter(Boolean).join('').toUpperCase() || 'SC';

  const previewEl = document.getElementById('liveReviewPreview');
  if (!previewEl) return;

  previewEl.innerHTML = `
    <div class="rev-glare"></div>
    <div class="rev-card-header">
      <div class="rev-card-stars">${'★'.repeat(selectedRating)}${'☆'.repeat(5 - selectedRating)}</div>
      <div class="rev-verified-tag"><span>✓</span> <span>Verified Collector</span></div>
    </div>
    <div class="rev-card-product">✦ ${prodVal}</div>
    <h3 class="rev-card-title">${titleVal}</h3>
    <p class="rev-card-text">“${bodyVal}”</p>
    <div class="rev-card-footer">
      <div class="rev-card-author">
        <div class="rev-author-initials">${initials}</div>
        <div>
          <div class="rev-card-name">${nameVal}</div>
          <div class="rev-card-date">${cityVal} &bull; Just now</div>
        </div>
      </div>
      <div style="font-size:0.68rem; color:var(--color-gold); letter-spacing:0.08em; text-transform:uppercase;">
        ✦ LIVE DRAFT
      </div>
    </div>
  `;
}

/* ============================================================
   10. CELEBRATION EXPLOSION & SUBMIT REVIEW
   ============================================================ */
function triggerCelebration() {
  const canvas = document.getElementById('celebrationCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const count = 120;
  const colors = ['#C8A97E', '#E8D3B9', '#FAF7F2', '#D4758A', '#F2AEC1'];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.7) * 18,
      size: Math.random() * 8 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.015 + 0.008,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12
    });
  }

  const startTime = performance.now();
  function draw(currentTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.alpha -= p.decay;
      p.rotation += p.vRot;

      if (p.alpha > 0) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    });

    if (active && currentTime - startTime < 3200) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(draw);
}

function submitReview(e) {
  e.preventDefault();
  if (selectedRating === 0) {
    if (typeof showToast === 'function') showToast('⚠️ Please select a rating (1–5 stars).');
    return;
  }

  const name = document.getElementById('wrName').value.trim();
  const location = document.getElementById('wrLocation').value.trim() || 'Verified Client';
  const product = document.getElementById('wrProduct').value;
  const title = document.getElementById('wrTitle').value.trim();
  const text = document.getElementById('wrBody').value.trim();

  const newEntry = {
    id: Date.now(),
    name,
    initials: name.split(' ').map(n => n[0]).filter(Boolean).join('').toUpperCase() || 'CL',
    avatar: 'images/clients/client1.jpg',
    location,
    cat: 'skincare',
    product,
    prodId: 1,
    prodPrice: '₹128.00',
    prodRawPrice: 128,
    prodImg: 'images/skincare_products_1788328338930.jpg',
    rating: selectedRating,
    title,
    text,
    date: 'Just now',
    helpful: 0,
    verified: true,
    isNew: true,
    tags: selectedStudioTags
  };

  ALL_REVIEWS.unshift(newEntry);
  triggerCelebration();

  if (typeof showToast === 'function') {
    showToast(`✦ Thank you, ${name}! Your review has been broadcast to the Atelier.`);
  }

  e.target.reset();
  setRating(5);
  updateLiveReviewPreview();

  // Reset filters to view newly submitted item
  revFilter = 'all';
  starFilter = 'all';
  searchQuery = '';
  activeSentimentTag = '';
  visibleCount = 6;
  renderReviews();

  document.getElementById('reviewsGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* Quick Add Product to Bag */
function quickAddReviewProduct(id, name, price, img) {
  if (typeof addToCart === 'function') {
    addToCart(id, 1);
  } else {
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

// Global exposure
window.filterReviews = filterReviews;
window.filterByRating = filterByRating;
window.setStarFilter = setStarFilter;
window.filterBySentiment = filterBySentiment;
window.clearSentimentFilter = clearSentimentFilter;
window.handleReviewSearch = handleReviewSearch;
window.clearSearch = clearSearch;
window.resetAllFilters = resetAllFilters;
window.loadMore = loadMore;
window.markHelpful = markHelpful;
window.openUgcModal = openUgcModal;
window.closeUgcModal = closeUgcModal;
window.setRating = setRating;
window.toggleStudioTag = toggleStudioTag;
window.updateLiveReviewPreview = updateLiveReviewPreview;
window.submitReview = submitReview;
window.quickAddReviewProduct = quickAddReviewProduct;

// DOMContentLoaded Init
document.addEventListener('DOMContentLoaded', () => {
  initGoldDustCanvas();
  initRollingCounters();
  initBreakdownAndGauges();
  renderReviews();
  updateLiveReviewPreview();

  // Bind live preview listeners
  ['wrName', 'wrLocation', 'wrProduct', 'wrTitle', 'wrBody'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateLiveReviewPreview);
  });
});
