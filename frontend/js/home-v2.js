/* ============================================================
   HOME V2 — Premium Animations & Interactions (home-v2.js)
   ============================================================ */

/* ============================================================
   PRELOADER
   ============================================================ */
(function initPreloader() {
  const bar = document.getElementById('preBar');
  const preloader = document.getElementById('preloader');
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 18 + 5;
    if (progress >= 100) { progress = 100; clearInterval(interval); }
    if (bar) bar.style.width = progress + '%';
  }, 80);

  const done = () => {
    if (preloader) {
      preloader.classList.add('exit');
      setTimeout(() => {
        preloader.style.display = 'none';
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        // Trigger hero animations after load
        triggerHeroAnimations();
      }, 900);
    }
  };

  if (document.readyState === 'complete') {
    setTimeout(done, 1400);
  } else {
    window.addEventListener('load', () => setTimeout(done, 600));
    setTimeout(done, 3000); // fallback
  }
})();

function triggerHeroAnimations() {
  // Kick off canvas particles
  initHeroCanvas();
  // Parallax init
  initParallax();
}

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
(function initCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  if (window.matchMedia('(hover:none)').matches) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let raf;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animate() {
    // Dot follows exactly
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    // Ring follows with lag
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    raf = requestAnimationFrame(animate);
  }
  animate();

  // Hover state
  document.querySelectorAll('a, button, .magnetic, .cat-v2-card, .pv2-card, .press-logo, .product-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });

  document.addEventListener('mousedown', () => ring.classList.add('click'));
  document.addEventListener('mouseup', () => ring.classList.remove('click'));

  // Hide on leave
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

/* ============================================================
   MAGNETIC EFFECT
   ============================================================ */
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.35;
    const dy = (e.clientY - cy) * 0.35;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  if (progressBar) progressBar.style.width = pct + '%';
}, { passive: true });

/* ============================================================
   HERO CANVAS — Particle System
   ============================================================ */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 1.5 + 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -Math.random() * 0.5 - 0.1;
      this.life = 0;
      this.maxLife = Math.random() * 200 + 100;
      this.gold = Math.random() > 0.3;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      this.life++;
      const progress = this.life / this.maxLife;
      this.currentAlpha = this.alpha * Math.sin(progress * Math.PI);
      if (this.life >= this.maxLife || this.y < -5) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.currentAlpha;
      ctx.fillStyle = this.gold ? '#c9a96e' : '#f0a8bb';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Create particles
  for (let i = 0; i < 60; i++) {
    const p = new Particle();
    p.life = Math.random() * p.maxLife; // stagger initial positions
    particles.push(p);
  }

  // Occasionally add sparkle (cross shape)
  function drawSparkle(x, y, size, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#c9a96e';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x - size, y); ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size); ctx.lineTo(x, y + size);
    ctx.stroke();
    ctx.restore();
  }

  let sparkles = [];
  function addSparkle() {
    sparkles.push({ x: Math.random() * W, y: Math.random() * H, size: Math.random() * 6 + 2, life: 0, maxLife: 80 });
    setTimeout(addSparkle, Math.random() * 1200 + 400);
  }
  addSparkle();

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    sparkles = sparkles.filter(s => s.life < s.maxLife);
    sparkles.forEach(s => {
      s.life++;
      const p = s.life / s.maxLife;
      drawSparkle(s.x, s.y, s.size, Math.sin(p * Math.PI) * 0.6);
    });
    requestAnimationFrame(loop);
  }
  loop();
}

/* ============================================================
   PARALLAX HERO IMAGE
   ============================================================ */
