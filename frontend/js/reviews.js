/* reviews.js */

const ALL_REVIEWS = [
  { id:1, name:'Sophia Chen', initials:'SC', location:'New York, USA', cat:'skincare', product:'Radiance Glow Serum', rating:5, title:'The best serum I have ever used', text:'Lumière completely transformed my skincare routine. The Radiance Serum gave me the glow I\'ve been chasing for years. After 2 weeks my skin was brighter, plumper, and I get compliments every day. Worth every single penny.', date:'Aug 2026', helpful:142, featured:true, color:'#c9a96e' },
  { id:2, name:'Amelia Rossi', initials:'AR', location:'London, UK', cat:'skincare', product:'Restorative Night Cream', rating:5, title:'Woke up glowing', text:'I was sceptical about a £96 night cream but the Restorative Night Cream is genuinely life-changing. My skin looks well-rested even when I\'m not. The texture is divine — rich without being heavy.', date:'Aug 2026', helpful:98, color:'#d4758a' },
  { id:3, name:'Marie Dupont', initials:'MD', location:'Paris, France', cat:'fragrance', product:"Noir d'Or Eau de Parfum", rating:5, title:'A fragrance that tells a story', text:'Noir d\'Or is absolute poetry in a bottle. The opening is warm and assertive, the dry-down is intimate and addictive. I receive compliments every single time I wear it. My new signature.', date:'Jul 2026', helpful:87, color:'#9370db' },
  { id:4, name:'Rachel Kim', initials:'RK', location:'Los Angeles, USA', cat:'makeup', product:'Pro Eyeshadow Palette', rating:5, title:'Every makeup artist needs this', text:'I\'m a professional makeup artist and this is now a permanent fixture in my kit. The pigmentation is insane, the formula blends like butter, and it stays all day. The jewel tones are absolutely stunning.', date:'Jul 2026', helpful:76, color:'#e8a87c' },
  { id:5, name:'Priya Sharma', initials:'PS', location:'Mumbai, India', cat:'skincare', product:'Rosehip Facial Oil', rating:5, title:'Transformed my dry skin', text:'I\'ve struggled with dry patches my whole life and nothing worked until this oil. Light, non-greasy, and somehow my skin is plump and dewy by morning. The scent is divine too.', date:'Jun 2026', helpful:64, color:'#7eb8c9' },
  { id:6, name:'Isabella Torres', initials:'IT', location:'Barcelona, Spain', cat:'makeup', product:'Gold Highlighter', rating:5, title:'The most beautiful glow', text:'I own every highlighter on the market. This one has retired all of them. The pigment is so finely milled it just melts into skin and gives the most ethereal, real-lit-from-within glow.', date:'Jun 2026', helpful:58, color:'#c9a96e' },
  { id:7, name:'Zoe Williams', initials:'ZW', location:'Sydney, Australia', cat:'fragrance', product:'Rose Bloom Eau de Toilette', rating:4, title:'Fresh, feminine and wearable', text:'Rose Bloom is exactly what I wanted — a fresh rose scent that isn\'t heavy or old-fashioned. It\'s light enough for everyday but distinct enough to be noticed. Lasts about 6 hours on me.', date:'May 2026', helpful:45, color:'#d4758a' },
  { id:8, name:'Chloe Martin', initials:'CM', location:'Toronto, Canada', cat:'makeup', product:'Velvet Lip Collection', rating:5, title:'Matte that actually stays', text:'Every matte lip dries me out and transfers everywhere. Not this one. It\'s comfortable, stays put through meals, and the colour payoff is incredible. I own four shades now.', date:'May 2026', helpful:52, color:'#c9a96e' },
  { id:9, name:'Nadia Hassan', initials:'NH', location:'Dubai, UAE', cat:'skincare', product:'Hyaluronic Plump Mist', rating:5, title:'Perfect mid-day refresh', text:'In the Dubai heat, this mist is my lifesaver. One spritz and my makeup is refreshed, my skin is plump, and my SPF stays intact. A total daily essential.', date:'Apr 2026', helpful:38, color:'#7eb8c9' },
];

let revFilter = 'all';
let visibleCount = 6;
let selectedRating = 0;

/* ---- Animated rating bars ---- */
(function animateBars() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.rp-bar-fill').forEach(bar => bar.classList.add('animated'));
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  const panel = document.querySelector('.rating-panel-inner');
  if (panel) observer.observe(panel);
})();

