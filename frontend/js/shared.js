/* ============================================================
   LUMIÈRE BEAUTY — Shared JS (shared.js)
   Navbar, Cart, Toast — loaded on every page
   ============================================================ */

/* ---- PRODUCT DATA (global) ---- */
const PRODUCTS = [
  { id:1, name:'Radiance Glow Serum', category:'skincare', categoryLabel:'Skincare', desc:'Potent Vitamin C and hyaluronic acid botanical blend for glass-skin luminosity and enduring radiance.', price:128, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/serum_dropper.jpg' },
  { id:2, name:'Velvet Lip Collection', category:'makeup', categoryLabel:'Makeup', desc:'Richly pigmented velvet matte lipstick infused with botanical oils for 12-hour lasting comfort.', price:58, oldPrice:78, badge:'Sale', badgeType:'sale', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:3, name:"Noir d'Or Eau de Parfum", category:'fragrance', categoryLabel:'Fragrance', desc:'Warm oud, amber, and Madagascar vanilla creating an opulent signature evening scent.', price:215, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:4, name:'Restorative Night Cream', category:'skincare', categoryLabel:'Skincare', desc:'Peptide-rich overnight restorative cream that deeply nourishes for visibly plump, rested skin.', price:96, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:5, name:'Pro Eyeshadow Palette', category:'makeup', categoryLabel:'Makeup', desc:'Artisanal palette of 12 jewel-toned couture shades shifting from buttery satin to molten metallics.', price:82, oldPrice:110, badge:'Sale', badgeType:'sale', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:6, name:'Rose Bloom Eau de Toilette', category:'fragrance', categoryLabel:'Fragrance', desc:'Fresh Bulgarian rose absolute, spring peony, and white musk weaving a romantic daylight dream.', price:165, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/perfume_collection_1788328378783.jpg' },
  { id:7, name:'Rosehip Facial Oil', category:'skincare', categoryLabel:'Skincare', desc:'Cold-pressed organic rosehip seed oil and squalane elixir for deep cellular nourishment and glow.', price:74, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:8, name:'Gold Highlighter', category:'makeup', categoryLabel:'Makeup', desc:'Ultra-fine light-refracting champagne gold mineral pigment delivering an ethereal, lit-from-within glow.', price:46, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:9, name:'Hyaluronic Plump Mist', category:'skincare', categoryLabel:'Skincare', desc:'Instant refreshing hydration veil infused with biomimetic ceramides, organic aloe vera, and rosewater.', price:55, oldPrice:null, badge:'New', badgeType:'new', stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:10, name:'Velvet Bronzing Drops', category:'makeup', categoryLabel:'Makeup', desc:'Weightless buildable liquid bronzing drops imparting a natural, sun-kissed Riviera warmth and dewy radiance.', price:64, oldPrice:80, badge:'Sale', badgeType:'sale', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:11, name:'Jasmin Noir Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Seductive evening extrait of midnight blooming jasmine, black orchid, and smoked Mysore sandalwood.', price:195, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:12, name:'Peptide Eye Complex', category:'skincare', categoryLabel:'Skincare', desc:'Advanced peptide complex that rapidly diminishes dark circles, reduces puffiness, and smooths fine lines.', price:88, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/skincare_products_1788328338930.jpg' },
  // Skincare Expansions (IDs 13 - 27)
  { id:13, name:'Crème de Rose Hydrating Soufflé', category:'skincare', categoryLabel:'Skincare', desc:'Whipped cloud cream infused with Alpine rose stem cells and micro-hyaluronic spheres for deep hydration.', price:112, oldPrice:135, badge:'Sale', badgeType:'sale', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:14, name:"L'Élixir Caviar Day Emulsion", category:'skincare', categoryLabel:'Skincare', desc:'Precious caviar extract and colloidal gold peptides for cellular firming and sculptural facial contouring.', price:175, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:15, name:'Liquid Silk Peptide Cleanser', category:'skincare', categoryLabel:'Skincare', desc:'Gentle pH-balanced milky gel cleanser with biomimetic amino acids and calming blue chamomile.', price:54, oldPrice:null, badge:'Clean Beauty', badgeType:'new', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:16, name:'Celestial Niacinamide Clarifying Tonic', category:'skincare', categoryLabel:'Skincare', desc:'10% purified niacinamide and zinc PCA that refines enlarged pores and balances natural sebum.', price:62, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:17, name:'Bakuchiol Botanical Renewal Serum', category:'skincare', categoryLabel:'Skincare', desc:'Clean plant-based retinol alternative for smoothing fine expression lines without redness or sensitivity.', price:98, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:18, name:'Aura Glow Micro-Exfoliating Polish', category:'skincare', categoryLabel:'Skincare', desc:'Fine quartz crystals and lactic acid gently dissolve dull surface cells for polished mirror radiance.', price:68, oldPrice:85, badge:'Sale', badgeType:'sale', stars:4, img:'images/editorial_flatlay.jpg' },
  { id:19, name:'Pure Camellia Cleansing Balm', category:'skincare', categoryLabel:'Skincare', desc:'Velvety balm that melts away waterproof makeup while deeply nourishing with Japanese camellia oil.', price:65, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:20, name:'Squalane Barrier Defence Cream', category:'skincare', categoryLabel:'Skincare', desc:'Biomimetic ceramide complex that reinforces and seals the lipid barrier against environmental stressors.', price:86, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:21, name:'Lotus Flower Brightening Essence', category:'skincare', categoryLabel:'Skincare', desc:'Water-light fermented botanical essence with sacred lotus and licorice root to fade hyperpigmentation.', price:82, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:22, name:'Firming Copper Peptide Ampoules', category:'skincare', categoryLabel:'Skincare', desc:'7-day intensive treatment ampoules of pure GHK-Cu copper tripeptides for accelerated collagen renewal.', price:145, oldPrice:null, badge:'Limited', badgeType:'best', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:23, name:'Illuminating C-Ester Eye Serum', category:'skincare', categoryLabel:'Skincare', desc:'Targeted cooling ceramic wand delivering lipid-soluble Vitamin C ester to brighten dark under-eyes.', price:76, oldPrice:92, badge:'Sale', badgeType:'sale', stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:24, name:'Overnight Hyaluronic Sleep Mask', category:'skincare', categoryLabel:'Skincare', desc:'Memory-gel sleeping mask that floods the dermis with sustained hydration while you rest peacefully.', price:72, oldPrice:null, badge:null, badgeType:null, stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:25, name:'Mineral Silk Broad Spectrum SPF 50', category:'skincare', categoryLabel:'Skincare', desc:'100% invisible zinc mineral sunscreen providing high-performance broad spectrum defense with a satin finish.', price:58, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:26, name:'Centella Calming Recovery Gel', category:'skincare', categoryLabel:'Skincare', desc:'Concentrated centella asiatica and madecassoside gel to rapidly calm post-procedure redness and irritation.', price:64, oldPrice:null, badge:'Clean Beauty', badgeType:'new', stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:27, name:'Imperial Rose Gold Facial Mist', category:'skincare', categoryLabel:'Skincare', desc:'Distilled Grasse rosewater mist infused with micronized 24k gold flakes for instant radiant revitalization.', price:48, oldPrice:null, badge:null, badgeType:null, stars:5, img:'images/editorial_flatlay.jpg' },
  // Makeup Expansions (IDs 28 - 41)
  { id:28, name:'Lumière Silk Fluid Foundation', category:'makeup', categoryLabel:'Makeup', desc:'Second-skin weightless liquid foundation offering buildable flawless coverage with an authentic luminous glow.', price:78, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:29, name:'Radiant Concealer Wand', category:'makeup', categoryLabel:'Makeup', desc:'Creaseless hydrating serum concealer enriched with caffeine, peptides, and multimolecular hyaluronic acid.', price:42, oldPrice:null, badge:null, badgeType:null, stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:30, name:'Velvet Bloom Liquid Blush', category:'makeup', categoryLabel:'Makeup', desc:'Pillow-soft liquid blush that melts effortlessly into skin for a natural, dewy pinch of petal color.', price:38, oldPrice:48, badge:'Sale', badgeType:'sale', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:31, name:'Le Smoky Kohl Eyeliner Gel', category:'makeup', categoryLabel:'Makeup', desc:'Ultra-pigmented waterproof gel eyeliner pencil that blends seamlessly into effortless editorial smoky eyes.', price:32, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/makeup_products_1788328354838.jpg' },
  { id:32, name:'Grand Volume Panoramic Mascara', category:'makeup', categoryLabel:'Makeup', desc:'Curved hourglass wand delivers feathery, multiplied lashes with rich carbon-black drama and zero clumps.', price:40, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:33, name:'Gilded Micro-Fine Brow Sculptor', category:'makeup', categoryLabel:'Makeup', desc:'0.8mm ultra-precision brow pencil for hair-like strokes paired with a micro-grooming styling spoolie.', price:34, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/makeup_products_1788328354838.jpg' },
  { id:34, name:'Gloss Lumière Plumping Lip Oil', category:'makeup', categoryLabel:'Makeup', desc:'Non-sticky mirror-shine lip glaze infused with sweet cherry seed oil and volumizing phyto-peptides.', price:36, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:35, name:'Haute Couture Matte Bronzer', category:'makeup', categoryLabel:'Makeup', desc:'Finely milled sun-baked bronzing powder with golden undertones for effortless Saint-Tropez warmth.', price:56, oldPrice:68, badge:'Sale', badgeType:'sale', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:36, name:'Translucent Silk Setting Powder', category:'makeup', categoryLabel:'Makeup', desc:'Blurring talc-free setting micro-powder that softens pores, eliminates unwanted shine, and locks makeup for 16 hours.', price:52, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:37, name:'Chromatique Duochrome Eyeshadow Pot', category:'makeup', categoryLabel:'Makeup', desc:'Prismatic foil duochrome pigment shifting between molten copper, antique gold, and desert rose.', price:38, oldPrice:null, badge:'Limited', badgeType:'new', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:38, name:'Precision Lip Definer Pencil', category:'makeup', categoryLabel:'Makeup', desc:'Creamy contouring lip liner pencil formulated with stay-put pigment to define lips and prevent bleeding.', price:28, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/makeup_products_1788328354838.jpg' },
  { id:39, name:'Illuminating Prep & Set Mist', category:'makeup', categoryLabel:'Makeup', desc:'Dual-phase setting elixir with niacinamide and light-refracting pearls for luminous, budge-proof all-day wear.', price:46, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:40, name:'Sculpting Face Palette Quartet', category:'makeup', categoryLabel:'Makeup', desc:'All-in-one couture face palette featuring contour, warm bronzer, luminous duochrome blush, and champagne highlighter.', price:88, oldPrice:110, badge:'Sale', badgeType:'sale', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:41, name:'Satin Glaze Lip Stain', category:'makeup', categoryLabel:'Makeup', desc:'Weightless water-based stain blooming into a bespoke berry flush with comfortable, transfer-proof wear.', price:42, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  // Fragrance Expansions (IDs 42 - 51)
  { id:42, name:'Ambre Impérial Extrait de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'30% concentration extrait de parfum with dark benzoin resin, Spanish labdanum, vanilla, and frankincense.', price:260, oldPrice:null, badge:'Limited', badgeType:'best', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:43, name:'Fleur Blanche Eau de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Opulent bouquet of Grasse tuberose, night gardenia, neroli blossom, and creamy sandalwood base.', price:180, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:44, name:'Santal Nuit Eau de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Creamy Mysore sandalwood paired with Guatemalan cardamome, cedarwood smoke, and crushed Tuscan iris.', price:195, oldPrice:230, badge:'Sale', badgeType:'sale', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:45, name:'Bergamote Soleil Eau de Toilette', category:'fragrance', categoryLabel:'Fragrance', desc:'Sunlit Calabrian bergamot, green tea leaves, bitter petitgrain, and sparkling Mediterranean citrus accords.', price:145, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/perfume_collection_1788328378783.jpg' },
  { id:46, name:'Velvet Oud Extrait de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Smoked Cambodian oud laced with precious saffron threads, taif rose, and dark leather accords.', price:275, oldPrice:null, badge:'Iconic', badgeType:'best', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:47, name:'Iris Blanc Hair & Body Mist', category:'fragrance', categoryLabel:'Fragrance', desc:'Alcohol-free hydrating fragrance mist infused with Florentine orris root butter and crystalline white musk.', price:68, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:48, name:'Figuier Sauvage Eau de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Sun-drenched wild fig leaves, fresh green coconut milk, cedar sap, and warm coastal breeze.', price:170, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/perfume_collection_1788328378783.jpg' },
  { id:49, name:'Cuir Noir Artisanal Scented Candle', category:'fragrance', categoryLabel:'Fragrance', desc:'Hand-poured artisanal soy wax candle in matte black ceramic with worn saddle leather and amber.', price:85, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:50, name:'Parfum Oil Rollerball Discovery Trio', category:'fragrance', categoryLabel:'Fragrance', desc:'Travel discovery trio of pure perfume oil rollerballs featuring Noir d’Or, Fleur Blanche, and Santal Nuit.', price:95, oldPrice:120, badge:'Sale', badgeType:'sale', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:51, name:'Rose Cashmere Eau de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'French rose absolute gently warmed by creamy tonka bean, pink peppercorn, and cashmere woods.', price:185, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  // Hair Care Expansions (IDs 52 - 62)
  { id:52, name:'Aeterna Golden Hair Elixir', category:'haircare', categoryLabel:'Hair Care', desc:'Multi-correctional botanical hair oil with Moroccan argan, night jasmine, and pure 24k gold leaf flakes.', price:94, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/haircare_luxury.jpg' },
  { id:53, name:'Celestial Silk Scalp Serum', category:'haircare', categoryLabel:'Hair Care', desc:'Peptide-based scalp densifying serum infused with fermented rice water and red clover blossom extract.', price:78, oldPrice:95, badge:'Sale', badgeType:'sale', stars:5, img:'images/haircare_luxury.jpg' },
  { id:54, name:'Caviar Repair Rich Hair Masque', category:'haircare', categoryLabel:'Hair Care', desc:'Intensive weekly rebuilding caviar masque that restores vitality to heat-damaged and color-treated strands.', price:86, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/haircare_luxury.jpg' },
  { id:55, name:'Baume Nourrissant Leave-In Conditioner', category:'haircare', categoryLabel:'Hair Care', desc:'Weightless detangling leave-in cream with Amazonian murumuru butter and quinoa protein for mirror shine.', price:48, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/haircare_luxury.jpg' },
  { id:56, name:'Thermal Shield Heat Styling Spray', category:'haircare', categoryLabel:'Hair Care', desc:'Heat-activated thermal shield protecting hair up to 450°F with natural silk amino acids and botanicals.', price:42, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/haircare_luxury.jpg' },
  { id:57, name:'French Lavender Clarifying Scalp Scrub', category:'haircare', categoryLabel:'Hair Care', desc:'Dead Sea salt and organic French lavender oil scrub to purify buildup and revitalize the scalp.', price:52, oldPrice:null, badge:'Clean Beauty', badgeType:'new', stars:5, img:'images/haircare_luxury.jpg' },
  { id:58, name:'Hydrating Silk Velvet Shampoo', category:'haircare', categoryLabel:'Hair Care', desc:'Sulfate-free creamy shampoo enriched with Japanese camellia oil that cleanses without stripping natural moisture.', price:46, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/haircare_luxury.jpg' },
  { id:59, name:'Hydrating Silk Velvet Conditioner', category:'haircare', categoryLabel:'Hair Care', desc:'Rich emollient conditioner sealing cuticle scales for glassy, fluid hair movement and weightless softness.', price:48, oldPrice:null, badge:null, badgeType:null, stars:5, img:'images/haircare_luxury.jpg' },
  { id:60, name:'Lumière Shine & Texture Dry Mist', category:'haircare', categoryLabel:'Hair Care', desc:'Invisible dry texturizing mist with bamboo extract creating effortless, lived-in French-girl volume.', price:40, oldPrice:50, badge:'Sale', badgeType:'sale', stars:4, img:'images/haircare_luxury.jpg' },
  { id:61, name:'Curls Couture Defining Crème', category:'haircare', categoryLabel:'Hair Care', desc:'Hydra-definition curl styling cream with Brazilian cupuaçu butter for soft, frizz-free defined spirals.', price:52, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/haircare_luxury.jpg' },
  { id:62, name:'Overnight Keratin Bond Infusion', category:'haircare', categoryLabel:'Hair Care', desc:'Overnight bond-building infusion that reconnects broken keratin bonds while you sleep for resilient hair.', price:88, oldPrice:null, badge:'Award Winner', badgeType:'best', stars:5, img:'images/haircare_luxury.jpg' },
  // Additional 50 Products Expansion (IDs 63 - 112)
  { id:63, name:'Glow Renewal Enzyme Mask', category:'skincare', categoryLabel:'Skincare', desc:'Gentle papaya and pumpkin fruit enzymes that melt away dullness for an instant lit-from-within facial glow.', price:72, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:64, name:'Rose Quartz Sculpting Facial Roller', category:'skincare', categoryLabel:'Skincare', desc:'Hand-carved cooling Brazilian rose quartz stone that stimulates lymphatic drainage and visibly contours cheekbones.', price:48, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/editorial_flatlay.jpg' },
  { id:65, name:'Midnight Recovery Botanical Elixir', category:'skincare', categoryLabel:'Skincare', desc:'Concentrated nocturnal botanical lipid complex that accelerates cellular regeneration and restores skin elasticity overnight.', price:135, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/serum_dropper.jpg' },
  { id:66, name:'Purifying French Green Clay Detox Mask', category:'skincare', categoryLabel:'Skincare', desc:'Mineral-rich Montmorillonite clay and organic spirulina that unclogs pores while preserving essential barrier moisture.', price:58, oldPrice:70, badge:'Sale', badgeType:'sale', stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:67, name:'Ceramide Lipid Replenishing Cleansing Milk', category:'skincare', categoryLabel:'Skincare', desc:'Soothing creamy emulsion with five essential ceramides that dissolves impurities without disrupting vulnerable acid mantles.', price:52, oldPrice:null, badge:'Clean Beauty', badgeType:'new', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:68, name:'Golden Immortelle Firming Eye Balm', category:'skincare', categoryLabel:'Skincare', desc:'Velvety peptide eye butter infused with Corsican immortelle essential oil to lift and smooth delicate eyelids.', price:92, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:69, name:'Hydra-Infusion Multi-Molecular Hyaluronic Gel', category:'skincare', categoryLabel:'Skincare', desc:'Weightless water-jelly delivering seven molecular weights of hyaluronic acid for continuous 72-hour dermal hydration.', price:84, oldPrice:null, badge:null, badgeType:null, stars:5, img:'images/serum_dropper.jpg' },
  { id:70, name:'White Truffle Radiance Treatment Essence', category:'skincare', categoryLabel:'Skincare', desc:'Fermented Alba white truffle and niacinamide elixir that evens skin tone and provides luminous glass-skin clarity.', price:155, oldPrice:null, badge:'Limited', badgeType:'best', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:71, name:'Aura Cica Soothing Barrier Salve', category:'skincare', categoryLabel:'Skincare', desc:'Multi-purpose rescue balm enriched with tiger grass and colloidal oatmeal to calm extreme dryness and irritation.', price:46, oldPrice:60, badge:'Sale', badgeType:'sale', stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:72, name:'Resurfacing 10% Glycolic Night Serum', category:'skincare', categoryLabel:'Skincare', desc:'Buffered glycolic and lactic acid solution that refines rough texture and minimizes hyperpigmentation overnight.', price:88, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/serum_dropper.jpg' },
  { id:73, name:'Nectar de Rose Petal Facial Oil', category:'skincare', categoryLabel:'Skincare', desc:'Silken dry oil infused with handpicked Provencal rose petals and cold-pressed marula for velvet radiance.', price:78, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:74, name:'Alpine Glacier Mineral Hydrating Mist', category:'skincare', categoryLabel:'Skincare', desc:'Pure Swiss alpine glacier water and edelweiss flower extract to shield skin against environmental digital fatigue.', price:42, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:75, name:'Collagen Peptide Youth Concentrate', category:'skincare', categoryLabel:'Skincare', desc:'Bioactive marine collagen and hexapeptides working synergistically to plump fine expression lines and restore bounce.', price:118, oldPrice:null, badge:'Award Winner', badgeType:'best', stars:5, img:'images/serum_dropper.jpg' },
  { id:76, name:'Probiotic Balancing Balancing Emulsion', category:'skincare', categoryLabel:'Skincare', desc:'Microbiome-supportive fermented lactobacillus formula that reduces sensitivity and creates a resilient, fortified skin mantle.', price:68, oldPrice:82, badge:'Sale', badgeType:'sale', stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:77, name:'Silk Protein Smoothing Primer Serum', category:'skincare', categoryLabel:'Skincare', desc:'Hybrid skincare-makeup serum with hydrolyzed silk that creates an ultra-smooth blur canvas for flawless foundation.', price:64, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/serum_dropper.jpg' },
  { id:78, name:'Velvet Cloud Matte Cushion Foundation', category:'makeup', categoryLabel:'Makeup', desc:'Airy cushion compact providing buildable medium coverage with a soft-focus velvet matte skin finish.', price:72, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:79, name:'Lumière Satin Lip Glaze', category:'makeup', categoryLabel:'Makeup', desc:'High-shine hybrid lip lacquer combining the comfort of an oil with rich couture color payoff.', price:38, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:80, name:'Micro-Sculpt Precision Brow Gel', category:'makeup', categoryLabel:'Makeup', desc:'Flexible tinted fiber brow gel that creates naturally laminated, feathered arches that hold for 24 hours.', price:32, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/makeup_products_1788328354838.jpg' },
  { id:81, name:'Champagne Gold Liquid Illuminator', category:'makeup', categoryLabel:'Makeup', desc:'Light-catching fluid highlighter infused with ultra-fine crushed pearls for an effortless glass-skin glow.', price:44, oldPrice:55, badge:'Sale', badgeType:'sale', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:82, name:'Intense Carbon Gel Liner Pot', category:'makeup', categoryLabel:'Makeup', desc:'Silky waterproof cream eyeliner delivering deep pitch-black precision and seamless blending for siren wings.', price:34, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/makeup_products_1788328354838.jpg' },
  { id:83, name:'Rose Petal Powder Blush Compact', category:'makeup', categoryLabel:'Makeup', desc:'Cashmere-soft pressed powder blush that mimics a natural youthful flush with soft-focus blurring technology.', price:48, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:84, name:'Waterproof Lash Extension Tubing Mascara', category:'makeup', categoryLabel:'Makeup', desc:'Innovative tubing mascara forming lightweight polymers around each lash for sky-high length with smudge-free removal.', price:42, oldPrice:null, badge:'Award Winner', badgeType:'best', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:85, name:'Couture Eyeshadow Quad Noir', category:'makeup', categoryLabel:'Makeup', desc:'Four curated smoky hues in buttery matte, sparkling metallic, and satin finishes for dramatic evening glamour.', price:68, oldPrice:85, badge:'Sale', badgeType:'sale', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:86, name:'Plumping Peptide Lip Contour Liner', category:'makeup', categoryLabel:'Makeup', desc:'Creamy non-drying lip shaping pencil infused with hyaluronic spheres to visibly enhance volume and symmetry.', price:30, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/makeup_products_1788328354838.jpg' },
  { id:87, name:'Mineral Matte Bronzing Compact', category:'makeup', categoryLabel:'Makeup', desc:'Pure mineral baked bronzer with golden terracotta pigments for natural sun-bathed dimension without shimmer.', price:54, oldPrice:null, badge:'Clean Beauty', badgeType:'new', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:88, name:'Starlight Shimmer Liquid Eyeshadow', category:'makeup', categoryLabel:'Makeup', desc:'Molten multidimensional metallic shadow delivering intense jewel brilliance with zero fallout or creasing.', price:36, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:89, name:'Hydra-Setting Dewy Mist', category:'makeup', categoryLabel:'Makeup', desc:'Fine micro-mist infused with botanical waters that melds makeup layers into a fresh, dewy finish.', price:45, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:90, name:'Lumière Velvet Lip Soufflé', category:'makeup', categoryLabel:'Makeup', desc:'Whipped cloud-like matte lip cream providing weightless blurred color with a velvety soft-focus blur.', price:40, oldPrice:50, badge:'Sale', badgeType:'sale', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:91, name:'Baked Sculpting Contour Powder', category:'makeup', categoryLabel:'Makeup', desc:'Cool-toned sculpting powder engineered to mimic natural facial shadows for authentic, seamless contour definition.', price:48, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/makeup_products_1788328354838.jpg' },
  { id:92, name:'Diamond Dust Body Glow Shimmer', category:'makeup', categoryLabel:'Makeup', desc:'Luminous dry shimmering body oil that veils collarbones and limbs in sunlit golden diamond sparkle.', price:62, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:93, name:'Fleur Sauvage Eau de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Intoxicating wild freesia, honeysuckle, and golden amber capturing the allure of an untamed French meadow.', price:175, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:94, name:'Café Mystique Extrait de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Rich roasted espresso bean, dark Venezuelan cacao, and smoky tonka bean in a velvety intoxicating blend.', price:245, oldPrice:null, badge:'Limited', badgeType:'best', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:95, name:'Néroli Céleste Eau de Toilette', category:'fragrance', categoryLabel:'Fragrance', desc:'Luminous solar neroli blossom, sparkling mandarin, and clean ambergris creating a sun-drenched Mediterranean aura.', price:150, oldPrice:180, badge:'Sale', badgeType:'sale', stars:4, img:'images/perfume_collection_1788328378783.jpg' },
  { id:96, name:'Oud Royal Extrait de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Aged Assam agarwood enriched with Damascus rose petals, leather accords, and dark amber for regal presence.', price:285, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:97, name:'Vanille Clandestine Eau de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Bourbon vanilla bean laced with smoky black tea leaves and benzoin resin for an enigmatic aura.', price:190, oldPrice:null, badge:null, badgeType:null, stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:98, name:'Grasse Mimosa Hydrating Fragrance Mist', category:'fragrance', categoryLabel:'Fragrance', desc:'Delicate golden mimosa blossom and honeyed white musk formulated with alcohol-free hyaluronic botanicals.', price:70, oldPrice:null, badge:'Clean Beauty', badgeType:'new', stars:4, img:'images/perfume_collection_1788328378783.jpg' },
  { id:99, name:'Bois d’Encens Artisanal Candle', category:'fragrance', categoryLabel:'Fragrance', desc:'Somali incense, cedar smoke, and precious patchouli hand-poured in a textured black ceramic vessel.', price:88, oldPrice:105, badge:'Sale', badgeType:'sale', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:100, name:'Soleil d’Or Eau de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Golden ylang-ylang, monoi flower, and warm driftwood reminiscent of golden hour on the French Riviera.', price:165, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:101, name:'Santal Blanc Perfume Oil Rollerball', category:'fragrance', categoryLabel:'Fragrance', desc:'Pure botanical perfume oil of creamy sandalwood, iris root, and clean cedarwood for intimate personal scent.', price:58, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/perfume_collection_1788328378783.jpg' },
  { id:102, name:'Tubéreuse Impériale Extrait de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Carnal night-blooming tuberose absolute draped in rich cashmeran, white leather, and velvety Madagascar vanilla.', price:255, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:103, name:'Botanical Gloss Mirror Shine Serum', category:'haircare', categoryLabel:'Hair Care', desc:'Weightless silicone-free gloss serum with cold-pressed abyssinian oil delivering high-wattage shine and zero frizz.', price:54, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/haircare_luxury.jpg' },
  { id:104, name:'Peptide Density Scalp Follicle Treatment', category:'haircare', categoryLabel:'Hair Care', desc:'Clinical leave-in scalp drops with copper peptides and redensyl to visibly thicken thinning hairline strands.', price:82, oldPrice:98, badge:'Sale', badgeType:'sale', stars:5, img:'images/haircare_luxury.jpg' },
  { id:105, name:'Murumuru Butter Deep Moisture Conditioner', category:'haircare', categoryLabel:'Hair Care', desc:'Ultra-nourishing restorative conditioner that detangles, softens brittle strands, and restores supple elastic bounce.', price:48, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/haircare_luxury.jpg' },
  { id:106, name:'Rosemary Biotin Volumizing Shampoo', category:'haircare', categoryLabel:'Hair Care', desc:'Clarifying sulfate-free cleanser enriched with wild rosemary and biotin that boosts root lift and body.', price:44, oldPrice:null, badge:'Clean Beauty', badgeType:'new', stars:5, img:'images/haircare_luxury.jpg' },
  { id:107, name:'Silk Protein Leave-In Smoothing Milk', category:'haircare', categoryLabel:'Hair Care', desc:'Lightweight thermal detangling milk that seals porous cuticles and protects against 450°F styling tool damage.', price:46, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/haircare_luxury.jpg' },
  { id:108, name:'Baobab Restorative Split End Mender', category:'haircare', categoryLabel:'Hair Care', desc:'Instant sealing cream with baobab seed protein that bonds split cuticles and prevents future breakage.', price:38, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/haircare_luxury.jpg' },
  { id:109, name:'Golden Camellia Hair Oil Treatment', category:'haircare', categoryLabel:'Hair Care', desc:'Multi-use pre-shampoo or finishing elixir with virgin camellia oil that nourishes dry strands into silk.', price:76, oldPrice:90, badge:'Sale', badgeType:'sale', stars:5, img:'images/haircare_luxury.jpg' },
  { id:110, name:'French Sea Kelp Scalp Detox Scrub', category:'haircare', categoryLabel:'Hair Care', desc:'Micro-exfoliating Atlantic sea kelp and mineral crystals that remove residue and stimulate root vitality.', price:50, oldPrice:null, badge:'Award Winner', badgeType:'best', stars:5, img:'images/haircare_luxury.jpg' },
  { id:111, name:'Cashmere Soft Flexible Hold Hair Mist', category:'haircare', categoryLabel:'Hair Care', desc:'Brushable anti-humidity finishing spray providing soft, touchable all-day hold with an editorial satin finish.', price:42, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/haircare_luxury.jpg' },
  { id:112, name:'Keratin Bond Rebuilding Intensive Masque', category:'haircare', categoryLabel:'Hair Care', desc:'Professional clinical bonding treatment that reconnects broken sulfur keratin bonds in heavily processed hair.', price:94, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/haircare_luxury.jpg' },
  // Additional 38 Products Expansion (IDs 113 - 150)
  { id:113, name:'Rosehip Seed Illuminating Cleansing Oil', category:'skincare', categoryLabel:'Skincare', desc:'Silken lipid-dissolving cleansing oil with organic rosehip and sweet almond oil for effortlessly pristine, radiant skin.', price:56, oldPrice:null, badge:'Clean Beauty', badgeType:'new', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:114, name:'Bio-Fermented Kombucha Smoothing Essence', category:'skincare', categoryLabel:'Skincare', desc:'Antioxidant-dense fermented black tea prebiotic toner that visibly softens pores and enhances natural skin luminous clarity.', price:68, oldPrice:80, badge:'Sale', badgeType:'sale', stars:4, img:'images/editorial_flatlay.jpg' },
  { id:115, name:'Cryo-Sculpting Ice Globe Facial Massagers', category:'skincare', categoryLabel:'Skincare', desc:'Surgical glass cooling globes filled with antifreeze fluid to instantly depuff, calm redness, and tighten contours.', price:62, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/editorial_flatlay.jpg' },
  { id:116, name:'Marine Algae Peptide Firming Day Fluid', category:'skincare', categoryLabel:'Skincare', desc:'Ultra-breathable daily emulsion combining Brittany sea kelp and hexapeptides to cushion and firm slackened skin.', price:98, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/serum_dropper.jpg' },
  { id:117, name:'Volcanic Ash Pore Refining Exfoliator', category:'skincare', categoryLabel:'Skincare', desc:'Micro-fine Auvergne volcanic mineral polish and salicylic acid that sweeps away dead keratin for baby-soft texture.', price:54, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/skincare_products_1788328338930.jpg' },
  { id:118, name:'Blue Tansy Calming Night Oil', category:'skincare', categoryLabel:'Skincare', desc:'Azure-hued Moroccan blue tansy and squalane botanical concentrate formulated to extinguish redness and chronic facial sensitivity.', price:86, oldPrice:null, badge:'Award Winner', badgeType:'best', stars:5, img:'images/serum_dropper.jpg' },
  { id:119, name:'Stem Cell Contour Sculpting Neck Cream', category:'skincare', categoryLabel:'Skincare', desc:'Targeted neck and décolleté lifting treatment packed with Swiss apple stem cells and tensor plant polymers.', price:110, oldPrice:130, badge:'Sale', badgeType:'sale', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:120, name:'Centella Repair Soothing Sheet Masks (Set of 5)', category:'skincare', categoryLabel:'Skincare', desc:'Biodegradable biocellulose masks drenched in madecassoside and panthenol serum for emergency relief of stressed skin.', price:52, oldPrice:null, badge:null, badgeType:null, stars:5, img:'images/editorial_flatlay.jpg' },
  { id:121, name:'24k Gold Radiance Infusion Elixir', category:'skincare', categoryLabel:'Skincare', desc:'Suspension of pure 24k colloidal gold and rosehip oil that diffuses light and restores velvet firmness.', price:148, oldPrice:null, badge:'Limited', badgeType:'best', stars:5, img:'images/serum_dropper.jpg' },
  { id:122, name:'Ceramide Recovery Barrier Lip Butter', category:'skincare', categoryLabel:'Skincare', desc:'Intensive restorative lipid balm with shea butter and ceramides that repairs cracked, parched lips overnight.', price:32, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/skincare_products_1788328338930.jpg' },
  { id:123, name:'Lumière Tinted Serum Glow Drops', category:'makeup', categoryLabel:'Makeup', desc:'Sheer skincare-infused tinted fluid with squalane and light-diffusing mineral pigments for effortless no-makeup radiant skin.', price:52, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:124, name:'Couture Precision Liquid Eyeliner Pen', category:'makeup', categoryLabel:'Makeup', desc:'Japanese calligraphy brush tip providing 0.1mm micro-precision and waterproof carbon black ink that never smudges.', price:36, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:125, name:'Velvet Petal Soft Powder Blush', category:'makeup', categoryLabel:'Makeup', desc:'Silky micro-milled powder blush delivering a soft watercolor wash of healthy, natural rose glow all day.', price:44, oldPrice:55, badge:'Sale', badgeType:'sale', stars:4, img:'images/makeup_products_1788328354838.jpg' },
  { id:126, name:'Gilded Cream Eyeshadow Wand', category:'makeup', categoryLabel:'Makeup', desc:'Longwear twist-up shadow stick that glides effortlessly across lids delivering multidimensional champagne bronze shimmering drama.', price:38, oldPrice:null, badge:null, badgeType:null, stars:5, img:'images/editorial_flatlay.jpg' },
  { id:127, name:'Plumping Lip Glaze in French Nude', category:'makeup', categoryLabel:'Makeup', desc:'Nourishing peptide-enriched gloss delivering high-octane mirror shine, comfortable cushion, and a subtle natural plumping effect.', price:34, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:128, name:'Matte Velvet Mineral Finishing Powder', category:'makeup', categoryLabel:'Makeup', desc:'Microfine silica-free blurring powder that sets foundation, minimizes fine lines, and leaves a velvet-satin finish.', price:48, oldPrice:null, badge:'Clean Beauty', badgeType:'new', stars:4, img:'images/makeup_products_1788328354838.jpg' },
  { id:129, name:'Illuminating Liquid Highlighter in Moonstone', category:'makeup', categoryLabel:'Makeup', desc:'Opalescent liquid highlighter delivering an ethereal dewy candlelit glow to high points of cheekbones and temples.', price:42, oldPrice:null, badge:null, badgeType:null, stars:5, img:'images/editorial_flatlay.jpg' },
  { id:130, name:'Sculpt & Bronze Duo Palette', category:'makeup', categoryLabel:'Makeup', desc:'Compact duo pairing a neutral sculpting contour shade with a golden warmth bronzer for dimensional bone structure.', price:62, oldPrice:75, badge:'Sale', badgeType:'sale', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:131, name:'Lash Fortifying Primer & Serum', category:'makeup', categoryLabel:'Makeup', desc:'Conditioning white peptide base coat that magnifies mascara volume while nourishing brittle lashes with biotin.', price:36, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/makeup_products_1788328354838.jpg' },
  { id:132, name:'Hydra-Silk Lip Stain in Cerise', category:'makeup', categoryLabel:'Makeup', desc:'Weightless water-gel lip stain that delivers a long-lasting Parisian popsicle cherry flush with zero transfer.', price:38, oldPrice:null, badge:'Award Winner', badgeType:'best', stars:5, img:'images/makeup_products_1788328354838.jpg' },
  { id:133, name:'Fleur de Pêche Eau de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Succulent white peach flesh, velvet osmanthus blossom, and warm creamy sandalwood evoking Parisian summer afternoons.', price:170, oldPrice:null, badge:'New', badgeType:'new', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:134, name:'Cuir Impérial Extrait de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Rich saddle leather, smoky birch tar, roasted chestnut, and dark amber resin in an aristocratic formulation.', price:265, oldPrice:null, badge:'Limited', badgeType:'best', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:135, name:'Jardin de Grasse Eau de Toilette', category:'fragrance', categoryLabel:'Fragrance', desc:'Centifolia rose, sparkling green mandarin, crushed violet leaves, and sheer musk capturing French botanical elegance.', price:140, oldPrice:165, badge:'Sale', badgeType:'sale', stars:4, img:'images/perfume_collection_1788328378783.jpg' },
  { id:136, name:'Santal Mystère Extrait de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Creamy Indian sandalwood infused with smoked cedar, cardamom spice, and dark Madagascar vanilla orchid petals.', price:240, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:137, name:'Ambre Nuit Artisanal Scented Candle', category:'fragrance', categoryLabel:'Fragrance', desc:'Warm Baltic amber, benzoin, and smoked vanilla hand-poured in a luxury matte black porcelain vessel.', price:82, oldPrice:null, badge:null, badgeType:null, stars:5, img:'images/editorial_flatlay.jpg' },
  { id:138, name:'Rose d’Arabie Hair Fragrance Mist', category:'fragrance', categoryLabel:'Fragrance', desc:'Alcohol-free conditioning hair mist blending Damask rose absolute, precious saffron, and lightweight nourishing argan oil.', price:72, oldPrice:null, badge:'Clean Beauty', badgeType:'new', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:139, name:'Iris Céleste Eau de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Noble Florentine orris root, soft powdery heliotrope, and crystalline white musk creating an ethereal veil.', price:185, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/perfume_collection_1788328378783.jpg' },
  { id:140, name:'Vétiver Sacré Eau de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Smoked Haitian vetiver root, pink peppercorn, cedar sap, and earthy oakmoss for a sophisticated woody signature.', price:160, oldPrice:190, badge:'Sale', badgeType:'sale', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:141, name:'Nectar de Figue Eau de Parfum', category:'fragrance', categoryLabel:'Fragrance', desc:'Ripe purple fig flesh, milky green sap, coconut water, and sun-warmed cedar evoking coastal Mediterranean memories.', price:168, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/perfume_collection_1788328378783.jpg' },
  { id:142, name:'Golden Squalane Anti-Frizz Hair Serum', category:'haircare', categoryLabel:'Hair Care', desc:'Weightless olive-derived squalane serum that instantly smooths flyaways, tames humidity frizz, and locks in brilliant shine.', price:52, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/haircare_luxury.jpg' },
  { id:143, name:'Biocellulose Hair Rebuilding Masque', category:'haircare', categoryLabel:'Hair Care', desc:'Intensive restorative cream packed with vegan keratin and amino acids that reconstructs damaged hair bonds.', price:78, oldPrice:92, badge:'Sale', badgeType:'sale', stars:5, img:'images/haircare_luxury.jpg' },
  { id:144, name:'Rosemary Mint Scalp Energizing Tonic', category:'haircare', categoryLabel:'Hair Care', desc:'Cooling botanical scalp spray with organic peppermint and rosemary oil to stimulate microcirculation and root vigor.', price:42, oldPrice:null, badge:'Clean Beauty', badgeType:'new', stars:5, img:'images/haircare_luxury.jpg' },
  { id:145, name:'Silk Protein Weightless Leave-In Foam', category:'haircare', categoryLabel:'Hair Care', desc:'Aero-light conditioning cloud foam that adds bouncy volume, effortless detangling, and lustrous silk texture without heaviness.', price:46, oldPrice:null, badge:'New', badgeType:'new', stars:4, img:'images/haircare_luxury.jpg' },
  { id:146, name:'Camellia Dry Scalp Exfoliating Treatment', category:'haircare', categoryLabel:'Hair Care', desc:'Pre-wash salicylic acid and Japanese camellia oil serum that gently eliminates dry scalp flaking and buildup.', price:48, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/haircare_luxury.jpg' },
  { id:147, name:'Thermal Defense 450° Shield Serum', category:'haircare', categoryLabel:'Hair Care', desc:'High-performance barrier oil protecting delicate hair cuticles against blow-dry heat damage while sealing in mirror luminosity.', price:58, oldPrice:null, badge:'Award Winner', badgeType:'best', stars:5, img:'images/haircare_luxury.jpg' },
  { id:148, name:'Hydrating Velvet Curl Custard', category:'haircare', categoryLabel:'Hair Care', desc:'Rich plant-derived curl cream formulated with cupuaçu butter to define and moisturize textured coils and curls.', price:50, oldPrice:62, badge:'Sale', badgeType:'sale', stars:5, img:'images/haircare_luxury.jpg' },
  { id:149, name:'Botanical Dry Shampoo Powder Mist', category:'haircare', categoryLabel:'Hair Care', desc:'Non-aerosol oat and rice starch powder that instantly absorbs excess oils and restores fresh, airy root volume.', price:38, oldPrice:null, badge:null, badgeType:null, stars:4, img:'images/haircare_luxury.jpg' },
  { id:150, name:'Midnight Keratin Bond Infusion Elixir', category:'haircare', categoryLabel:'Hair Care', desc:'Overnight leave-in serum that deposits biomimetic keratin peptides to repair split ends and strengthen weak hair.', price:86, oldPrice:null, badge:'Bestseller', badgeType:'best', stars:5, img:'images/haircare_luxury.jpg' },
];

/* ---- Shared Cart & Wishlist State ---- */
var cart = JSON.parse(localStorage.getItem('lumiere_cart') || localStorage.getItem('lumiere-cart') || '[]');
var wishlist = new Set(JSON.parse(localStorage.getItem('lumiere_wishlist') || localStorage.getItem('lumiere-wishlist') || '[]'));
window.cart = cart;
window.wishlist = wishlist;

function saveCart() {
  localStorage.setItem('lumiere_cart', JSON.stringify(cart));
  localStorage.setItem('lumiere-cart', JSON.stringify(cart));
  if (typeof updateCartUI === 'function') updateCartUI();
}

function saveWishlist() {
  const arr = (wishlist instanceof Set) ? [...wishlist] : wishlist;
  localStorage.setItem('lumiere_wishlist', JSON.stringify(arr));
  localStorage.setItem('lumiere-wishlist', JSON.stringify(arr));
  if (typeof updateWishlistUI === 'function') updateWishlistUI();
}

/* ============================================================
   NAVBAR
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Scroll behavior
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // Active link
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('mobile-open');
      navLinks.style.cssText = isOpen
        ? 'display:flex;flex-direction:column;position:absolute;top:100%;left:0;right:0;background:rgba(13,10,14,0.97);padding:2rem;gap:1.5rem;border-bottom:1px solid rgba(201,169,110,0.15);'
        : '';
    });
  }
}

/* ============================================================
   FALLBACK CART & WISHLIST (Only if not in cinematic environment)
   ============================================================ */
if (typeof window.addToCart !== 'function') {
  window.addToCart = function(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.qty += 1;
    else cart.push({ ...product, qty: 1 });
    saveCart();
    if (typeof updateCartUI === 'function') updateCartUI();
    if (typeof showToast === 'function') showToast(`<span class="toast-icon">✦</span> <strong>${product.name}</strong> added to your bag`);
  };
}

if (typeof window.removeFromCart !== 'function') {
  window.removeFromCart = function(productId) {
    cart = cart.filter(i => i.id !== productId);
    window.cart = cart;
    saveCart();
    if (typeof updateCartUI === 'function') updateCartUI();
    if (typeof renderCartItems === 'function') renderCartItems();
  };
}

if (typeof window.changeQty !== 'function') {
  window.changeQty = function(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      if (typeof removeFromCart === 'function') removeFromCart(productId);
    } else {
      saveCart();
      if (typeof updateCartUI === 'function') updateCartUI();
      if (typeof renderCartItems === 'function') renderCartItems();
    }
  };
}

if (typeof window.toggleWishlist !== 'function') {
  window.toggleWishlist = function(id, btn) {
    if (wishlist.has(id)) {
      wishlist.delete(id);
      if (btn) { btn.textContent = '♡'; btn.style.color = ''; }
      if (typeof showToast === 'function') showToast('Removed from wishlist');
    } else {
      wishlist.add(id);
      if (btn) { btn.textContent = '♥'; btn.style.color = '#d4758a'; }
      if (typeof showToast === 'function') showToast('<span class="toast-icon">♥</span> Added to wishlist!');
    }
    saveWishlist();
  };
}

/* ============================================================
   TOAST
   ============================================================ */
let _toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
}

/* ============================================================
   PRODUCT CARD HELPERS
   ============================================================ */
function renderStars(n) {
  let s = '<div class="product-stars">';
  for (let i = 1; i <= 5; i++) s += `<span class="star${i > n ? ' empty' : ''}">★</span>`;
  return s + '</div>';
}

function buildProductCard(p, idx = 0) {
  const card = document.createElement('div');
  card.className = 'product-card reveal';
  card.style.transitionDelay = (idx * 0.06) + 's';
  card.id = `prod-${p.id}`;
  card.innerHTML = `
    <div class="product-img-wrap">
      <img src="${p.img}" alt="${p.name}" loading="lazy" />
      ${p.badge ? `<span class="product-badge ${p.badgeType||''}">${p.badge}</span>` : ''}
      <div class="product-actions">
        <button class="product-action-btn" onclick="toggleWishlist(${p.id},this)" id="wish-${p.id}" aria-label="Wishlist">${wishlist.has(p.id)?'♥':'♡'}</button>
        <button class="product-action-btn" onclick="showToast('<span class=\\'toast-icon\\'>👁</span> ${p.name} — $${p.price}')" aria-label="Quick view">👁</button>
      </div>
    </div>
    <div class="product-info">
      <div class="product-category">${p.categoryLabel}</div>
      ${renderStars(p.stars)}
      <div class="product-name">${p.name}</div>
      <div class="product-desc">${p.desc}</div>
      <div class="product-footer">
        <div class="product-price">
          ${p.oldPrice ? `<span class="old-price">$${p.oldPrice}</span>` : ''}$${p.price}
        </div>
        <button class="add-to-cart-btn" onclick="addToCart(${p.id})" id="atc-${p.id}">+ Add</button>
      </div>
    </div>`;
  return card;
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  updateCartUI();
  initReveal();

  // Cart button listeners
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.addEventListener('click', toggleCart);
  const overlay = document.getElementById('cartOverlay');
  if (overlay) overlay.addEventListener('click', toggleCart);
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', () => showToast('<span class="toast-icon">✦</span> Checkout coming soon!'));
  const continueShopping = document.getElementById('continueShoppingBtn');
  if (continueShopping) continueShopping.addEventListener('click', toggleCart);
});

/* ============================================================
   EDITORIAL FOOTER HANDLERS
   ============================================================ */
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
    status.style.color = 'var(--gold, #C8A97E)';
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
