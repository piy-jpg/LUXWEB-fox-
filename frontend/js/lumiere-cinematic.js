/**
 * LUMIÈRE BEAUTY — CINEMATIC LUXURY E-COMMERCE ENGINE
 * Luxury Motion, Draggable Carousels, Cart Drawer, Wishlist, Quick View & Live Search
 */

/* ------------------- 1. PRODUCT CATALOG DATA ------------------- */
const LUMIERE_PRODUCTS = [
  {
    id: 1,
    name: 'Radiance Glow Serum',
    category: 'skincare',
    categoryLabel: 'Skincare',
    brand: 'LUMIÈRE',
    price: 128,
    oldPrice: null,
    rating: 5,
    reviewsCount: 184,
    badge: 'Bestseller',
    badgeType: 'best',
    img: 'images/skincare_products_1788328338930.jpg',
    desc: 'An ultra-pure blend of bioactive Vitamin C, multimolecular hyaluronic acid, and botanical adaptogens. Restores light-reflective clarity and glass-skin luminosity.',
    shades: ['Universal Glass Finish'],
    volume: '30ml / 1.0 fl. oz.',
    ingredients: 'Camellia Sinensis Leaf Water, 3-O-Ethyl Ascorbic Acid, Sodium Hyaluronate, Niacinamide, Edelweiss Extract, Squalane.',
    isBestseller: true,
    isNewArrival: false,
  },
  {
    id: 2,
    name: 'Velvet Lip Collection',
    category: 'makeup',
    categoryLabel: 'Makeup',
    brand: 'LUMIÈRE',
    price: 58,
    oldPrice: 78,
    rating: 5,
    reviewsCount: 312,
    badge: 'Sale',
    badgeType: 'sale',
    img: 'images/makeup_products_1788328354838.jpg',
    desc: 'Weightless haute-couture matte lipstick infused with camellia seed oil and French rose extract. 12-hour pigment richness with zero drying.',
    shades: ['01 Rose Nocturne', '02 Rouge Amour', '03 Nude Renaissance', '04 Bois de Santal'],
    volume: '3.8g / 0.13 oz.',
    ingredients: 'Dimethicone, Camellia Japonica Seed Oil, Rosa Damascena Extract, Kaolin, Tocopherol, Natural Pigments.',
    isBestseller: true,
    isNewArrival: false,
  },
  {
    id: 3,
    name: "Noir d'Or Eau de Parfum",
    category: 'fragrance',
    categoryLabel: 'Fragrance',
    brand: 'LUMIÈRE',
    price: 215,
    oldPrice: null,
    rating: 5,
    reviewsCount: 96,
    badge: 'Iconic',
    badgeType: 'best',
    img: 'images/perfume_collection_1788328378783.jpg',
    desc: 'An evocative olfactory portrait of twilight in Paris. Smoked oud, liquid amber, Bourbon vanilla, and velvet Damask rose coalesce into an unforgettable aura.',
    shades: ['Fine Fragrance Vaporisateur'],
    volume: '100ml / 3.4 fl. oz.',
    ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua, Linalool, Coumarin, Benzyl Benzoate, Evernia Prunastri Extract.',
    isBestseller: true,
    isNewArrival: false,
  },
  {
    id: 4,
    name: 'Aeterna Golden Hair Elixir',
    category: 'haircare',
    categoryLabel: 'Hair Care',
    brand: 'LUMIÈRE',
    price: 94,
    oldPrice: null,
    rating: 5,
    reviewsCount: 78,
    badge: 'New',
    badgeType: 'new',
    img: 'images/haircare_luxury.jpg',
    desc: 'A transcendent multi-correctional hair and scalp oil. Cold-pressed argan, rare night-blooming jasmine, and 24k micronized gold impart liquid silk shine without weight.',
    shades: ['All Hair Types & Textures'],
    volume: '100ml / 3.4 fl. oz.',
    ingredients: 'Argania Spinosa Kernel Oil, Simmondsia Chinensis Seed Oil, Jasminum Officinale Extract, Gold Leaf Flakes, Tocopherol.',
    isBestseller: false,
    isNewArrival: true,
  },
  {
    id: 5,
    name: 'Restorative Night Nectar',
    category: 'skincare',
    categoryLabel: 'Skincare',
    brand: 'LUMIÈRE',
    price: 142,
    oldPrice: null,
    rating: 5,
    reviewsCount: 142,
    badge: 'Bestseller',
    badgeType: 'best',
    img: 'images/serum_dropper.jpg',
    desc: 'An intensive cellular regeneration nocturnal balm. Replaces overnight moisture loss with dual-chain peptides, wild ceramides, and marine collagen.',
    shades: ['Nightly Restorative'],
    volume: '50ml / 1.7 oz.',
    ingredients: 'Aqua, Butyrospermum Parkii Butter, Palmitoyl Tripeptide-1, Ceramide NP, Squalane, Centella Asiatica Extract.',
    isBestseller: true,
    isNewArrival: false,
  },
  {
    id: 6,
    name: 'Haute Contour Compact',
    category: 'makeup',
    categoryLabel: 'Makeup',
    brand: 'LUMIÈRE',
    price: 86,
    oldPrice: 110,
    rating: 5,
    reviewsCount: 89,
    badge: 'New',
    badgeType: 'new',
    img: 'images/editorial_flatlay.jpg',
    desc: 'Sculpted elegance in a gold refillable compact. Micro-milled pearls create soft-focus diffusion that mimics the golden hour glow.',
    shades: ['01 Champagne Glow', '02 Warm Bronze', '03 Sunlit Amber'],
    volume: '11g / 0.38 oz.',
    ingredients: 'Mica, Talc, Synthetic Fluorphlogopite, Jojoba Esters, Zinc Stearate, Caprylic/Capric Triglyceride.',
    isBestseller: false,
    isNewArrival: true,
  },
  {
    id: 7,
    name: 'Rose Bloom Eau de Toilette',
    category: 'fragrance',
    categoryLabel: 'Fragrance',
    brand: 'LUMIÈRE',
    price: 165,
    oldPrice: null,
    rating: 4,
    reviewsCount: 65,
    badge: null,
    badgeType: null,
    img: 'images/perfume_collection_1788328378783.jpg',
    desc: 'Morning dew on fresh Bulgarian roses, blended with crisp white peony, Italian bergamot, and a whisper of sheer cashmere woods.',
    shades: ['Daylight Spray'],
    volume: '50ml / 1.7 fl. oz.',
    ingredients: 'Alcohol Denat., Parfum, Aqua, Citronellol, Geraniol, Limonene, Alpha-Isomethyl Ionone.',
    isBestseller: false,
    isNewArrival: true,
  },
  {
    id: 8,
    name: 'Celestial Silk Scalp Masque',
    category: 'haircare',
    categoryLabel: 'Hair Care',
    brand: 'LUMIÈRE',
    price: 78,
    oldPrice: 95,
    rating: 5,
    reviewsCount: 52,
    badge: 'New',
    badgeType: 'new',
    img: 'images/haircare_luxury.jpg',
    desc: 'Deep revitalizing hair treatment featuring fermented rice water, plant keratin, and French lavender to fortify hair follicles from root to tip.',
    shades: ['Intensive Treatment'],
    volume: '200ml / 6.7 fl. oz.',
    ingredients: 'Cetearyl Alcohol, Hydrolyzed Wheat Protein, Oryza Sativa Extract, Lavandula Angustifolia Oil, Panthenol.',
    isBestseller: false,
    isNewArrival: true,
  },
  {
    id: 9,
    name: 'Rosehip Facial Oil',
    category: 'skincare',
    categoryLabel: 'Skincare',
    brand: 'LUMIÈRE',
    price: 74,
    oldPrice: null,
    rating: 5,
    reviewsCount: 110,
    badge: 'Organic',
    badgeType: 'new',
    img: 'images/category_1_skincare_34.jpg',
    desc: 'Cold-pressed virgin rosehip seed oil harvested in Patagonia, enriched with bio-active squalane and Vitamin E for velvety skin renewal.',
    shades: ['Pure Botanical'],
    volume: '30ml / 1.0 fl. oz.',
    ingredients: '100% Rosa Canina Seed Oil, Tocopherol.',
    isBestseller: true,
    isNewArrival: false,
  },
  {
    id: 10,
    name: 'Gold Radiance Highlighter',
    category: 'makeup',
    categoryLabel: 'Makeup',
    brand: 'LUMIÈRE',
    price: 46,
    oldPrice: null,
    rating: 5,
    reviewsCount: 220,
    badge: 'Bestseller',
    badgeType: 'best',
    img: 'images/category_2_makeup_34.jpg',
    desc: 'Prismatic highlighter with ultra-fine pearl pigments that blend seamlessly with skin warmth for an ethereal, glass-like reflection.',
    shades: ['01 Soliel Gold', '02 Moonlight Opal'],
    volume: '8g / 0.28 oz.',
    ingredients: 'Dimethicone, Synthetic Fluorphlogopite, Mica, Lauroyl Lysine, Caprylyl Glycol.',
    isBestseller: true,
    isNewArrival: false,
  },
  {
    id: 11,
    name: 'Jasmin Noir Parfum',
    category: 'fragrance',
    categoryLabel: 'Fragrance',
    brand: 'LUMIÈRE',
    price: 195,
    oldPrice: null,
    rating: 5,
    reviewsCount: 88,
    badge: 'Limited',
    badgeType: 'new',
    img: 'images/perfume_collection_1788328378783.jpg',
    desc: 'Sensual night-blooming jasmine, dark patchouli, smoked plum, and velvety sandalwood create a mysterious, hypnotic evening sillage.',
    shades: ['Extrait de Parfum'],
    volume: '100ml / 3.4 fl. oz.',
    ingredients: 'Alcohol Denat., Parfum, Jasminum Grandiflorum Flower Extract, Santalum Album Oil.',
    isBestseller: false,
    isNewArrival: true,
  },
  {
    id: 12,
    name: 'Botanical Hair Mist',
    category: 'haircare',
    categoryLabel: 'Hair Care',
    brand: 'LUMIÈRE',
    price: 52,
    oldPrice: null,
    rating: 5,
    reviewsCount: 46,
    badge: 'New',
    badgeType: 'new',
    img: 'images/haircare_luxury.jpg',
    desc: 'Weightless conditioning fragrance mist for tresses. Enriched with UV protective antioxidants and delicate orange blossom essence.',
    shades: ['Weightless Fine Mist'],
    volume: '75ml / 2.5 fl. oz.',
    ingredients: 'Aqua, Alcohol Denat., Citrus Aurantium Flower Water, Glycerin, Hydrolyzed Silk, Parfum.',
    isBestseller: false,
    isNewArrival: true,
  },
  {
    id: 13,
    name: "Éclat D'Or 24K Face Oil",
    category: 'skincare',
    categoryLabel: 'Skincare',
    brand: 'LUMIÈRE',
    price: 155,
    oldPrice: 185,
    rating: 5,
    reviewsCount: 124,
    badge: 'Atelier',
    badgeType: 'new',
    img: 'images/hero_slide_6.jpg',
    desc: 'An exquisite face elixir suspended with pure 24k gold leaf flakes, organic camellia seed oil, and botanical squalane for liquid silk radiance.',
    shades: ['24K Luminous Gold'],
    volume: '30ml / 1.0 fl. oz.',
    ingredients: 'Camellia Japonica Seed Oil, Simmondsia Chinensis Seed Oil, 24K Gold Leaf, Squalane, Rosa Damascena Flower Oil, Tocopherol.',
    isBestseller: false,
    isNewArrival: true,
  },
  {
    id: 14,
    name: 'Nocturne Ambré Extrait de Parfum',
    category: 'fragrance',
    categoryLabel: 'Fragrance',
    brand: 'LUMIÈRE',
    price: 240,
    oldPrice: null,
    rating: 5,
    reviewsCount: 78,
    badge: 'Exclusive',
    badgeType: 'new',
    img: 'images/hero_slide_2.jpg',
    desc: 'An opulent Parisian twilight olfactory masterpiece. Rare smoked oud, warm ambergris, velvet Turkish rose, and dark Bourbon vanilla.',
    shades: ['Extrait de Parfum Flacon'],
    volume: '100ml / 3.4 fl. oz.',
    ingredients: 'Alcohol Denat., Parfum, Amber Extract, Rosa Damascena Extract, Santalum Album Oil, Coumarin.',
    isBestseller: false,
    isNewArrival: true,
  },
  {
    id: 15,
    name: 'Velvet Rouge Haute Lip Couture',
    category: 'makeup',
    categoryLabel: 'Makeup',
    brand: 'LUMIÈRE',
    price: 62,
    oldPrice: 75,
    rating: 5,
    reviewsCount: 196,
    badge: 'Haute',
    badgeType: 'new',
    img: 'images/hero_slide_4.jpg',
    desc: 'Fluted gilded casing revealing an intensely pigmented velvet rouge. Infused with French rose nectar and rare botanical waxes for all-day comfort.',
    shades: ['05 Bordeaux Imperial', '06 Rouge Vendôme', '07 Rose Nocturne'],
    volume: '3.8g / 0.13 oz.',
    ingredients: 'Dimethicone, Synthetic Wax, Camellia Seed Oil, Rosa Gallica Extract, Iron Oxides, Red 7 Lake.',
    isBestseller: false,
    isNewArrival: true,
  },
  {
    id: 16,
    name: 'Botanique Cellulaire Radiance Essence',
    category: 'skincare',
    categoryLabel: 'Skincare',
    brand: 'LUMIÈRE',
    price: 118,
    oldPrice: null,
    rating: 5,
    reviewsCount: 92,
    badge: 'Organic',
    badgeType: 'new',
    img: 'images/hero_slide_5.jpg',
    desc: 'Micro-filtered botanical essence fermented with damask rose water and alpine edelweiss stem cells to illuminate and refine skin texture.',
    shades: ['Cellular Water Infusion'],
    volume: '150ml / 5.1 fl. oz.',
    ingredients: 'Rosa Damascena Flower Water, Leontopodium Alpinum Callus Culture Extract, Niacinamide, Sodium Hyaluronate, Glycerin.',
    isBestseller: false,
    isNewArrival: true,
  },
  {
    id: 17,
    name: 'Aura Sublime Silk Crème',
    category: 'skincare',
    categoryLabel: 'Skincare',
    brand: 'LUMIÈRE',
    price: 136,
    oldPrice: 160,
    rating: 5,
    reviewsCount: 148,
    badge: 'Limited',
    badgeType: 'new',
    img: 'images/hero_slide_3.jpg',
    desc: 'Velvety peptide-infused moisturizing crème encased in faceted crystal. Melts upon contact to deliver continuous 24-hour dewiness and barrier repair.',
    shades: ['Sublime Velvet Crème'],
    volume: '50ml / 1.7 oz.',
    ingredients: 'Aqua, Butyrospermum Parkii, Squalane, Palmitoyl Tetrapeptide-7, Ceramide EOP, Jasminum Officinale Extract.',
    isBestseller: false,
    isNewArrival: true,
  },
  {
    id: 18,
    name: "L'Élixir Nectar Sublime Hair Oil",
    category: 'haircare',
    categoryLabel: 'Hair Care',
    brand: 'LUMIÈRE',
    price: 88,
    oldPrice: null,
    rating: 5,
    reviewsCount: 64,
    badge: 'New',
    badgeType: 'new',
    img: 'images/hero_slide_1.jpg',
    desc: 'Artisanal cold-pressed botanical hair oil enriched with micronized 24k gold, argan kernel, and Bulgarian rose for weightless mirror shine.',
    shades: ['Liquid Gold Silk'],
    volume: '100ml / 3.4 fl. oz.',
    ingredients: 'Argania Spinosa Kernel Oil, Camellia Oleifera Seed Oil, Gold Leaf Flakes, Rosa Damascena Flower Oil, Tocopherol.',
    isBestseller: false,
    isNewArrival: true,
  },
  {
    id: 19,
    name: 'Imperiale Amber Flacon',
    category: 'fragrance',
    categoryLabel: 'Fragrance',
    brand: 'LUMIÈRE',
    price: 260,
    oldPrice: null,
    rating: 5,
    reviewsCount: 104,
    badge: 'Bestseller',
    badgeType: 'best',
    img: 'images/category_3_fragrance_34.jpg',
    desc: 'An iconic flacon capturing the golden radiance of twilight. Bourbon amber, velvety damask rose, and smoked santal for timeless elegance.',
    shades: ['Haute Parfumerie Flacon'],
    volume: '100ml / 3.4 fl. oz.',
    ingredients: 'Alcohol Denat., Parfum, Santalum Album Oil, Rosa Damascena Extract, Amber Resin, Coumarin.',
    isBestseller: true,
    isNewArrival: false,
  },
  {
    id: 20,
    name: 'Sublime Botanical Scalp Nectar',
    category: 'haircare',
    categoryLabel: 'Hair Care',
    brand: 'LUMIÈRE',
    price: 82,
    oldPrice: null,
    rating: 5,
    reviewsCount: 88,
    badge: 'Bestseller',
    badgeType: 'best',
    img: 'images/category_4_haircare_34.jpg',
    desc: 'Concentrated peptide scalp serum enriched with French lavender and fermented botanicals to fortify hair density and weightless shine.',
    shades: ['All Hair Textures'],
    volume: '60ml / 2.0 fl. oz.',
    ingredients: 'Aqua, Glycerin, Hydrolyzed Silk, Lavandula Angustifolia Oil, Camellia Japonica Seed Oil, Biotinoyl Tripeptide-1.',
    isBestseller: true,
    isNewArrival: false,
  },
  {
    id: 21,
    name: "Éclat d'Or 24K Body Nectar",
    category: 'bathbody',
    categoryLabel: 'Bath & Body',
    brand: 'LUMIÈRE',
    price: 135,
    oldPrice: 165,
    rating: 5,
    reviewsCount: 142,
    badge: 'Iconic',
    badgeType: 'best',
    img: 'images/category_5_bath_34.jpg',
    desc: 'Molten gold bath and body serum suspended with pure 24k gold flakes and sweet almond oil, providing satin-soft skin renewal.',
    shades: ['24K Molten Nectar'],
    volume: '200ml / 6.7 fl. oz.',
    ingredients: 'Prunus Amygdalus Dulcis Oil, Squalane, 24K Gold Flakes, Citrus Aurantium Dulcis Flower Oil, Tocopherol.',
    isBestseller: true,
    isNewArrival: false,
  },
  {
    id: 22,
    name: 'Maison Aura Glow Couture Set',
    category: 'skincare',
    categoryLabel: 'Skincare',
    brand: 'LUMIÈRE',
    price: 245,
    oldPrice: 290,
    rating: 5,
    reviewsCount: 198,
    badge: 'Limited',
    badgeType: 'best',
    img: 'images/category_6_sets_34.jpg',
    desc: 'A complete atelier ritual set featuring the Aura Glow Crème, twin Vitality Serums, and gilded compact in signature coffret packaging.',
    shades: ['Complete Couture Ritual'],
    volume: '4-Piece Coffret',
    ingredients: 'Bioactive Hyaluronic Acid, Marine Peptides, 24K Gold Leaf, Wild Rosehip Extract, Camellia Seed Oil.',
    isBestseller: true,
    isNewArrival: false,
  },
  {
    id: 23,
    name: 'Aeterna Botanical Hair Elixir',
    category: 'haircare',
    categoryLabel: 'Hair Care',
    brand: 'LUMIÈRE',
    price: 94,
    oldPrice: null,
    rating: 5,
    reviewsCount: 112,
    badge: 'Award Winner',
    badgeType: 'best',
    img: 'images/haircare_luxury.jpg',
    desc: 'Multicorrectional botanical treatment oil with cold-pressed argan and rare night-blooming jasmine for mirror-like glossy finishes.',
    shades: ['Pure Botanical'],
    volume: '100ml / 3.4 fl. oz.',
    ingredients: 'Argania Spinosa Kernel Oil, Simmondsia Chinensis Seed Oil, Jasminum Officinale Extract, Tocopherol.',
    isBestseller: true,
    isNewArrival: false,
  },
  {
    id: 24,
    name: 'Haute Refillable Palette & Brush',
    category: 'makeup',
    categoryLabel: 'Makeup',
    brand: 'LUMIÈRE',
    price: 110,
    oldPrice: null,
    rating: 5,
    reviewsCount: 164,
    badge: 'Bestseller',
    badgeType: 'best',
    img: 'images/editorial_flatlay.jpg',
    desc: 'Artisanal gilded compact paired with an ultra-soft goat hair blending brush for flawless warm contouring and golden hour reflection.',
    shades: ['Champagne & Bronze'],
    volume: '14g / 0.49 oz.',
    ingredients: 'Mica, Synthetic Fluorphlogopite, Squalane, Silica, Iron Oxides, Titanium Dioxide.',
    isBestseller: true,
    isNewArrival: false,
  }
];

