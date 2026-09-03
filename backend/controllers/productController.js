/**
 * Product Controller
 * Handles product listing, filtering, and retrieval
 */
const PRODUCTS = [
  { id:1, name:'Radiance Glow Serum', category:'skincare', categoryLabel:'Skincare', desc:'Vitamin C & hyaluronic acid blend for glass-skin luminosity', price:128, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:2, name:'Velvet Lip Collection', category:'makeup', categoryLabel:'Makeup', desc:'Richly pigmented matte lipstick with 12-hour lasting power', price:58, oldPrice:78, badge:'Sale', badgeType:'sale', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:3, name:"Noir d'Or Eau de Parfum", category:'fragrance', categoryLabel:'Fragrance', desc:'Warm oud, amber & vanilla — your signature evening scent', price:215, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:4, name:'Restorative Night Cream', category:'skincare', categoryLabel:'Skincare', desc:'Peptide-rich overnight treatment for plump, rested skin', price:96, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:5, name:'Pro Eyeshadow Palette', category:'makeup', categoryLabel:'Makeup', desc:'12 jewel-toned shades from satin to ultra-metallic', price:82, oldPrice:110, badge:'Sale', badgeType:'sale', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:6, name:'Rose Bloom Eau de Toilette', category:'fragrance', categoryLabel:'Fragrance', desc:'Fresh Bulgarian rose, peony & white musk — a daylight dream', price:165, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/perfume_collection_1788328378783.jpg' },
  { id:7, name:'Rosehip Facial Oil', category:'skincare', categoryLabel:'Skincare', desc:'Cold-pressed rosehip & squalane for deep nourishment', price:74, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:8, name:'Gold Highlighter', category:'makeup', categoryLabel:'Makeup', desc:'Ultra-fine champagne gold pigment for ethereal glow', price:46, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:9, name:'Hyaluronic Plump Mist', category:'skincare', categoryLabel:'Skincare', desc:'Instant hydration burst with ceramides & aloe vera', price:55, oldPrice:null, badge:'New', badgeType:'new', stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:10, name:'Velvet Bronzing Drops', category:'makeup', categoryLabel:'Makeup', desc:'Buildable liquid bronze with a natural sun-kissed finish', price:64, oldPrice:80, badge:'Sale', badgeType:'sale', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:11, name:'Jasmin Noir Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Deep jasmine, black orchid & sandalwood mystery', price:195, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:12, name:'Peptide Eye Complex', category:'skincare', categoryLabel:'Skincare', desc:'Targets dark circles, puffiness & fine lines', price:88, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/skincare_products_1788328338930.jpg' },
  // Skincare Expansions (IDs 13 - 27)
  { id:13, name:'Crème de Rose Hydrating Soufflé', category:'skincare', categoryLabel:'Skincare', desc:'Whipped cloud cream infused with Alpine rose stem cells & micro-hyaluronic spheres', price:112, oldPrice:135, badge:'Sale', badgeType:'sale', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:14, name:"L'Élixir Caviar Day Emulsion", category:'skincare', categoryLabel:'Skincare', desc:'Precious caviar extract & gold peptides for cellular firming and contour lift', price:175, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:15, name:'Liquid Silk Peptide Cleanser', category:'skincare', categoryLabel:'Skincare', desc:'Gentle pH-balanced milky gel cleanser with amino acids & calming chamomile', price:54, oldPrice:null, badge:'Clean Beauty', badgeType:'new', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:16, name:'Celestial Niacinamide Clarifying Tonic', category:'skincare', categoryLabel:'Skincare', desc:'10% purified niacinamide & zinc PCA that refines enlarged pores and balances sebum', price:62, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:17, name:'Bakuchiol Botanical Renewal Serum', category:'skincare', categoryLabel:'Skincare', desc:'Clean plant-based retinol alternative for smoothing fine lines without irritation', price:98, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:18, name:'Aura Glow Micro-Exfoliating Polish', category:'skincare', categoryLabel:'Skincare', desc:'Fine quartz crystals & lactic acid gently dissolve dull surface cells for mirror radiance', price:68, oldPrice:85, badge:'Sale', badgeType:'sale', stars:4, img:'images/editorial_flatlay.jpg' },
  { id:19, name:'Pure Camellia Cleansing Balm', category:'skincare', categoryLabel:'Skincare', desc:'Velvety balm that melts away waterproof makeup while nourishing with Japanese camellia oil', price:65, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:20, name:'Squalane Barrier Defence Cream', category:'skincare', categoryLabel:'Skincare', desc:'Biomimetic ceramide complex that seals lipid barrier against environmental pollution', price:86, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:21, name:'Lotus Flower Brightening Essence', category:'skincare', categoryLabel:'Skincare', desc:'Water-light fermented essence with sacred lotus & licorice root to fade dark spots', price:82, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:22, name:'Firming Copper Peptide Ampoules', category:'skincare', categoryLabel:'Skincare', desc:'7-day intensive treatment course of GHK-Cu copper tripeptides for collagen renewal', price:145, oldPrice:null, badge:'Limited', badgeType:'best', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:23, name:'Illuminating C-Ester Eye Serum', category:'skincare', categoryLabel:'Skincare', desc:'Targeted cooling ceramic wand delivering lipid-soluble Vitamin C to under-eye darkness', price:76, oldPrice:92, badge:'Sale', badgeType:'sale', stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:24, name:'Overnight Hyaluronic Sleep Mask', category:'skincare', categoryLabel:'Skincare', desc:'Memory-gel sleeping mask that floods the dermis with deep hydration while resting', price:72, oldPrice:null, badge:null, badgeType:null, stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:25, name:'Mineral Silk Broad Spectrum SPF 50', category:'skincare', categoryLabel:'Skincare', desc:'100% invisible zinc mineral sunscreen with a luminous, non-greasy satin veil finish', price:58, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:26, name:'Centella Calming Recovery Gel', category:'skincare', categoryLabel:'Skincare', desc:'Concentrated cica & madecassoside to rapidly soothe irritation, redness & sensitivity', price:64, oldPrice:null, badge:'Clean Beauty', badgeType:'new', stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:27, name:'Imperial Rose Gold Facial Mist', category:'skincare', categoryLabel:'Skincare', desc:'Distilled Grasse rosewater with micronized 24k gold flakes for instant radiant refresh', price:48, oldPrice:null, badge:null, badgeType:null, stars:5, img:'images/editorial_flatlay.jpg' },
  // Makeup Expansions (IDs 28 - 41)
  { id:28, name:'Lumière Silk Fluid Foundation', category:'makeup', categoryLabel:'Makeup', desc:'Second-skin weightless foundation with buildable coverage & natural luminous finish', price:78, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:29, name:'Radiant Concealer Wand', category:'makeup', categoryLabel:'Makeup', desc:'Creaseless hydrating concealer enriched with caffeine and hyaluronic acid', price:42, oldPrice:null, badge:null, badgeType:null, stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:30, name:'Velvet Bloom Liquid Blush', category:'makeup', categoryLabel:'Makeup', desc:'Pillow-soft liquid blush that melts effortlessly into a dewy, flushed pinch of color', price:38, oldPrice:48, badge:'Sale', badgeType:'sale', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:31, name:'Le Smoky Kohl Eyeliner Gel', category:'makeup', categoryLabel:'Makeup', desc:'Ultra-pigmented waterproof gel pencil that blends seamlessly into editorial smoky eyes', price:32, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/makeup_products_1788328354838.jpg' },
  { id:32, name:'Grand Volume Panoramic Mascara', category:'makeup', categoryLabel:'Makeup', desc:'Curved hourglass wand delivers feathery, multiplied lashes with carbon-black drama', price:40, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:33, name:'Gilded Micro-Fine Brow Sculptor', category:'makeup', categoryLabel:'Makeup', desc:'0.8mm ultra-precision brow pencil for hair-like strokes with clear grooming spoolie', price:34, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/makeup_products_1788328354838.jpg' },
  { id:34, name:'Gloss Lumière Plumping Lip Oil', category:'makeup', categoryLabel:'Makeup', desc:'Non-sticky mirror-shine lip glaze infused with cherry seed oil & volumizing peptides', price:36, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:35, name:'Haute Couture Matte Bronzer', category:'makeup', categoryLabel:'Makeup', desc:'Finely milled sun-baked bronzer with golden undertones for Saint-Tropez warmth', price:56, oldPrice:68, badge:'Sale', badgeType:'sale', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:36, name:'Translucent Silk Setting Powder', category:'makeup', categoryLabel:'Makeup', desc:'Blurring talc-free micro-powder that erases pores, eliminates shine & sets for 16h', price:52, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:37, name:'Chromatique Duochrome Eyeshadow Pot', category:'makeup', categoryLabel:'Makeup', desc:'Prismatic foil pigment shifting between molten copper, gold, and antique rose', price:38, oldPrice:null, badge:'Limited', badgeType:'new', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:38, name:'Precision Lip Definer Pencil', category:'makeup', categoryLabel:'Makeup', desc:'Creamy contouring lip liner with stay-put pigment preventing lipstick bleeding', price:28, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/makeup_products_1788328354838.jpg' },
  { id:39, name:'Illuminating Prep & Set Mist', category:'makeup', categoryLabel:'Makeup', desc:'Dual-phase setting elixir with niacinamide and light-refracting pearls for all-day wear', price:46, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:40, name:'Sculpting Face Palette Quartet', category:'makeup', categoryLabel:'Makeup', desc:'All-in-one palette featuring contour, warm bronzer, blush duochrome & highlighter', price:88, oldPrice:110, badge:'Sale', badgeType:'sale', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:41, name:'Satin Glaze Lip Stain', category:'makeup', categoryLabel:'Makeup', desc:'Weightless water-based stain blooming into a custom berry flush with zero transfer', price:42, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  // Fragrance Expansions (IDs 42 - 51)
  { id:42, name:'Ambre Impérial Extrait de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'30% concentration extrait with dark benzoin resin, labdanum, vanilla & frankincense', price:260, oldPrice:null, badge:'Limited', badgeType:'best', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:43, name:'Fleur Blanche Eau de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Opulent bouquet of Grasse tuberose, night gardenia, neroli blossom & sandalwood', price:180, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:44, name:'Santal Nuit Eau de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Creamy Mysore sandalwood paired with cardamome, cedarwood smoke & crushed iris', price:195, oldPrice:230, badge:'Sale', badgeType:'sale', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:45, name:'Bergamote Soleil Eau de Toilette', category:'fragrance', categoryLabel:'Fragrance', desc:'Sunlit Calabrian bergamot, green tea leaves, petitgrain & sparkling citrus', price:145, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/perfume_collection_1788328378783.jpg' },
  { id:46, name:'Velvet Oud Extrait de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Smoked Cambodian oud laced with saffron threads, taif rose & dark leather accords', price:275, oldPrice:null, badge:'Iconic', badgeType:'best', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:47, name:'Iris Blanc Hair & Body Mist', category:'fragrance', categoryLabel:'Fragrance', desc:'Alcohol-free hydrating fragrance mist infused with Florentine orris root & white musk', price:68, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:48, name:'Figuier Sauvage Eau de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Sun-drenched fig leaves, green coconut milk, cedar sap & Mediterranean breeze', price:170, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/perfume_collection_1788328378783.jpg' },
  { id:49, name:'Cuir Noir Artisanal Scented Candle', category:'fragrance', categoryLabel:'Fragrance', desc:'Hand-poured soy wax in black ceramic vessel with worn leather, tobacco & amber', price:85, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:50, name:'Parfum Oil Rollerball Discovery Trio', category:'fragrance', categoryLabel:'Fragrance', desc:'Travel trio of pure perfume oil concentrates: Noir d’Or, Fleur Blanche, Santal Nuit', price:95, oldPrice:120, badge:'Sale', badgeType:'sale', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:51, name:'Rose Cashmere Eau de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'French rose absolute warmed by creamy tonka bean, pink peppercorn & cashmere woods', price:185, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  // Hair Care Expansions (IDs 52 - 62)
  { id:52, name:'Aeterna Golden Hair Elixir', category:'haircare', categoryLabel:'Hair Care', desc:'Multi-correctional hair oil with Moroccan argan, night jasmine & 24k gold leaf flakes', price:94, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/haircare_luxury.jpg' },
  { id:53, name:'Celestial Silk Scalp Serum', category:'haircare', categoryLabel:'Hair Care', desc:'Peptide-based follicle densifying serum with fermented rice water & red clover', price:78, oldPrice:95, badge:'Sale', badgeType:'sale', stars:5, img:'images/haircare_luxury.jpg' },
  { id:54, name:'Caviar Repair Rich Hair Masque', category:'haircare', categoryLabel:'Hair Care', desc:'Intensive weekly rebuilding treatment for heat-damaged & color-treated locks', price:86, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/haircare_luxury.jpg' },
  { id:55, name:'Baume Nourrissant Leave-In Conditioner', category:'haircare', categoryLabel:'Hair Care', desc:'Weightless detangling cream with murumuru butter & quinoa protein for mirror shine', price:48, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/haircare_luxury.jpg' },
  { id:56, name:'Thermal Shield Heat Styling Spray', category:'haircare', categoryLabel:'Hair Care', desc:'Heat-activated shield protecting strands up to 450°F with natural silk amino acids', price:42, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/haircare_luxury.jpg' },
  { id:57, name:'French Lavender Clarifying Scalp Scrub', category:'haircare', categoryLabel:'Hair Care', desc:'Dead Sea salt & organic lavender oil scrub to exfoliate buildup and detoxify scalp', price:52, oldPrice:null, badge:'Clean Beauty', badgeType:'new', stars:5, img:'images/haircare_luxury.jpg' },
  { id:58, name:'Hydrating Silk Velvet Shampoo', category:'haircare', categoryLabel:'Hair Care', desc:'Sulfate-free creamy lather enriched with camellia oil that cleanses without stripping', price:46, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/haircare_luxury.jpg' },
  { id:59, name:'Hydrating Silk Velvet Conditioner', category:'haircare', categoryLabel:'Hair Care', desc:'Rich emollient conditioner sealing cuticles for glassy, fluid hair movement', price:48, oldPrice:null, badge:null, badgeType:null, stars:5, img:'images/haircare_luxury.jpg' },
  { id:60, name:'Lumière Shine & Texture Dry Mist', category:'haircare', categoryLabel:'Hair Care', desc:'Invisible volume texturizer with bamboo extract creating lived-in French-girl texture', price:40, oldPrice:50, badge:'Sale', badgeType:'sale', stars:4, img:'images/haircare_luxury.jpg' },
  { id:61, name:'Curls Couture Defining Crème', category:'haircare', categoryLabel:'Hair Care', desc:'Hydra-definition styling balm with cupuaçu butter for defined, frizz-free curls', price:52, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/haircare_luxury.jpg' },
  { id:62, name:'Overnight Keratin Bond Infusion', category:'haircare', categoryLabel:'Hair Care', desc:'Sleep-in bond-building treatment that reconnects broken keratin bonds while resting', price:88, oldPrice:null, badge:'Award Winner', badgeType:'best', stars:5, img:'images/haircare_luxury.jpg' },
];

exports.getProducts = (req, res) => {
  const { category, search, minPrice, maxPrice, sort } = req.query;
  let results = [...PRODUCTS];

  if (category && category !== 'all') {
    results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  }

  if (minPrice) {
    results = results.filter(p => p.price >= parseFloat(minPrice));
  }

  if (maxPrice) {
    results = results.filter(p => p.price <= parseFloat(maxPrice));
  }

  if (sort === 'price-asc') results.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') results.sort((a, b) => b.price - a.price);
  if (sort === 'name-asc') results.sort((a, b) => a.name.localeCompare(b.name));

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
};

exports.getProductById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = PRODUCTS.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ success: false, message: `Product #${id} not found` });
  }

  res.json({ success: true, data: product });
};
