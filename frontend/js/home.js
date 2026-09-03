/* home.js — Home page specific logic */

/* ---- Particles ---- */
(function createParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${1+Math.random()*3}px;height:${1+Math.random()*3}px;--d:${4+Math.random()*7}s;--delay:-${Math.random()*7}s`;
    container.appendChild(p);
  }
})();

/* ---- Bestsellers (4 cards) ---- */
(function renderBestsellers() {
  const grid = document.getElementById('bsGrid');
  if (!grid) return;
  const best = PRODUCTS.filter(p => p.badge === 'Bestseller' || p.stars === 5).slice(0, 4);
  best.forEach((p, i) => grid.appendChild(buildProductCard(p, i)));
  initReveal();
})();

/* ---- Countdown ---- */
(function initCountdown() {
  let end = Date.now() + (8*3600 + 45*60)*1000;
  function tick() {
    const r = Math.max(0, end - Date.now());
    const h = document.getElementById('cdH');
    const m = document.getElementById('cdM');
    const s = document.getElementById('cdS');
    if (!h) return;
    h.textContent = String(Math.floor(r/3600000)).padStart(2,'0');
    m.textContent = String(Math.floor((r%3600000)/60000)).padStart(2,'0');
    s.textContent = String(Math.floor((r%60000)/1000)).padStart(2,'0');
  }
  setInterval(tick, 1000); tick();
})();

/* ---- Newsletter ---- */
function handleNL(e) {
  e.preventDefault();
  const email = document.getElementById('nlEmail').value;
  showToast(`<span class="toast-icon">✦</span> Welcome! Check <strong>${email}</strong>`);
  e.target.reset();
}

/* ---- Search stub ---- */
document.getElementById('searchBtn')?.addEventListener('click', () => {
  showToast('<span class="toast-icon">🔍</span> Search coming soon!');
});
document.getElementById('wishlistBtn')?.addEventListener('click', () => {
  showToast('<span class="toast-icon">♥</span> Wishlist coming soon!');
});