/* ------------------- 2. STATE MANAGEMENT ------------------- */
var cart = (typeof window.cart !== 'undefined' && Array.isArray(window.cart))
  ? window.cart
  : JSON.parse(localStorage.getItem('lumiere_cart') || localStorage.getItem('lumiere-cart') || '[]');
window.cart = cart;

var wishlist = (typeof window.wishlist !== 'undefined' && window.wishlist instanceof Set)
  ? window.wishlist
  : new Set(JSON.parse(localStorage.getItem('lumiere_wishlist') || localStorage.getItem('lumiere-wishlist') || '[]'));
window.wishlist = wishlist;

const FREE_SHIPPING_THRESHOLD = 100;

function saveCart() {
  localStorage.setItem('lumiere_cart', JSON.stringify(cart));
  localStorage.setItem('lumiere-cart', JSON.stringify(cart));
  updateCartUI();
}

function saveWishlist() {
  const arr = (wishlist instanceof Set) ? [...wishlist] : wishlist;
  localStorage.setItem('lumiere_wishlist', JSON.stringify(arr));
  localStorage.setItem('lumiere-wishlist', JSON.stringify(arr));
  updateWishlistUI();
}



/* ------------------- 4. HERO ENTRANCE & AUTO-SCROLL SLIDER ------------------- */
function initHeroEntrance() {
  const heroVignette = document.getElementById('heroVignette');
  const heroContent = document.getElementById('heroContent');

  // Trigger smooth slow overlay fade
  setTimeout(() => {
    if (heroVignette) heroVignette.classList.add('loaded');
  }, 100);

  // Trigger staggered editorial text reveals
  setTimeout(() => {
    if (heroContent) heroContent.classList.add('animated');
  }, 350);

  // Initialize the 4-image auto-scrolling hero background
  initHeroSlider();
}