/* ---- Render featured review ---- */
function renderFeatured(reviews) {
  const el = document.getElementById('featuredReview');
  if (!el) return;
  const r = reviews.find(rv => rv.featured) || reviews[0];
  if (!r) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  el.innerHTML = `
    <div class="fr-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
    <p class="fr-text">"${r.text}"</p>
    <div class="fr-footer">
      <div class="fr-author">
        <div class="fr-avatar" style="background:linear-gradient(135deg,${r.color},var(--rose))">${r.initials}</div>
        <div>
          <span class="fr-name">${r.name}</span>
          <span class="fr-meta">${r.location} · ${r.date}</span>
        </div>
      </div>
      <span class="fr-product-tag">✦ ${r.product}</span>
    </div>`;
}

/* ---- Render reviews grid ---- */
function renderReviews() {
  const sortVal = document.getElementById('revSort')?.value || 'newest';
  let filtered = ALL_REVIEWS.filter(r => revFilter === 'all' || r.cat === revFilter);

  if (sortVal === 'highest') filtered.sort((a,b) => b.rating - a.rating);
  else if (sortVal === 'helpful') filtered.sort((a,b) => b.helpful - a.helpful);

  renderFeatured(filtered);

  const grid = document.getElementById('reviewsGrid');
  const toShow = filtered.filter(r => !r.featured).slice(0, visibleCount);
  grid.innerHTML = '';
  toShow.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'rev-card reveal';
    card.style.transitionDelay = (i * 0.05) + 's';
    card.innerHTML = `
      <div class="rev-card-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      <div class="rev-card-product">${r.product}</div>
      <div class="rev-card-title">${r.title}</div>
      <p class="rev-card-text">"${r.text.substring(0,180)}${r.text.length>180?'…':''}"</p>
      <div class="rev-card-footer">
        <div class="rev-card-author">
          <div class="rev-mini-avatar" style="background:linear-gradient(135deg,${r.color},var(--rose))">${r.initials}</div>
          <div>
            <div class="rev-card-name">${r.name}</div>
            <div class="rev-card-date">${r.location} · ${r.date}</div>
          </div>
        </div>
        <button class="rev-helpful" onclick="markHelpful(${r.id},this)" id="help-${r.id}" aria-label="Helpful">👍 ${r.helpful}</button>
      </div>`;
    grid.appendChild(card);
  });

  const loadBtn = document.getElementById('loadMoreBtn');
  if (loadBtn) loadBtn.style.display = filtered.length - 1 > visibleCount ? 'inline-flex' : 'none';

  initReveal();
}

function filterReviews(cat, btn) {
  revFilter = cat;
  visibleCount = 6;
  document.querySelectorAll('.rev-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderReviews();
}

function loadMore() {
  visibleCount += 3;
  renderReviews();
}

function markHelpful(id, btn) {
  const r = ALL_REVIEWS.find(x => x.id === id);
  if (!r || btn.dataset.voted) return;
  r.helpful++;
  btn.textContent = `👍 ${r.helpful}`;
  btn.dataset.voted = '1';
  btn.style.color = 'var(--gold)';
  showToast('<span class="toast-icon">👍</span> Thanks for your feedback!');
}

/* ---- Star picker ---- */
function setRating(val) {
  selectedRating = val;
  document.querySelectorAll('.sp-star').forEach(s => {
    s.classList.toggle('lit', parseInt(s.dataset.val) <= val);
  });
}

/* ---- Submit review ---- */
function submitReview(e) {
  e.preventDefault();
  if (selectedRating === 0) { showToast('Please select a rating!'); return; }
  const name = document.getElementById('wrName').value;
  ALL_REVIEWS.unshift({
    id: Date.now(), name, initials: name.split(' ').map(n=>n[0]).join('').toUpperCase(),
    location: 'Verified Purchase', cat: 'skincare',
    product: document.getElementById('wrProduct').value,
    rating: selectedRating,
    title: document.getElementById('wrTitle').value,
    text: document.getElementById('wrBody').value,
    date: 'Just now', helpful: 0, color: '#c9a96e',
  });
  showToast(`<span class="toast-icon">✦</span> Thank you, <strong>${name}</strong>! Your review is live.`);
  e.target.reset(); selectedRating = 0;
  document.querySelectorAll('.sp-star').forEach(s => s.classList.remove('lit'));
  renderReviews();
  document.getElementById('reviewsGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Init
renderReviews();