function initParallax() {
  const img = document.getElementById('heroImg');
  if (!img) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          img.style.transform = `scale(1.06) translateY(${y * 0.25}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ============================================================
   INTERSECTION OBSERVER — Scroll Reveal V2
   ============================================================ */
function initRevealV2() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseFloat(el.dataset.delay || 0) * 0.12;
        el.style.transitionDelay = delay + 's';
        el.classList.add('revealed');
        observer.unobserve(el);

        // Trigger counter if stat element
        el.querySelectorAll('.hv2-num, .ev2-badge-num').forEach(animateCounter);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
  // Also watch stats bar
  const statsBar = document.getElementById('heroStats');
  if (statsBar) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        statsBar.querySelectorAll('.hv2-num').forEach(animateCounter);
      }
    }, { threshold: 0.5 }).observe(statsBar);
  }
}

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function animateCounter(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const target = parseInt(el.dataset.target || el.textContent || 0);
  if (isNaN(target) || target === 0) return;
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

/* ============================================================
   BESTSELLERS CAROUSEL
   ============================================================ */
(function initBSCarousel() {
  const track = document.getElementById('bsTrack');
  if (!track) return;

  const products = PRODUCTS.filter(p => p.stars === 5 || p.badge === 'Bestseller');
  products.forEach((p, i) => {
    const card = buildProductCard(p, i);
    track.appendChild(card);
  });
  initReveal();

  const dotsEl = document.getElementById('bsDots');
  let current = 0;
  const visibleCount = () => window.innerWidth < 700 ? 1 : window.innerWidth < 1100 ? 2 : 3;
  const total = () => Math.ceil(products.length / visibleCount());

  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    for (let i = 0; i < total(); i++) {
      const d = document.createElement('button');
      d.className = 'bs-dot' + (i === current ? ' active' : '');
      d.setAttribute('aria-label', `Slide ${i+1}`);
      d.onclick = () => goTo(i);
      dotsEl.appendChild(d);
    }
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, total() - 1));
    const cardW = track.children[0]?.offsetWidth + 22 || 300; // card + gap
    track.style.transform = `translateX(-${current * visibleCount() * cardW}px)`;
    buildDots();
  }

  document.getElementById('bsNext')?.addEventListener('click', () => goTo(current + 1));
  document.getElementById('bsPrev')?.addEventListener('click', () => goTo(current - 1));

  // Drag-to-scroll
  let startX = 0, isDragging = false;
  const wrap = track.parentElement;
  wrap.addEventListener('mousedown', e => { isDragging = true; startX = e.clientX; });
  wrap.addEventListener('mousemove', e => { if (!isDragging) return; });
  wrap.addEventListener('mouseup', e => {
    if (!isDragging) return; isDragging = false;
    const dx = e.clientX - startX;
    if (dx < -50) goTo(current + 1);
    else if (dx > 50) goTo(current - 1);
  });
  // Touch
  wrap.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (dx < -50) goTo(current + 1);
    else if (dx > 50) goTo(current - 1);
  }, { passive: true });

  buildDots();
  window.addEventListener('resize', buildDots);
})();

/* ============================================================
   TESTIMONIALS CAROUSEL
   ============================================================ */
(function initTestimonials() {
  const TESTIMONIALS = [
    { name:'Sophia Chen', initials:'SC', role:'Beauty Influencer, NYC', product:'Radiance Glow Serum', stars:5, text:'"Lumière completely transformed my skincare routine. The Radiance Serum gave me the glow I\'ve been chasing for years. Absolutely obsessed — my skin has never looked this good."', color:'linear-gradient(135deg,#c9a96e,#e8c990)' },
    { name:'Amelia Rossi', initials:'AR', role:'Dermatologist, London', product:'Restorative Night Cream', stars:5, text:'"As a dermatologist, I recommend Lumière to my patients. The science behind the formulas is exceptional — clinically effective, beautifully made, and genuinely kind to skin."', color:'linear-gradient(135deg,#d4758a,#f0a8bb)' },
    { name:'Marie Dupont', initials:'MD', role:'Fashion Editor, Paris', product:"Noir d'Or Parfum", stars:5, text:'"I\'ve tried every luxury fragrance house. Noir d\'Or is poetry in a bottle — the kind of scent that makes people stop you on the street to ask what you\'re wearing."', color:'linear-gradient(135deg,#9370db,#c4a0f0)' },
    { name:'Rachel Kim', initials:'RK', role:'Makeup Artist, Los Angeles', product:'Pro Eyeshadow Palette', stars:5, text:'"This palette is permanently in my kit. The pigmentation is unreal — one swipe and you\'re done. The jewel tones are absolutely gorgeous, and it photographs beautifully."', color:'linear-gradient(135deg,#e8a87c,#f5c89c)' },
    { name:'Priya Sharma', initials:'PS', role:'Lifestyle Blogger, Mumbai', product:'Rosehip Facial Oil', stars:5, text:'"I\'ve struggled with dry skin my entire life. This oil changed everything. Non-greasy, deeply nourishing, and my skin genuinely glows. I tell everyone I know about it."', color:'linear-gradient(135deg,#7eb8c9,#a8d8e8)' },
  ];

  const track = document.getElementById('tv2Track');
  const dotsEl = document.getElementById('tv2Dots');
  if (!track) return;

  TESTIMONIALS.forEach(t => {
    const card = document.createElement('div');
    card.className = 'tv2-card';
    card.innerHTML = `
      <div class="tv2-card-stars">${'★'.repeat(t.stars)}</div>
      <p class="tv2-card-text">${t.text}</p>
      <div class="tv2-card-author">
        <div class="tv2-avatar" style="background:${t.color}">${t.initials}</div>
        <div>
          <span class="tv2-name">${t.name}</span>
          <span class="tv2-role">${t.role}</span>
          <span class="tv2-product">✦ ${t.product}</span>
        </div>
      </div>`;
    track.appendChild(card);
  });

  let current = 0;
  const vis = () => window.innerWidth < 700 ? 1 : window.innerWidth < 1100 ? 2 : 3;
  const total = () => TESTIMONIALS.length - vis() + 1;

  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    for (let i = 0; i < Math.ceil(TESTIMONIALS.length / vis()); i++) {
      const d = document.createElement('button');
      d.className = 'tv2-dot' + (i === current ? ' active' : '');
      d.setAttribute('aria-label', `Testimonial ${i+1}`);
      d.onclick = () => goTo(i);
      dotsEl.appendChild(d);
    }
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, total() - 1));
    const cardW = track.children[0]?.offsetWidth + 24 || 350;
    track.style.transform = `translateX(-${current * cardW}px)`;
    buildDots();
  }

  document.getElementById('tv2Next')?.addEventListener('click', () => goTo(current + 1));
  document.getElementById('tv2Prev')?.addEventListener('click', () => goTo(current - 1));

  buildDots();
  window.addEventListener('resize', () => { goTo(0); buildDots(); });

  // Auto advance
  let autoPlay = setInterval(() => goTo((current + 1) % Math.ceil(TESTIMONIALS.length / vis())), 5000);
  track.parentElement.addEventListener('mouseenter', () => clearInterval(autoPlay));
  track.parentElement.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => goTo((current + 1) % Math.ceil(TESTIMONIALS.length / vis())), 5000);
  });
})();

/* ============================================================
   COUNTDOWN TIMER
   ============================================================ */
(function initCountdown() {
  const end = Date.now() + (8 * 3600 + 45 * 60) * 1000;

  function tick() {
    const r = Math.max(0, end - Date.now());
    const h = Math.floor(r / 3600000);
    const m = Math.floor((r % 3600000) / 60000);
    const s = Math.floor((r % 60000) / 1000);

    const updateBlock = (id, val) => {
      const el = document.getElementById(id);
      if (!el) return;
      const numEl = el.querySelector('.pv2-cd-num');
      const newVal = String(val).padStart(2, '0');
      if (numEl && numEl.textContent !== newVal) {
        el.classList.add('flip');
        setTimeout(() => {
          numEl.textContent = newVal;
          el.classList.remove('flip');
        }, 150);
      }
    };
    updateBlock('cdH2', h);
    updateBlock('cdM2', m);
    updateBlock('cdS2', s);
  }
  setInterval(tick, 1000);
  tick();
})();

/* ============================================================
   NAVBAR ACTIVE LINK ON SCROLL
   ============================================================ */
(function initNavScroll() {
  const sections = [
    { id: 'home', link: 'nlHome' },
    { id: 'shopSection', link: 'nlShop' },
    { id: 'editorial', link: 'nlColl' },
    { id: 'testimonials', link: 'nlReviews' },
  ];
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 130;
    sections.forEach(({ id, link }) => {
      const sec = document.getElementById(id);
      const lnk = document.getElementById(link);
      if (!sec || !lnk) return;
      const inView = y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight;
      lnk.style.color = inView ? 'var(--gold-light)' : '';
    });
  }, { passive: true });
})();

/* ============================================================
   NEWSLETTER
   ============================================================ */
function handleNLv2(e) {
  e.preventDefault();
  const email = document.getElementById('nlv2Email').value;
  showToast(`<span class="toast-icon">✦</span> Welcome! Confirm your spot at <strong>${email}</strong>`);
  e.target.reset();
}

/* ============================================================
   SEARCH / WISHLIST STUBS
   ============================================================ */
document.getElementById('searchBtn')?.addEventListener('click', () => showToast('<span class="toast-icon">🔍</span> Search coming soon!'));
document.getElementById('wishlistBtn')?.addEventListener('click', () => showToast('<span class="toast-icon">♥</span> Wishlist coming soon!'));

/* ============================================================
   CARD TILT EFFECT
   ============================================================ */
function initTilt() {
  document.querySelectorAll('.product-card, .pv2-card, .tv2-card').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-5px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ============================================================
   ANIMATE CATEGORY CARDS on scroll (stagger)
   ============================================================ */
(function initCatCards() {
  const cards = document.querySelectorAll('.cat-v2-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseFloat(entry.target.dataset.delay || 0) * 0.15;
        entry.target.style.transitionDelay = delay + 's';
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  cards.forEach(c => observer.observe(c));
})();

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initRevealV2();
  setTimeout(initTilt, 500);

  // Press logos stagger
  document.querySelectorAll('.press-logo').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.08) + 's';
  });
});