function initHeroSlider() {
  const track = document.getElementById('heroSlidesTrack');
  const heroSection = document.getElementById('heroSection');
  if (!track || !heroSection) return;

  if (track.dataset.sliderInitialized === 'true') return;
  track.dataset.sliderInitialized = 'true';

  const originalSlides = Array.from(track.querySelectorAll('.hero-slide'));
  const indicators = Array.from(document.querySelectorAll('.hero-indicator-dot'));
  const prevBtn = document.getElementById('heroPrevBtn');
  const nextBtn = document.getElementById('heroNextBtn');
  const totalSlides = originalSlides.length; // 4
  if (totalSlides <= 1) return;

  let currentIndex = 0;
  let autoScrollTimer = null;
  const slideDuration = 2000; // 2 seconds per slide
  let isTransitioning = false;
  let transitionSafetyTimer = null;

  // Clone first and last slide for seamless infinite forward/backward loop
  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[totalSlides - 1].cloneNode(true);
  firstClone.classList.remove('active');
  firstClone.setAttribute('data-clone', 'first');
  lastClone.classList.remove('active');
  lastClone.setAttribute('data-clone', 'last');

  track.appendChild(firstClone);
  track.insertBefore(lastClone, originalSlides[0]);

  // Track items: [lastClone (0), slide0 (1), slide1 (2), slide2 (3), slide3 (4), firstClone (5)]
  let trackIndex = 1;

  function setTrackPosition(index, animate = true) {
    if (animate) {
      track.style.transition = 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      track.style.transition = 'none';
    }
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  // Set initial position
  setTrackPosition(trackIndex, false);

  function updateIndicatorUI(realIndex) {
    indicators.forEach((dot, idx) => {
      const isActive = idx === realIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');

      // Restart progress bar animation
      const progress = dot.querySelector('.indicator-progress');
      if (progress) {
        progress.style.animation = 'none';
        void progress.offsetWidth; // trigger reflow
        if (isActive) {
          progress.style.animation = `heroProgressAnim ${slideDuration}ms linear forwards`;
        }
      }
    });

    // Update active slide class for Ken-Burns zoom
    const allSlides = track.querySelectorAll('.hero-slide');
    allSlides.forEach((slide) => slide.classList.remove('active'));
    if (allSlides[trackIndex]) {
      allSlides[trackIndex].classList.add('active');
    }
  }

  function getRealIndex(tIndex) {
    if (tIndex === 0) return totalSlides - 1;
    if (tIndex === totalSlides + 1) return 0;
    return tIndex - 1;
  }

  function goToSlide(newTrackIndex) {
    if (isTransitioning) return;
    isTransitioning = true;
    trackIndex = newTrackIndex;
    setTrackPosition(trackIndex, true);

    currentIndex = getRealIndex(trackIndex);
    updateIndicatorUI(currentIndex);

    // Failsafe timer so isTransitioning never gets stuck if transitionend is missed
    clearTimeout(transitionSafetyTimer);
    transitionSafetyTimer = setTimeout(() => {
      isTransitioning = false;
    }, 850);
  }

  function nextSlide() {
    goToSlide(trackIndex + 1);
  }

  function prevSlide() {
    goToSlide(trackIndex - 1);
  }

  // Seamless boundary wrap-around when slide finishes animating
  track.addEventListener('transitionend', (e) => {
    if (e.target !== track) return;
    isTransitioning = false;
    clearTimeout(transitionSafetyTimer);

    if (trackIndex === totalSlides + 1) {
      // Reached firstClone -> instantly jump to slide 1
      trackIndex = 1;
      setTrackPosition(trackIndex, false);
      void track.offsetWidth; // Force reflow
      const allSlides = track.querySelectorAll('.hero-slide');
      allSlides.forEach((slide) => slide.classList.remove('active'));
      if (allSlides[1]) allSlides[1].classList.add('active');
    } else if (trackIndex === 0) {
      // Reached lastClone -> instantly jump to slide 4
      trackIndex = totalSlides;
      setTrackPosition(trackIndex, false);
      void track.offsetWidth; // Force reflow
      const allSlides = track.querySelectorAll('.hero-slide');
      allSlides.forEach((slide) => slide.classList.remove('active'));
      if (allSlides[totalSlides]) allSlides[totalSlides].classList.add('active');
    }
  });

  // Auto-scroll Timer: runs continuously every 2 seconds
  function startAutoScroll() {
    stopAutoScroll();
    autoScrollTimer = setInterval(() => {
      nextSlide();
    }, slideDuration);
  }

  function stopAutoScroll() {
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  }

  function resetAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
  }

  // Arrow buttons
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
      resetAutoScroll();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
      resetAutoScroll();
    });
  }

  // Indicator buttons
  indicators.forEach((dot, idx) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(idx + 1);
      resetAutoScroll();
    });
  });

  // Keyboard navigation when hero is visible
  document.addEventListener('keydown', (e) => {
    if (!isHeroVisible()) return;
    if (e.key === 'ArrowRight') {
      nextSlide();
      resetAutoScroll();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
      resetAutoScroll();
    }
  });

  function isHeroVisible() {
    const rect = heroSection.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }



  // Initialize first slide state
  updateIndicatorUI(0);
  startAutoScroll();
  console.log('[Lumière] Hero auto-scroll active: 2s interval');
}

/* ------------------- 5. NAVBAR SCROLL TRANSFORMATION ------------------- */
function initNavbarScroll() {
  const navbar = document.getElementById('lumiereNavbar');
  if (!navbar) return;

  function handleScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ------------------- 6. BRAND METRICS ANIMATED COUNTER ------------------- */
function initMetricsCounter() {
  const metricsSection = document.getElementById('brandMetricsSection');
  if (!metricsSection) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateNumber('metricProducts', 0, 250, 1600, '+');
        animateNumber('metricCurated', 0, 98, 1600, '%');
        animateNumber('metricClients', 0, 50, 1600, 'K+');
        animateNumber('metricAwards', 0, 12, 1400, '');
      }
    });
  }, { threshold: 0.3 });

  observer.observe(metricsSection);
}

function animateNumber(id, start, end, duration, suffix = '') {
  const el = document.getElementById(id);
  if (!el) return;

  const range = end - start;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.floor(start + range * easeProgress);

    el.textContent = currentVal + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = end + suffix;
    }
  }

  requestAnimationFrame(step);
}

/* ------------------- 7. DRAGGABLE PRODUCT CAROUSELS ------------------- */
function getBestsellers4CardsStep() {
  const container = document.getElementById('bestsellersContainer');
  if (!container) return 1292;
  const cards = container.querySelectorAll('.luxury-product-card');
  if (cards.length >= 5) {
    return cards[4].offsetLeft - cards[0].offsetLeft;
  }
  const card = container.querySelector('.luxury-product-card');
  if (card) {
    const track = container.querySelector('.product-cards-track');
    const gap = track ? (parseFloat(window.getComputedStyle(track).gap) || 28) : 28;
    return (card.offsetWidth + gap) * 4;
  }
  return 1292;
}

