-- ============================================================
-- LUMIÈRE BEAUTY — Database Seeds
-- ============================================================

-- 1. Insert Categories
INSERT INTO categories (slug, name, description) VALUES
('skincare', 'Skincare', 'Clean, potent active botanicals and restorative treatments'),
('makeup', 'Makeup', 'Pigment-rich, long-wearing cosmetics crafted with skin-loving ingredients'),
('fragrance', 'Fragrance', 'Fine artisanal parfums inspired by Parisian elegance')
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Products
INSERT INTO products (name, category_slug, category_label, description, price, old_price, badge, badge_type, stars, img_path, stock) VALUES
('Radiance Glow Serum', 'skincare', 'Skincare', 'Vitamin C & hyaluronic acid blend for glass-skin luminosity', 128.00, NULL, 'Bestseller', 'best', 5, 'images/skincare_products_1788328338930.jpg', 85),
('Velvet Lip Collection', 'makeup', 'Makeup', 'Richly pigmented matte lipstick with 12-hour lasting power', 58.00, 78.00, 'Sale', 'sale', 5, 'images/makeup_products_1788328354838.jpg', 140),
('Noir d''Or Eau de Parfum', 'fragrance', 'Fragrance', 'Warm oud, amber & vanilla — your signature evening scent', 215.00, NULL, 'New', 'new', 5, 'images/perfume_collection_1788328378783.jpg', 42),
('Restorative Night Cream', 'skincare', 'Skincare', 'Peptide-rich overnight treatment for plump, rested skin', 96.00, NULL, NULL, NULL, 4, 'images/skincare_products_1788328338930.jpg', 60),
('Pro Eyeshadow Palette', 'makeup', 'Makeup', '12 jewel-toned shades from satin to ultra-metallic', 82.00, 110.00, 'Sale', 'sale', 5, 'images/makeup_products_1788328354838.jpg', 95),
('Rose Bloom Eau de Toilette', 'fragrance', 'Fragrance', 'Fresh Bulgarian rose, peony & white musk — a daylight dream', 165.00, NULL, NULL, NULL, 4, 'images/perfume_collection_1788328378783.jpg', 50),
('Rosehip Facial Oil', 'skincare', 'Skincare', 'Cold-pressed rosehip & squalane for deep nourishment', 74.00, NULL, 'New', 'new', 5, 'images/skincare_products_1788328338930.jpg', 110),
('Gold Highlighter', 'makeup', 'Makeup', 'Ultra-fine champagne gold pigment for ethereal glow', 46.00, NULL, 'Bestseller', 'best', 5, 'images/makeup_products_1788328354838.jpg', 130),
('Hyaluronic Plump Mist', 'skincare', 'Skincare', 'Instant hydration burst with ceramides & aloe vera', 55.00, NULL, 'New', 'new', 4, 'images/skincare_products_1788328338930.jpg', 75),
('Velvet Bronzing Drops', 'makeup', 'Makeup', 'Buildable liquid bronze with a natural sun-kissed finish', 64.00, 80.00, 'Sale', 'sale', 5, 'images/makeup_products_1788328354838.jpg', 88),
('Jasmin Noir Parfum', 'fragrance', 'Fragrance', 'Deep jasmine, black orchid & sandalwood mystery', 195.00, NULL, 'Bestseller', 'best', 5, 'images/perfume_collection_1788328378783.jpg', 38),
('Peptide Eye Complex', 'skincare', 'Skincare', 'Targets dark circles, puffiness & fine lines', 88.00, NULL, NULL, NULL, 4, 'images/skincare_products_1788328338930.jpg', 64);