function initProductCarousels() {
  renderCarouselProducts('bestsellersTrack', LUMIERE_PRODUCTS.filter(p => p.isBestseller));
  renderCarouselProducts('newArrivalsTrack', LUMIERE_PRODUCTS.filter(p => p.isNewArrival));

  setupCarouselDrag('bestsellersContainer', 'bestsellerPrevBtn', 'bestsellerNextBtn', getBestsellers4CardsStep);
  setupCarouselDrag('newArrivalsContainer', 'newArrivalsPrevBtn', 'newArrivalsNextBtn');
  initBestsellersAutoScroll();
  initNewArrivalsAutoScroll();
}

function renderCarouselProducts(trackId, products) {
  const track = document.getElementById(trackId);
  if (!track) return;

  track.innerHTML = products.map(p => createProductCardHTML(p)).join('');
}

function createProductCardHTML(p) {
  const isWishlisted = wishlist.has(p.id);
  const badgeHTML = p.badge ? `<span class="product-badge badge-${p.badgeType || 'best'}">${p.badge}</span>` : '';
  const oldPriceHTML = p.oldPrice ? `<span class="old-price">$${p.oldPrice.toFixed(2)}</span>` : '';
  const starIcons = '★'.repeat(p.rating) + '☆'.repeat(5 - p.rating);

  return `
    <article class="luxury-product-card" data-product-id="${p.id}">
      <div class="product-img-wrapper">
        ${badgeHTML}
        <button class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" 
                onclick="toggleWishlist(${p.id}, event)" 
                aria-label="Wishlist ${p.name}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <img src="${p.img}" alt="${p.name}" class="product-img" loading="lazy" />
        <button class="product-quick-btn" onclick="openQuickView(${p.id})">Quick View</button>
      </div>
      <div class="product-info">
        <span class="product-brand">${p.brand}</span>
        <h3 class="product-title">${p.name}</h3>
        <div class="product-rating">
          <span class="stars">${starIcons}</span>
          <span class="rating-count">(${p.reviewsCount})</span>
        </div>
        <div class="product-pricing">
          <span class="current-price">$${p.price.toFixed(2)}</span>
          ${oldPriceHTML}
        </div>
        <button class="product-add-btn" onclick="addToCart(${p.id}, 1)">Add to Bag</button>
      </div>
    </article>
  `;
}

function setupCarouselDrag(containerId, prevBtnId, nextBtnId, stepFn) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);

  // Arrow buttons click
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const step = (typeof stepFn === 'function') ? stepFn() : 340;
      if (container.scrollLeft <= 30) {
        container.scrollTo({ left: container.scrollWidth - container.clientWidth, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -step, behavior: 'smooth' });
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const step = (typeof stepFn === 'function') ? stepFn() : 340;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 30) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: step, behavior: 'smooth' });
      }
    });
  }

  // Mouse Drag to Scroll
  let isDown = false;
  let startX;
  let scrollLeft;

  container.addEventListener('mousedown', (e) => {
    isDown = true;
    container.classList.add('active-drag');
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener('mouseleave', () => {
    isDown = false;
    container.classList.remove('active-drag');
  });

  container.addEventListener('mouseup', () => {
    isDown = false;
    container.classList.remove('active-drag');
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });
}

function initNewArrivalsAutoScroll() {
  const container = document.getElementById('newArrivalsContainer');
  if (!container) return;
  if (container.dataset.autoScrollInit === 'true') return;
  container.dataset.autoScrollInit = 'true';

  let autoScrollTimer = null;
  const interval = 2500; // Auto-scrolls smoothly every 2.5 seconds
  const cardStep = 325; // 295px card width + 30px gap
  let isPaused = false;
  let resumeTimer = null;

  function autoStep() {
    if (isPaused || document.hidden) return;
    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll <= 0) return;

    // Check if reached or approaching the rightmost end
    if (container.scrollLeft >= maxScroll - 35) {
      // Loop smoothly back to the beginning (leftmost product)
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      // Advance forward from left to right
      container.scrollBy({ left: cardStep, behavior: 'smooth' });
    }
  }

  function start() {
    stop();
    autoScrollTimer = setInterval(autoStep, interval);
  }

  function stop() {
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  }

  function pauseTemporarily() {
    isPaused = true;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      isPaused = false;
    }, 3000);
  }

  // Pause on hover over container so client can inspect products and click Add to Bag
  container.addEventListener('mouseenter', () => { isPaused = true; });
  container.addEventListener('mouseleave', () => { isPaused = false; });

  // Pause temporarily on manual interactions (touch swipe, wheel, drag)
  container.addEventListener('touchstart', pauseTemporarily, { passive: true });
  container.addEventListener('mousedown', pauseTemporarily);
  container.addEventListener('wheel', pauseTemporarily, { passive: true });

  const prevBtn = document.getElementById('newArrivalsPrevBtn');
  const nextBtn = document.getElementById('newArrivalsNextBtn');
  if (prevBtn) prevBtn.addEventListener('click', pauseTemporarily);
  if (nextBtn) nextBtn.addEventListener('click', pauseTemporarily);

  start();
  console.log('[Lumière] New Arrivals auto-scroll active: 12 products, 2.5s step');
}

function initBestsellersAutoScroll() {
  const container = document.getElementById('bestsellersContainer');
  if (!container) return;
  if (container.dataset.autoScrollInit === 'true') return;
  container.dataset.autoScrollInit = 'true';

  let autoScrollTimer = null;
  const interval = 3500; // 3.5 seconds per 4-product view
  let isPaused = false;
  let resumeTimer = null;

  function autoStep() {
    if (isPaused || document.hidden) return;
    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll <= 0) return;

    const step = getBestsellers4CardsStep();

    // Check if at or near the end (viewing the 3rd set of 4 cards)
    if (container.scrollLeft >= maxScroll - 40) {
      // Loop smoothly back to the first 4 products (repeating order)
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      // Advance by next 4 products
      container.scrollBy({ left: step, behavior: 'smooth' });
    }
  }

  function start() {
    stop();
    autoScrollTimer = setInterval(autoStep, interval);
  }

  function stop() {
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  }

  function pauseTemporarily() {
    isPaused = true;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      isPaused = false;
    }, 4500);
  }

  // Pause on hover over container so client can inspect products and click Add to Bag
  container.addEventListener('mouseenter', () => { isPaused = true; });
  container.addEventListener('mouseleave', () => { isPaused = false; });

  // Pause temporarily on manual interactions (touch swipe, wheel, drag)
  container.addEventListener('touchstart', pauseTemporarily, { passive: true });
  container.addEventListener('mousedown', pauseTemporarily);
  container.addEventListener('wheel', pauseTemporarily, { passive: true });

  const prevBtn = document.getElementById('bestsellerPrevBtn');
  const nextBtn = document.getElementById('bestsellerNextBtn');
  if (prevBtn) prevBtn.addEventListener('click', pauseTemporarily);
  if (nextBtn) nextBtn.addEventListener('click', pauseTemporarily);

  start();
  console.log('[Lumière] The Edit auto-scroll active: 12 products, 4-card sequence, 3.5s loop');
}

/* ------------------- 8. THE LUMIÈRE STANDARD SEQUENTIAL REVEAL ------------------- */
function initStandardScroll() {
  const valueItems = document.querySelectorAll('.value-item');
  if (!valueItems.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.25 });

  valueItems.forEach(item => observer.observe(item));
}

/* ------------------- 9. CART DRAWER & WISHLIST LOGIC ------------------- */
function initCartAndWishlist() {
  updateCartUI();
  updateWishlistUI();

  // Close drawers on backdrop click
  const backdrop = document.getElementById('lumiereBackdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeAllDrawersAndModals);
  }

  // Close with Esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDrawersAndModals();
  });
}

function getCatalog() {
  return (typeof PRODUCTS !== 'undefined' && PRODUCTS.length) ? PRODUCTS : LUMIERE_PRODUCTS;
}

function getProductById(productId) {
  return getCatalog().find(p => p.id === productId);
}

function addToCart(productId, qty = 1, shade = null) {
  const product = getProductById(productId);
  if (!product) return;

  const chosenShade = shade || (product.shades && product.shades[0]) || '';
  const existingIndex = cart.findIndex(item => item.id === productId && item.shade === chosenShade);

  if (existingIndex > -1) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
      shade: chosenShade,
      qty: qty,
    });
  }

  saveCart();
  showToast(`Added "${product.name}" to your shopping bag.`);
  openCartDrawer();
}

function updateCartQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
}

function removeCartItem(index) {
  if (!cart[index]) return;
  const removedName = cart[index].name;
  cart.splice(index, 1);
  saveCart();
  showToast(`Removed "${removedName}" from bag.`);
}

function updateCartUI() {
  const badge = document.getElementById('navCartCount');
  const itemsContainer = document.getElementById('cartItemsList');
  const emptyState = document.getElementById('cartEmptyState');
  const subtotalEl = document.getElementById('cartSubtotalAmount');
  const meterFill = document.getElementById('shippingMeterFill');
  const meterText = document.getElementById('shippingMeterText');

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (badge) badge.textContent = totalCount;

  // Free shipping calculation
  if (meterFill && meterText) {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      meterFill.style.width = '100%';
      meterText.innerHTML = '✦ <strong>Complimentary Luxury Delivery</strong> unlocked!';
    } else {
      const needed = (FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2);
      const percentage = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
      meterFill.style.width = `${percentage}%`;
      meterText.innerHTML = `Add <strong>$${needed}</strong> more for complimentary delivery.`;
    }
  }

  if (subtotalEl) {
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  }

  if (!itemsContainer) return;

  if (cart.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    itemsContainer.innerHTML = '';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    itemsContainer.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-details">
          <div>
            <h4 class="cart-item-title">${item.name}</h4>
            <span class="cart-item-price">$${item.price.toFixed(2)}</span>
            ${item.shade ? `<div style="font-size:0.75rem; color:var(--color-gray-medium);">${item.shade}</div>` : ''}
          </div>
          <div class="cart-item-controls">
            <div class="qty-stepper">
              <button class="qty-btn" onclick="updateCartQty(${idx}, -1)" aria-label="Decrease quantity">−</button>
              <span class="qty-number">${item.qty}</span>
              <button class="qty-btn" onclick="updateCartQty(${idx}, 1)" aria-label="Increase quantity">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeCartItem(${idx})">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function openCartDrawer() {
  closeWishlistDrawer();
  updateCartUI();
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('lumiereBackdrop');
  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('lumiereBackdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop && !isAnyOtherModalOpen()) backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

function syncWishlistButtons(productId = null) {
  if (productId !== null) {
    const active = wishlist.has(productId);
    document.querySelectorAll(`.luxury-product-card[data-product-id="${productId}"] .product-wishlist-btn, .editorial-product-card[data-id="${productId}"] .card-floating-wishlist`).forEach(btn => {
      btn.classList.toggle('active', active);
      const icon = btn.querySelector('svg');
      if (icon) icon.setAttribute('fill', active ? 'currentColor' : 'none');
    });
  } else {
    document.querySelectorAll('.luxury-product-card, .editorial-product-card').forEach(card => {
      const id = parseInt(card.getAttribute('data-product-id') || card.getAttribute('data-id'));
      const btn = card.querySelector('.product-wishlist-btn, .card-floating-wishlist');
      if (btn && !isNaN(id)) {
        const active = wishlist.has(id);
        btn.classList.toggle('active', active);
        const icon = btn.querySelector('svg');
        if (icon) icon.setAttribute('fill', active ? 'currentColor' : 'none');
      }
    });
  }
}

function toggleWishlist(productId, e) {
  if (e) e.stopPropagation();
  const product = getProductById(productId);
  if (!product) return;

  if (wishlist.has(productId)) {
    wishlist.delete(productId);
    showToast(`Removed "${product.name}" from your wishlist.`);
  } else {
    wishlist.add(productId);
    showToast(`Saved "${product.name}" to your wishlist.`);
  }

  saveWishlist();
  syncWishlistButtons(productId);
}

function updateWishlistUI() {
  const badge = document.getElementById('navWishlistCount');
  const headerCount = document.getElementById('wishlistHeaderCount');
  const list = document.getElementById('wishlistItemsList');
  const emptyState = document.getElementById('wishlistEmptyState');
  const addAllBtn = document.getElementById('wishlistAddAllBtn');

  if (badge) badge.textContent = wishlist.size;
  if (headerCount) headerCount.textContent = `(${wishlist.size})`;

  if (!list) return;

  const wishlistedProducts = getCatalog().filter(p => wishlist.has(p.id));

  if (wishlistedProducts.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    list.innerHTML = '';
    if (addAllBtn) addAllBtn.style.display = 'none';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    if (addAllBtn) addAllBtn.style.display = 'block';
    list.innerHTML = wishlistedProducts.map(p => `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.name}" class="cart-item-img" />
        <div class="cart-item-details">
          <div>
            <span class="product-brand" style="font-size:0.65rem; color:var(--color-gold); letter-spacing:0.12em; text-transform:uppercase;">${p.brand || p.categoryLabel || p.category || 'LUMIÈRE'}</span>
            <h4 class="cart-item-title">${p.name}</h4>
            <span class="cart-item-price">$${p.price.toFixed(2)}</span>
          </div>
          <div class="cart-item-controls" style="margin-top:0.75rem;">
            <button class="btn-luxury-primary" style="padding:0.5rem 1rem; font-size:0.7rem;" onclick="moveWishlistToCart(${p.id})">ADD TO BAG &rarr;</button>
            <button class="cart-item-remove" onclick="toggleWishlist(${p.id})">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function openWishlistDrawer() {
  closeCartDrawer();
  updateWishlistUI();
  const drawer = document.getElementById('wishlistDrawer');
  const backdrop = document.getElementById('lumiereBackdrop');
  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeWishlistDrawer() {
  const drawer = document.getElementById('wishlistDrawer');
  const backdrop = document.getElementById('lumiereBackdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop && !isAnyOtherModalOpen()) backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

function moveWishlistToCart(productId) {
  addToCart(productId, 1);
  wishlist.delete(productId);
  saveWishlist();
  updateWishlistUI();
  syncWishlistButtons(productId);
  closeWishlistDrawer();
  openCartDrawer();
}

function addAllWishlistToCart() {
  const wishlistedIds = [...wishlist];
  if (!wishlistedIds.length) return;

  wishlistedIds.forEach(id => {
    const product = getProductById(id);
    if (product) {
      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          img: product.img,
          shade: (product.shades && product.shades[0]) || '',
          qty: 1
        });
      }
    }
  });

  wishlist.clear();
  saveCart();
  saveWishlist();
  updateWishlistUI();
  syncWishlistButtons();
  showToast('Moved all wishlisted items to your shopping bag.');
  closeWishlistDrawer();
  openCartDrawer();
}

/* ------------------- 10. QUICK VIEW MODAL ------------------- */
let currentQuickViewProduct = null;

function initQuickViewModal() {
  const modal = document.getElementById('quickViewModal');
  const closeBtn = document.getElementById('quickModalCloseBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeQuickView);
  }
}

function openQuickView(productId) {
  const product = getProductById(productId);
  if (!product) return;

  currentQuickViewProduct = product;

  const modal = document.getElementById('quickViewModal');
  const backdrop = document.getElementById('lumiereBackdrop');
  const imgEl = document.getElementById('quickModalImg');
  const brandEl = document.getElementById('quickModalBrand');
  const titleEl = document.getElementById('quickModalTitle');
  const priceEl = document.getElementById('quickModalPrice');
  const descEl = document.getElementById('quickModalDesc');
  const shadesContainer = document.getElementById('quickModalShades');

  if (imgEl) imgEl.src = product.img;
  if (brandEl) brandEl.textContent = product.brand || 'LUMIÈRE';
  if (titleEl) titleEl.textContent = product.name;
  if (priceEl) priceEl.textContent = `$${product.price.toFixed(2)}`;
  if (descEl) descEl.textContent = product.desc;

  if (shadesContainer) {
    if (product.shades && product.shades.length) {
      shadesContainer.innerHTML = product.shades.map((s, i) => `
        <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; margin-bottom:0.4rem; cursor:pointer;">
          <input type="radio" name="quickShade" value="${s}" ${i === 0 ? 'checked' : ''} />
          <span>${s}</span>
        </label>
      `).join('');
      if (shadesContainer.parentElement) shadesContainer.parentElement.style.display = 'block';
    } else {
      shadesContainer.innerHTML = '';
      if (shadesContainer.parentElement) shadesContainer.parentElement.style.display = 'none';
    }
  }

  if (modal) modal.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.getElementById('quickViewModal');
  const backdrop = document.getElementById('lumiereBackdrop');
  if (modal) modal.classList.remove('open');
  if (backdrop && !isAnyOtherModalOpen()) backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

function addCurrentQuickViewToCart() {
  if (!currentQuickViewProduct) return;
  const shadeInput = document.querySelector('input[name="quickShade"]:checked');
  const shade = shadeInput ? shadeInput.value : null;
  addToCart(currentQuickViewProduct.id, 1, shade);
  closeQuickView();
}

/* ------------------- 11. LIVE SEARCH OVERLAY ------------------- */
function initSearchModal() {
  const searchInput = document.getElementById('searchModalInput');
  const resultsGrid = document.getElementById('searchResultsGrid');
  const searchModal = document.getElementById('searchModal');
  const closeBtn = document.getElementById('searchModalCloseBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeSearchModal);
  }

  if (searchInput && resultsGrid) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        resultsGrid.innerHTML = '<p style="grid-column:span 3; color:rgba(250,247,242,0.5); text-align:center;">Type to search luxury cosmetics, fragrances & skincare...</p>';
        return;
      }

      const matches = getCatalog().filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        resultsGrid.innerHTML = `<p style="grid-column:span 3; color:rgba(250,247,242,0.5); text-align:center;">No results found for "${e.target.value}"</p>`;
      } else {
        resultsGrid.innerHTML = matches.map(p => `
          <div style="background:var(--color-espresso-card); padding:1rem; border:1px solid var(--color-border-dark); cursor:pointer;" onclick="openQuickView(${p.id}); closeSearchModal();">
            <img src="${p.img}" alt="${p.name}" style="aspect-ratio:1/1; object-fit:cover; margin-bottom:0.75rem;" />
            <h4 style="font-family:var(--font-serif); font-size:1.1rem; color:var(--color-cream); margin-bottom:0.3rem;">${p.name}</h4>
            <span style="color:var(--color-gold); font-size:0.9rem;">$${p.price.toFixed(2)}</span>
          </div>
        `).join('');
      }
    });
  }
}

function openSearchModal() {
  const modal = document.getElementById('searchModal');
  const input = document.getElementById('searchModalInput');
  if (modal) modal.classList.add('open');
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 150);
  }
  document.body.style.overflow = 'hidden';
}

function closeSearchModal() {
  const modal = document.getElementById('searchModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ------------------- 12. TOAST NOTIFICATIONS ------------------- */
let toastTimeout;

function showToast(message) {
  const toast = document.getElementById('lumiereToast');
  const msgEl = document.getElementById('toastMessage');
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ------------------- 13. NEWSLETTER ------------------- */
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('newsletterEmail');
    if (input && input.value) {
      showToast('Welcome to the world of Lumière. Your invitation is confirmed.');
      input.value = '';
    }
  });
}

/* ------------------- 14. MOBILE NAVIGATION (SIDE NAVBAR) ------------------- */
function openMobileNav() {
  const drawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('lumiereBackdrop');
  const hamburger = document.getElementById('navHamburger');
  if (drawer) {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  }
  if (backdrop) backdrop.classList.add('open');
  if (hamburger) hamburger.classList.add('is-active');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  const drawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('lumiereBackdrop');
  const hamburger = document.getElementById('navHamburger');
  if (drawer) {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }
  if (backdrop && !isAnyOtherModalOpen()) backdrop.classList.remove('open');
  if (hamburger) hamburger.classList.remove('is-active');
  document.body.style.overflow = '';
}

function initMobileNav() {
  const hamburger = document.getElementById('navHamburger');
  const drawer = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('mobileNavClose');

  if (hamburger) {
    hamburger.removeEventListener('click', openMobileNav);
    hamburger.addEventListener('click', openMobileNav);
  }

  if (closeBtn) {
    closeBtn.removeEventListener('click', closeMobileNav);
    closeBtn.addEventListener('click', closeMobileNav);
  }
}

// Global window exposure for inline event handlers
window.openMobileNav = openMobileNav;
window.closeMobileNav = closeMobileNav;
window.addToCart = addToCart;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.openWishlistDrawer = openWishlistDrawer;
window.closeWishlistDrawer = closeWishlistDrawer;
window.closeAllDrawersAndModals = closeAllDrawersAndModals;
window.showToast = showToast;


/* ------------------- UTILITIES ------------------- */
function closeAllDrawersAndModals() {
  closeCartDrawer();
  closeWishlistDrawer();
  closeQuickView();
  closeSearchModal();
  closeMobileNav();
  if (typeof closeMobileFilterDrawer === 'function') {
    closeMobileFilterDrawer();
  }
}

function isAnyOtherModalOpen() {
  const cartDrawer = document.getElementById('cartDrawer');
  const wishlistDrawer = document.getElementById('wishlistDrawer');
  const quick = document.getElementById('quickViewModal');
  const search = document.getElementById('searchModal');
  return (cartDrawer && cartDrawer.classList.contains('open')) ||
         (wishlistDrawer && wishlistDrawer.classList.contains('open')) ||
         (quick && quick.classList.contains('open')) ||
         (search && search.classList.contains('open'));
}

/* ------------------- FOOTER HANDLERS ------------------- */
function handleFooterNewsletter(e) {
  if (e) e.preventDefault();
  const form = e ? e.target : document.querySelector('.footer-newsletter-form');
  if (!form) return;
  const input = form.querySelector('.footer-newsletter-input');
  const status = document.getElementById('newsletterStatus') || form.querySelector('.footer-newsletter-status');
  if (!input || !input.value) return;

  const email = input.value.trim();
  if (!email.includes('@')) {
    if (status) {
      status.textContent = 'Please enter a valid email address.';
      status.style.color = '#E57373';
    }
    return;
  }

  input.value = '';
  if (status) {
    status.innerHTML = '✦ Thank you for subscribing to The Lumière Edit.';
    status.style.color = 'var(--color-gold)';
    setTimeout(() => {
      status.innerHTML = '';
    }, 5000);
  }
  if (typeof showToast === 'function') {
    showToast('<span class="toast-icon">✦</span> Welcome to The Lumière Edit');
  }
}

function toggleFooterAccordion(button) {
  if (window.innerWidth > 820) return;
  const content = button.nextElementSibling;
  if (!content) return;
  const isOpen = content.classList.toggle('open');
  button.classList.toggle('active', isOpen);
  button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  const icon = button.querySelector('.accordion-icon');
  if (icon) icon.textContent = isOpen ? '−' : '+';
}

/* ------------------- 13. CONTINUOUS AUTO-SLIDING 15-REVIEW MARQUEE (CIRCULAR CARDS) ------------------- */
const LUMIERE_TESTIMONIALS_15 = [
  {
    id: 1,
    clientImg: "images/clients/client1.jpg",
    customerName: "Camille Laurent",
    city: "PARIS",
    rating: "★★★★★",
    quote: "Unbelievable glass-skin luminosity without feeling heavy. My daily holy grail."
  },
  {
    id: 2,
    clientImg: "images/clients/client2.jpg",
    customerName: "Sophia Sterling",
    city: "NEW YORK",
    rating: "★★★★★",
    quote: "Warm, captivating, and truly evocative of romantic evening strolls across Paris."
  },
  {
    id: 3,
    clientImg: "images/clients/client3.jpg",
    customerName: "Elena Rostova",
    city: "MILAN",
    rating: "★★★★★",
    quote: "Completely transformed heat-damaged hair into smooth, fragrant silk perfection."
  },
  {
    id: 4,
    clientImg: "images/clients/client4.jpg",
    customerName: "Amélie Dubois",
    city: "LYON",
    rating: "★★★★★",
    quote: "Glides on like pure cashmere with saturated color from morning to evening gala."
  },
  {
    id: 5,
    clientImg: "images/clients/client5.jpg",
    customerName: "Isabella Rossi",
    city: "ROME",
    rating: "★★★★★",
    quote: "My skin feels sculpted, buoyant, and deeply renewed every single morning."
  },
  {
    id: 6,
    clientImg: "images/clients/client6.jpg",
    customerName: "Charlotte Windsor",
    city: "LONDON",
    rating: "★★★★★",
    quote: "Pure mystery in a bottle. Sensual dark jasmine that lingers for hours."
  },
  {
    id: 7,
    clientImg: "images/clients/client7.jpg",
    customerName: "Genevieve Vance",
    city: "GENEVA",
    rating: "★★★★★",
    quote: "Erased weeks of travel fatigue overnight. Plump, cushiony, radiant skin."
  },
  {
    id: 8,
    clientImg: "images/clients/client8.jpg",
    customerName: "Margaux Fontaine",
    city: "BORDEAUX",
    rating: "★★★★★",
    quote: "An ethereal champagne halo on cheekbones. Seamless candlelit elegance."
  },
  {
    id: 9,
    clientImg: "images/clients/client9.jpg",
    customerName: "Sora Takahashi",
    city: "TOKYO",
    rating: "★★★★★",
    quote: "Melts makeup effortlessly, leaving dry skin cushioned and satin soft."
  },
  {
    id: 10,
    clientImg: "images/clients/client10.jpg",
    customerName: "Aurelia Santos",
    city: "MADRID",
    rating: "★★★★★",
    quote: "The most authentic Bulgarian rose fragrance. Airy, fresh, and feminine."
  },
  {
    id: 11,
    clientImg: "images/clients/client11.jpg",
    customerName: "Victoria Lindqvist",
    city: "STOCKHOLM",
    rating: "★★★★★",
    quote: "Repaired my winter skin barrier in three nights. Weightless liquid glow."
  },
  {
    id: 12,
    clientImg: "images/clients/client12.jpg",
    customerName: "Delphine Mercier",
    city: "NICE",
    rating: "★★★★★",
    quote: "Completely undetectable in direct sunlight. Like flawless Parisian genetics."
  },
  {
    id: 13,
    clientImg: "images/clients/client13.jpg",
    customerName: "Clara Von Berg",
    city: "VIENNA",
    rating: "★★★★★",
    quote: "The ultimate sun-kissed Riviera vacation tint. Liquid silk on skin."
  },
  {
    id: 14,
    clientImg: "images/clients/client14.jpg",
    customerName: "Nadège Rousseau",
    city: "MONACO",
    rating: "★★★★★",
    quote: "Restored firmness along cheekbones and temples. Real clinical luxury."
  },
  {
    id: 15,
    clientImg: "images/clients/client15.jpg",
    customerName: "Hélène Marchand",
    city: "CANNES",
    rating: "★★★★★",
    quote: "My vanity staple. An ultra-fine botanical cloud that revives tired skin."
  }
];

let marqueeTranslateX = 0;
let marqueeSpeed = 38; // Constant smooth linear speed
let marqueeHalfTrackWidth = 0;
let marqueeSingleCardWidth = 284; // Card (260px) + gap (24px)
let isMarqueeHovered = false;
let isMarqueePausedManual = false;
let isMarqueeDragging = false;
let marqueeDragStartX = 0;
let marqueeDragStartTranslate = 0;
let marqueeResumeTimer = null;
let marqueeLastFrameTime = null;
let marqueeAnimFrameId = null;

function renderTestimonialCardsMarkup(review, isClone = false) {
  return `
    <article class="test-marquee-card test-showcase-item" data-review-id="${review.id}" aria-label="Review by ${review.customerName}">
      <div class="test-showcase-frame">
        <div class="test-showcase-inner">
          <img src="${review.clientImg}" alt="${review.customerName}" class="test-showcase-img" loading="lazy" onerror="this.src='images/model_portrait_1788328392448.jpg'" />
          <div class="test-showcase-sheen" aria-hidden="true"></div>
        </div>
      </div>
      <div class="test-showcase-details">
        <h3 class="test-showcase-name">${review.customerName}</h3>
        <div class="test-showcase-stars" aria-label="${review.rating}">${review.rating}</div>
        <blockquote class="test-showcase-quote">
          "${review.quote}"
        </blockquote>
        <span class="test-showcase-city">✦ ${review.city}</span>
      </div>
    </article>
  `;
}

function updateMarqueeCounter() {
  const counter = document.getElementById('testCurrentIndex');
  if (!counter || marqueeSingleCardWidth <= 0) return;
  const normalized = Math.abs(marqueeTranslateX) % (marqueeHalfTrackWidth || 1);
  const activeIdx = (Math.round(normalized / marqueeSingleCardWidth) % 15) + 1;
  counter.textContent = activeIdx < 10 ? `0${activeIdx}` : `${activeIdx}`;
}

function marqueeAnimationLoop(now) {
  if (!marqueeLastFrameTime) marqueeLastFrameTime = now;
  const dt = Math.min((now - marqueeLastFrameTime) / 1000, 0.1);
  marqueeLastFrameTime = now;

  const track = document.getElementById('testMarqueeTrack');
  if (track && marqueeHalfTrackWidth > 0) {
    if (!isMarqueeHovered && !isMarqueePausedManual && !isMarqueeDragging) {
      marqueeTranslateX -= marqueeSpeed * dt;

      // Infinite loop: seamless reset to exact pixel position when first 15 pass
      if (marqueeTranslateX <= -marqueeHalfTrackWidth) {
        marqueeTranslateX += marqueeHalfTrackWidth;
      } else if (marqueeTranslateX > 0) {
        marqueeTranslateX -= marqueeHalfTrackWidth;
      }

      track.style.transform = `translate3d(${marqueeTranslateX}px, 0, 0)`;
      updateMarqueeCounter();
    }
  }

  marqueeAnimFrameId = requestAnimationFrame(marqueeAnimationLoop);
}

function recalculateMarqueeDimensions() {
  const track = document.getElementById('testMarqueeTrack');
  if (!track) return;
  const cards = track.querySelectorAll('.test-marquee-card');
  if (cards.length >= 30) {
    // Card 15 offset minus Card 0 offset gives exact width of the original 15 items
    const dist = cards[15].offsetLeft - cards[0].offsetLeft;
    if (dist > 0) {
      marqueeHalfTrackWidth = dist;
      marqueeSingleCardWidth = dist / 15;
    }
  }
}

function toggleMarqueeAuto() {
  isMarqueePausedManual = !isMarqueePausedManual;
  const btn = document.getElementById('testToggleAutoBtn');
  const label = document.getElementById('testToggleLabel');

  if (btn) btn.classList.toggle('is-paused', isMarqueePausedManual);
  if (label) label.textContent = isMarqueePausedManual ? 'PAUSED' : 'AUTO';
}

function marqueeStep(direction) {
  const track = document.getElementById('testMarqueeTrack');
  if (!track || marqueeHalfTrackWidth <= 0) return;

  // Temporarily pause auto motion during and after manual step
  isMarqueeDragging = true;
  clearTimeout(marqueeResumeTimer);

  // Direction: -1 for previous (move right), 1 for next (move left)
  const offset = -direction * marqueeSingleCardWidth;
  marqueeTranslateX += offset;

  // Normalize
  while (marqueeTranslateX <= -marqueeHalfTrackWidth) marqueeTranslateX += marqueeHalfTrackWidth;
  while (marqueeTranslateX > 0) marqueeTranslateX -= marqueeHalfTrackWidth;

  track.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
  track.style.transform = `translate3d(${marqueeTranslateX}px, 0, 0)`;
  updateMarqueeCounter();

  setTimeout(() => {
    track.style.transition = 'none';
  }, 460);

  // Resume auto motion after 2 seconds (Requirement: resume after ~2 seconds)
  marqueeResumeTimer = setTimeout(() => {
    isMarqueeDragging = false;
  }, 2000);
}

function initEditorialTestimonials() {
  const section = document.getElementById('testimonialsSection');
  const wrapper = document.getElementById('testMarqueeWrapper');
  const track = document.getElementById('testMarqueeTrack');
  if (!section || !wrapper || !track) return;

  // Render exactly 15 reviews + 15 cloned reviews (Requirement: 15 + 15 for infinite loop)
  const originalHtml = LUMIERE_TESTIMONIALS_15.map(rev => renderTestimonialCardsMarkup(rev, false)).join('');
  const clonedHtml = LUMIERE_TESTIMONIALS_15.map(rev => renderTestimonialCardsMarkup(rev, true)).join('');
  track.innerHTML = originalHtml + clonedHtml;

  // Calculate dimensions
  recalculateMarqueeDimensions();
  window.addEventListener('resize', recalculateMarqueeDimensions);

  // Hover interaction: PAUSE on hover, RESUME on leave from exact position
  wrapper.addEventListener('mouseenter', () => {
    isMarqueeHovered = true;
  });

  wrapper.addEventListener('mouseleave', () => {
    isMarqueeHovered = false;
  });

  // Touch & Drag Handling
  let touchStartX = 0;
  let isTouching = false;

  wrapper.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      touchStartX = e.touches[0].clientX;
      marqueeDragStartTranslate = marqueeTranslateX;
      isTouching = true;
      isMarqueeDragging = true;
      track.style.transition = 'none';
      clearTimeout(marqueeResumeTimer);
    }
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    if (!isTouching || !e.touches || !e.touches[0]) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartX;
    marqueeTranslateX = marqueeDragStartTranslate + deltaX;

    if (marqueeHalfTrackWidth > 0) {
      while (marqueeTranslateX <= -marqueeHalfTrackWidth) marqueeTranslateX += marqueeHalfTrackWidth;
      while (marqueeTranslateX > 0) marqueeTranslateX -= marqueeHalfTrackWidth;
    }

    track.style.transform = `translate3d(${marqueeTranslateX}px, 0, 0)`;
    updateMarqueeCounter();
  }, { passive: true });

  wrapper.addEventListener('touchend', () => {
    if (!isTouching) return;
    isTouching = false;
    // Resume auto-sliding after 2 seconds (Requirement: resume after ~2 seconds)
    clearTimeout(marqueeResumeTimer);
    marqueeResumeTimer = setTimeout(() => {
      isMarqueeDragging = false;
    }, 2000);
  }, { passive: true });

  // Mouse Drag Support
  let isMouseDown = false;
  wrapper.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    isMarqueeDragging = true;
    marqueeDragStartX = e.clientX;
    marqueeDragStartTranslate = marqueeTranslateX;
    track.style.transition = 'none';
    clearTimeout(marqueeResumeTimer);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    const deltaX = e.clientX - marqueeDragStartX;
    marqueeTranslateX = marqueeDragStartTranslate + deltaX;

    if (marqueeHalfTrackWidth > 0) {
      while (marqueeTranslateX <= -marqueeHalfTrackWidth) marqueeTranslateX += marqueeHalfTrackWidth;
      while (marqueeTranslateX > 0) marqueeTranslateX -= marqueeHalfTrackWidth;
    }

    track.style.transform = `translate3d(${marqueeTranslateX}px, 0, 0)`;
    updateMarqueeCounter();
  });

  window.addEventListener('mouseup', () => {
    if (!isMouseDown) return;
    isMouseDown = false;
    clearTimeout(marqueeResumeTimer);
    marqueeResumeTimer = setTimeout(() => {
      isMarqueeDragging = false;
    }, 2000);
  });

  // Respect Accessibility prefers-reduced-motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isMarqueePausedManual = true;
    const btn = document.getElementById('testToggleAutoBtn');
    const label = document.getElementById('testToggleLabel');
    if (btn) btn.classList.add('is-paused');
    if (label) label.textContent = 'PAUSED';
  }

  // Scroll entrance animation (600–700ms)
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          section.classList.add('is-revealed');
          revealObserver.unobserve(section);
        }
      });
    }, { threshold: 0.12 });
    revealObserver.observe(section);
  } else {
    section.classList.add('is-revealed');
  }

  // Start continuous linear animation loop
  if (marqueeAnimFrameId) cancelAnimationFrame(marqueeAnimFrameId);
  marqueeAnimFrameId = requestAnimationFrame(marqueeAnimationLoop);
}

/* ------------------- EDITORIAL CONCIERGE & BESPOKE BEAUTY ------------------- */
function initEditorialConciergeAnimation() {
  const conciergeSec = document.getElementById('conciergeSection');
  if (conciergeSec) {
    // 3D Perspective Tilt on Desktop Hover for Haute Atelier Wings
    const wingSurfaces = conciergeSec.querySelectorAll('.salon-wing-surface');
    wingSurfaces.forEach(card => {
      let isHovered = false;
      card.addEventListener('mouseenter', () => { isHovered = true; });
      card.addEventListener('mousemove', (e) => {
        if (!isHovered || window.innerWidth < 1024) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        card.style.transform = '';
      });
    });
  }

  // Initialize Salon Date default to tomorrow
  const dateInput = document.getElementById('salonDate');
  if (dateInput && !dateInput.value) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    dateInput.min = dateStr;
    dateInput.value = dateStr;
  }

  const revealItems = document.querySelectorAll('.concierge-reveal-item');
  if (!revealItems.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const item = entry.target;
          const delay = parseInt(item.dataset.delay || '0', 10);
          setTimeout(() => {
            item.classList.add('is-revealed');
          }, delay);
          obs.unobserve(item);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-revealed'));
  }
}

function toggleConciergeDrawer(type) {
  const noteDrawer = document.getElementById('conciergeDrawerNote');
  const consultationDrawer = document.getElementById('conciergeDrawerConsultation');

  if (type === 'note') {
    if (consultationDrawer) consultationDrawer.classList.remove('is-open');
    if (noteDrawer) {
      const isOpen = noteDrawer.classList.toggle('is-open');
      if (isOpen) {
        const input = document.getElementById('conciergeNoteEmail');
        if (input) setTimeout(() => input.focus(), 150);
      }
    }
  } else if (type === 'consultation') {
    if (noteDrawer) noteDrawer.classList.remove('is-open');
    if (consultationDrawer) {
      const isOpen = consultationDrawer.classList.toggle('is-open');
      if (isOpen) {
        const input = document.getElementById('consultationName');
        if (input) setTimeout(() => input.focus(), 150);
      }
    }
  }
}

function handleConciergeNoteSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('conciergeNoteEmail');
  const text = document.getElementById('conciergeNoteText');
  const drawer = document.getElementById('conciergeDrawerNote');

  if (email && email.value) {
    showToast('✦ Note delivered to our Paris atelier. An advisor will respond privately.');
    email.value = '';
    if (text) text.value = '';
    if (drawer) drawer.classList.remove('is-open');
  }
}

function selectFocusChip(btn, topic) {
  const container = document.getElementById('salonFocusChips');
  const input = document.getElementById('salonNotes');
  const wasActive = btn && btn.classList.contains('active');

  if (container) {
    container.querySelectorAll('.focus-chip').forEach(c => c.classList.remove('active'));
  }

  if (wasActive) {
    if (input) input.value = '';
  } else {
    if (btn) btn.classList.add('active');
    if (input) input.value = topic;
  }
}

function closeBookingConfirm() {
  const banner = document.getElementById('salonBookingConfirmBanner');
  if (banner) banner.style.display = 'none';
  const form = document.getElementById('salonConsultationForm');
  if (form) form.style.display = 'flex';
}

function handleSalonConsultationSubmit(e) {
  e.preventDefault();
  const nameEl = document.getElementById('salonFullName');
  const emailEl = document.getElementById('salonEmail');
  const serviceEl = document.getElementById('salonService');
  const dateEl = document.getElementById('salonDate');
  const timeEl = document.getElementById('salonTime');
  const notesEl = document.getElementById('salonNotes');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (!nameEl || !nameEl.value || !emailEl || !emailEl.value) {
    showToast('✦ Please provide your full name and email address.');
    return;
  }

  const fullName = nameEl.value.trim();
  const emailVal = emailEl.value.trim();
  const serviceVal = serviceEl ? serviceEl.value : 'Virtual Video Atelier (45 min)';
  const dateVal = dateEl && dateEl.value ? dateEl.value : 'Next Available Session';
  const timeVal = timeEl ? timeEl.value : 'Afternoon Salon (2:00 PM – 5:00 PM)';
  const notesVal = notesEl && notesEl.value ? notesEl.value.trim() : 'Bespoke Hydration & Barrier Ritual';
  const targetEmail = 'piyushverma730929@gmail.com';

  // Visual button pending state
  const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn-sparkle-star">✦</span><span>ROUTING TO CONCIERGE...</span>';
  }

  // 1. Prepare Pre-composed Mailto Link for Direct Native/Webmail Client
  const mailtoSubject = encodeURIComponent(`✦ Private Atelier Consultation Request: ${fullName} (${dateVal})`);
  const mailtoBody = encodeURIComponent(
`Dear Atelier Concierge,

A new private consultation request has been submitted with the following details:

✦ CLIENT DETAILS:
• Full Name: ${fullName}
• Email: ${emailVal}

✦ APPOINTMENT SCHEDULE:
• Preferred Date: ${dateVal}
• Time Window: ${timeVal}

✦ CONSULTATION SPECIFICATIONS:
• Format: ${serviceVal}
• Desired Ritual Focus: ${notesVal}

✦ ATELIER RECIPIENT:
• ${targetEmail}

Sent via Lumière Atelier Privé Booking System at ${new Date().toLocaleString()}`
  );
  const mailtoUrl = `mailto:${targetEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  // 2. Automated Direct Email Send via FormSubmit AJAX to piyushverma730929@gmail.com
  const emailPayload = {
    _subject: `✦ New Lumière Consultation: ${fullName} · ${dateVal}`,
    _template: 'table',
    "Client Full Name": fullName,
    "Client Email": emailVal,
    "Preferred Date": dateVal,
    "Time Window": timeVal,
    "Consultation Format": serviceVal,
    "Desired Ritual Focus": notesVal,
    "Atelier Concierge Email": targetEmail,
    "Dispatched At": new Date().toLocaleString()
  };

  fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(emailPayload)
  })
  .then(res => res.json())
  .then(data => {
    console.log('[Atelier Email Routing] FormSubmit confirmed:', data);
  })
  .catch(err => {
    console.warn('[Atelier Email Routing] FormSubmit network notice:', err);
  });

  // 3. Send to local Express backend API (port 5000) with Nodemailer SMTP dispatch
  const apiEndpoint = window.location.port === '5000' ? '/api/inquiries' : 'http://localhost:5000/api/inquiries';
  fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientName: fullName,
      clientEmail: emailVal,
      date: dateVal,
      time: timeVal,
      service: serviceVal,
      notes: notesVal
    })
  })
  .then(res => res.json())
  .then(data => console.log('[Lumière Backend] Email dispatched via Gmail SMTP:', data))
  .catch(err => console.log('[Lumière Backend Notice]', err.message));

  // 4. Update UI: Show Success Toast and Reveal Confirmation Banner
  setTimeout(() => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }

    // Show Confirmation Banner
    const banner = document.getElementById('salonBookingConfirmBanner');
    const msgText = document.getElementById('confirmMsgText');
    const mailBtn = document.getElementById('confirmMailtoBtn');

    if (msgText) {
      msgText.innerHTML = `Your consultation request for <strong>${serviceVal}</strong> on <strong>${dateVal}</strong> has been routed to <strong>${targetEmail}</strong>. A copy is logged and our master aesthetician will confirm within 2 hours.`;
    }
    if (mailBtn) {
      mailBtn.href = mailtoUrl;
    }
    if (banner) {
      banner.style.display = 'block';
    }

    showToast(`✦ Inquiry routed to atelier email: ${targetEmail}`);

    // Reset Form Fields
    nameEl.value = '';
    emailEl.value = '';
    if (dateEl) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateEl.value = tomorrow.toISOString().split('T')[0];
    }
    if (notesEl) notesEl.value = '';
    const chips = document.getElementById('salonFocusChips');
    if (chips) {
      chips.querySelectorAll('.focus-chip').forEach(c => c.classList.remove('active'));
    }
  }, 450);
}

function handleConciergeConsultationSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('consultationName');
  const email = document.getElementById('consultationEmail');
  const drawer = document.getElementById('conciergeDrawerConsultation');

  if (name && name.value && email && email.value) {
    showToast('✦ Consultation requested. Our atelier concierge will confirm your appointment.');
    name.value = '';
    email.value = '';
    if (drawer) drawer.classList.remove('is-open');
  }
}

// Backwards compatibility for previous quick contact triggers
function toggleQuickContactForm() {
  toggleConciergeDrawer('note');
}

function handleQuickContactSubmit(e) {
  handleConciergeNoteSubmit(e);
}

/* ------------------- FEATURED GLOW PARALLAX ------------------- */
function initFeaturedGlowParallax() {
  const section = document.getElementById('featuredGlowSection');
  const viewport = document.getElementById('glowSliderViewport');
  if (!section || !viewport) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const winHeight = window.innerHeight;
        if (rect.top < winHeight && rect.bottom > 0) {
          const progress = (winHeight - rect.top) / (winHeight + rect.height);
          const moveY = (progress - 0.5) * 35;
          viewport.style.transform = `scale(1.04) translateY(${moveY}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ------------------- FEATURED GLOW VERTICAL AUTO-SCROLL (FAST BOTTOM-TO-TOP TRACK) ------------------- */
function initFeaturedGlowAutoScroll() {
  const track = document.getElementById('glowSliderTrack');
  const indicators = document.querySelectorAll('.glow-indicator-dash');
  if (!track) return;

  // Prevent multiple initializations
  if (track.dataset.glowScrollInitialized === 'true') return;
  track.dataset.glowScrollInitialized = 'true';

  const totalUniqueSlides = 5;
  let currentIndex = 0;
  let intervalId = null;

  function updateIndicators(index) {
    const realIndex = index % totalUniqueSlides;
    indicators.forEach((ind, idx) => {
      ind.classList.toggle('is-active', idx === realIndex);
    });
  }

  function moveToSlide(index, animated = true) {
    if (animated) {
      track.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
    } else {
      track.style.transition = 'none';
    }
    track.style.transform = `translateY(-${index * 100}%)`;
    currentIndex = index;
    updateIndicators(currentIndex);
  }

  function advanceSlide() {
    if (currentIndex >= totalUniqueSlides) {
      // Seamless jump back to 0 without animation
      moveToSlide(0, false);
      void track.offsetHeight; // Force reflow
    }

    currentIndex++;
    moveToSlide(currentIndex, true);

    // If we just slid to the clone (slide 5), reset silently after transition finishes
    if (currentIndex === totalUniqueSlides) {
      setTimeout(() => {
        moveToSlide(0, false);
      }, 460);
    }
  }

  function start() {
    stop();
    intervalId = setInterval(advanceSlide, 1000); // 1-second brisk auto-scroll
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  // Clickable dash indicators
  indicators.forEach(ind => {
    ind.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = parseInt(ind.getAttribute('data-slide-to'), 10);
      if (!isNaN(target)) {
        moveToSlide(target, true);
        start();
      }
    });
  });

  // Start fast auto-scroll
  start();
}

/* ------------------- TRUST MARQUEE INTERACTION ------------------- */
function initTrustMarquee() {
  const strip = document.getElementById('trustMarqueeStrip');
  const track = document.getElementById('trustMarqueeTrack');
  if (!strip || !track) return;

  // Touch interaction support on mobile without breaking infinite loop
  let isTouching = false;
  strip.addEventListener('touchstart', () => {
    isTouching = true;
    track.classList.add('is-paused');
  }, { passive: true });

  const resume = () => {
    if (isTouching) {
      isTouching = false;
      track.classList.remove('is-paused');
    }
  };

  strip.addEventListener('touchend', resume, { passive: true });
  strip.addEventListener('touchcancel', resume, { passive: true });
}

/* ------------------- MASTER INITIALIZATION ------------------- */
function initAll() {
  initHeroEntrance();
  initNavbarScroll();
  initTrustMarquee();
  initMetricsCounter();
  initProductCarousels();
  initStandardScroll();
  initCartAndWishlist();
  initQuickViewModal();
  initSearchModal();
  initNewsletter();
  initMobileNav();
  initEditorialTestimonials();
  initEditorialConciergeAnimation();
  initFeaturedGlowParallax();
  initFeaturedGlowAutoScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

