/**
 * Database Initialization & Seed Migration Runner
 * Sets up schemas, roles, permissions, RBAC mappings,
 * staff accounts, 51 products, inventory balances, and sample orders.
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function initDatabase() {
  console.log('[InitDB] Starting database initialization...');

  // 1. Read and apply schema
  const schemaPath = path.resolve(__dirname, '../../database/schemas/schema.sql');
  let rawSchema = fs.readFileSync(schemaPath, 'utf8');

  if (db.isPostgres) {
    rawSchema = rawSchema.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
    rawSchema = rawSchema.replace(/BOOLEAN DEFAULT 1/gi, 'BOOLEAN DEFAULT TRUE');
    rawSchema = rawSchema.replace(/BOOLEAN DEFAULT 0/gi, 'BOOLEAN DEFAULT FALSE');
  }

  await db.exec(rawSchema);
  console.log('[InitDB] Tables & indexes verified.');

  // Migration: Ensure age, location columns and phone_otps table exist
  try { await db.exec('ALTER TABLE users ADD COLUMN age INTEGER;'); } catch {}
  try { await db.exec('ALTER TABLE users ADD COLUMN location VARCHAR(255);'); } catch {}
  await db.exec(`
    CREATE TABLE IF NOT EXISTS phone_otps (
      phone VARCHAR(50) PRIMARY KEY,
      otp VARCHAR(10) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      verified BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  const roles = [
    { name: 'OWNER', description: 'Complete administrative ownership with full system access' },
    { name: 'MANAGER', description: 'Store manager: products, inventory, orders, customers & analytics' },
    { name: 'INVENTORY_STAFF', description: 'Inventory management: stock view and stock adjustment' },
    { name: 'ORDER_STAFF', description: 'Order fulfillment: view and update orders & customer info' },
    { name: 'CUSTOMER', description: 'Front-facing customer: personal account, orders & wishlist' },
  ];

  for (const r of roles) {
    const existing = await db.get('SELECT id FROM roles WHERE name = ?', [r.name]);
    if (!existing) {
      await db.run('INSERT INTO roles (name, description) VALUES (?, ?)', [r.name, r.description]);
    }
  }

  // 3. Seed Permissions
  const permissions = [
    { code: 'products.view', name: 'View Products', description: 'View catalog products' },
    { code: 'products.create', name: 'Create Product', description: 'Create new catalog products' },
    { code: 'products.edit', name: 'Edit Product', description: 'Edit existing catalog products' },
    { code: 'products.delete', name: 'Delete Product', description: 'Archive or remove products' },
    { code: 'inventory.view', name: 'View Inventory', description: 'View stock levels & history' },
    { code: 'inventory.adjust', name: 'Adjust Inventory', description: 'Record manual stock adjustments' },
    { code: 'orders.view', name: 'View Orders', description: 'View customer orders' },
    { code: 'orders.update', name: 'Update Orders', description: 'Update status, tracking & notes' },
    { code: 'customers.view', name: 'View Customers', description: 'View customer accounts & spend' },
    { code: 'analytics.view', name: 'View Analytics', description: 'Access revenue & business metrics' },
    { code: 'staff.manage', name: 'Manage Staff', description: 'Create, edit & manage staff accounts' },
    { code: 'settings.manage', name: 'Manage Settings', description: 'Manage store configuration & audit logs' },
  ];

  for (const p of permissions) {
    const existing = await db.get('SELECT id FROM permissions WHERE code = ?', [p.code]);
    if (!existing) {
      await db.run('INSERT INTO permissions (code, name, description) VALUES (?, ?, ?)', [p.code, p.name, p.description]);
    }
  }

  // 4. Map Role Permissions
  const rolePermMap = {
    OWNER: [
      'products.view', 'products.create', 'products.edit', 'products.delete',
      'inventory.view', 'inventory.adjust', 'orders.view', 'orders.update',
      'customers.view', 'analytics.view', 'staff.manage', 'settings.manage',
    ],
    MANAGER: [
      'products.view', 'products.create', 'products.edit', 'products.delete',
      'inventory.view', 'inventory.adjust', 'orders.view', 'orders.update',
      'customers.view', 'analytics.view',
    ],
    INVENTORY_STAFF: [
      'inventory.view', 'inventory.adjust', 'products.view',
    ],
    ORDER_STAFF: [
      'orders.view', 'orders.update', 'customers.view', 'products.view',
    ],
    CUSTOMER: [],
  };

  for (const [roleName, permCodes] of Object.entries(rolePermMap)) {
    const role = await db.get('SELECT id FROM roles WHERE name = ?', [roleName]);
    if (!role) continue;

    for (const code of permCodes) {
      const perm = await db.get('SELECT id FROM permissions WHERE code = ?', [code]);
      if (!perm) continue;

      const mapping = await db.get('SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ?', [role.id, perm.id]);
      if (!mapping) {
        await db.run('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [role.id, perm.id]);
      }
    }
  }

  // 5. Seed Users (Exclusive Owner: piyushverma730929@gmail.com, Manager, Staff, Customer)
  const defaultPasswordHash = await bcrypt.hash('Lumiere2026!', 10);
  const ownerPasswordHash = await bcrypt.hash('piyush@123', 10);

  // Remove deprecated generic owner account if exists
  await db.run('DELETE FROM users WHERE email = ?', ['owner@lumiere.com']);

  const seedUsers = [
    {
      email: 'piyushverma730929@gmail.com',
      password: ownerPasswordHash,
      firstName: 'Piyush',
      lastName: 'Verma',
      phone: '+91 7300212948',
      role: 'OWNER',
    },
    {
      email: 'manager@lumiere.com',
      password: defaultPasswordHash,
      firstName: 'Julien',
      lastName: 'Vance',
      phone: '+1 (555) 019-2832',
      role: 'MANAGER',
    },
    {
      email: 'inventory@lumiere.com',
      password: defaultPasswordHash,
      firstName: 'Marc',
      lastName: 'Dupond',
      phone: '+1 (555) 019-2833',
      role: 'INVENTORY_STAFF',
    },
    {
      email: 'orders@lumiere.com',
      password: defaultPasswordHash,
      firstName: 'Sophie',
      lastName: 'Laurent',
      phone: '+1 (555) 019-2834',
      role: 'ORDER_STAFF',
    },
    {
      email: 'customer@lumiere.com',
      password: defaultPasswordHash,
      firstName: 'Camille',
      lastName: 'Rousseau',
      phone: '+1 (555) 234-5678',
      role: 'CUSTOMER',
    },
  ];

  for (const u of seedUsers) {
    let user = await db.get('SELECT id FROM users WHERE email = ?', [u.email]);
    if (!user) {
      const res = await db.run(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, status)
         VALUES (?, ?, ?, ?, ?, 'active')`,
        [u.email, u.password, u.firstName, u.lastName, u.phone]
      );
      const userId = res.lastInsertRowid;
      const role = await db.get('SELECT id FROM roles WHERE name = ?', [u.role]);
      if (role) {
        await db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, role.id]);
      }
      // Create wishlist for customer
      if (u.role === 'CUSTOMER') {
        await db.run('INSERT INTO wishlists (user_id) VALUES (?)', [userId]);
      }
    } else if (u.role === 'OWNER') {
      // Ensure existing owner account has the updated password and OWNER role
      await db.run(
        'UPDATE users SET password_hash = ?, first_name = ?, last_name = ?, status = ? WHERE id = ?',
        [u.password, u.firstName, u.lastName, 'active', user.id]
      );
      const ownerRole = await db.get('SELECT id FROM roles WHERE name = ?', ['OWNER']);
      if (ownerRole) {
        const hasRole = await db.get('SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?', [user.id, ownerRole.id]);
        if (!hasRole) {
          await db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [user.id, ownerRole.id]);
        }
      }
    }
  }

  // Strictly enforce: ONLY piyushverma730929@gmail.com can possess the OWNER role
  const ownerRole = await db.get('SELECT id FROM roles WHERE name = ?', ['OWNER']);
  const ownerUser = await db.get('SELECT id FROM users WHERE email = ?', ['piyushverma730929@gmail.com']);
  if (ownerRole && ownerUser) {
    await db.run('DELETE FROM user_roles WHERE role_id = ? AND user_id != ?', [ownerRole.id, ownerUser.id]);
  }

  // 6. Seed Categories
  const categories = [
    { slug: 'skincare', name: 'Skincare', desc: 'Cellular restorative formulas & clean botanical elixirs' },
    { slug: 'makeup', name: 'Makeup', desc: 'Haute couture pigments, velvet formulas & luminous bases' },
    { slug: 'fragrance', name: 'Fragrance', desc: 'Haute parfumerie crafted with precious Grasse essences' },
    { slug: 'bath-body', name: 'Bath & Body', desc: 'Luxurious body oils, softening elixirs & silken polishes' },
    { slug: 'sets', name: 'Sets & Gifts', desc: 'Curated beauty rituals in gold-embossed coffrets' },
  ];

  for (const c of categories) {
    const existing = await db.get('SELECT id FROM categories WHERE slug = ?', [c.slug]);
    if (!existing) {
      await db.run('INSERT INTO categories (slug, name, description) VALUES (?, ?, ?)', [c.slug, c.name, c.desc]);
    }
  }

  // 7. Seed Collections
  const collections = [
    { slug: 'golden-aura', name: 'The Golden Aura Collection', tagline: 'Infused with 24-Karat Gold & Rare Botanicals' },
    { slug: 'velvet-noir', name: 'Velvet Noir Édit', tagline: 'Midnight Elegance & Smoky Sensuality' },
    { slug: 'rose-de-grasse', name: 'Rose de Grasse Ritual', tagline: 'Harvested from French Rose Valleys' },
  ];

  for (const col of collections) {
    const existing = await db.get('SELECT id FROM collections WHERE slug = ?', [col.slug]);
    if (!existing) {
      await db.run('INSERT INTO collections (slug, name, tagline) VALUES (?, ?, ?)', [col.slug, col.name, col.tagline]);
    }
  }

  // 8. Seed Products & Inventory
  const productCount = await db.get('SELECT COUNT(*) as count FROM products');
  if (parseInt(productCount.count, 10) === 0) {
    console.log('[InitDB] Seeding 51 luxury products with initial stock...');
    const seedJsonPath = path.resolve(__dirname, '../../database/seeds/seed_products.json');
    let rawProducts = [];
    if (fs.existsSync(seedJsonPath)) {
      rawProducts = JSON.parse(fs.readFileSync(seedJsonPath, 'utf8'));
    }

    const catMap = {};
    const catRows = await db.query('SELECT id, slug FROM categories');
    catRows.forEach(r => catMap[r.slug] = r.id);

    const ownerUser = await db.get('SELECT id FROM users WHERE email = ?', ['owner@lumiere.com']);

    for (const p of rawProducts) {
      const sku = `LUM-SKU-${String(p.id).padStart(3, '0')}`;
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const catId = catMap[p.category] || catMap['skincare'];
      const isFeatured = p.badge === 'Bestseller' ? 1 : 0;
      const isNew = p.badge === 'New' ? 1 : 0;
      const isBest = p.badge === 'Bestseller' ? 1 : 0;
      const stock = p.id === 4 ? 3 : (p.id === 8 ? 0 : (p.stock || 50)); // ID 4 low stock, ID 8 out of stock for demonstration

      const res = await db.run(
        `INSERT INTO products (sku, name, slug, description, price, compare_at_price, category_id, status, is_featured, is_new_arrival, is_bestseller, badge, badge_type, stars)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)`,
        [sku, p.name, slug, p.desc || p.description, p.price, p.oldPrice || null, catId, isFeatured, isNew, isBest, p.badge || null, p.badgeType || null, p.stars || 5.0]
      );
      const productId = res.lastInsertRowid;

      // Add primary image
      if (p.img) {
        await db.run('INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, 1, 0)', [productId, p.img]);
      }

      // Add initial inventory
      const invRes = await db.run(
        `INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, low_stock_threshold)
         VALUES (?, ?, 0, 5)`,
        [productId, stock]
      );
      const invId = invRes.lastInsertRowid;

      // Record initial transaction
      await db.run(
        `INSERT INTO inventory_transactions (inventory_id, transaction_type, quantity_delta, balance_after, reference_type, reference_id, reason, performed_by)
         VALUES (?, 'STOCK_RECEIVED', ?, ?, 'shipment', 'INITIAL-IMPORT', 'Initial catalogue launch inventory', ?)`,
        [invId, stock, stock, ownerUser ? ownerUser.id : null]
      );
    }
  }

  // 9. Seed Sample Orders for Customer
  const orderCount = await db.get('SELECT COUNT(*) as count FROM orders');
  if (parseInt(orderCount.count, 10) === 0) {
    console.log('[InitDB] Seeding sample customer orders & addresses...');
    const customer = await db.get('SELECT id FROM users WHERE email = ?', ['customer@lumiere.com']);
    if (customer) {
      // Address
      await db.run(
        `INSERT INTO addresses (user_id, address_type, full_name, phone, address_line1, city, state, postal_code, country, is_default)
         VALUES (?, 'shipping', 'Camille Rousseau', '+1 (555) 234-5678', '740 Park Avenue, Apt 14B', 'New York', 'NY', '10021', 'United States', 1)`,
        [customer.id]
      );

      // Order 1: Shipped
      const ord1 = await db.run(
        `INSERT INTO orders (order_number, customer_id, customer_email, customer_name, subtotal, shipping_fee, total_amount, status, payment_status, shipping_address_json, tracking_number)
         VALUES ('LUM-2026-8901', ?, 'customer@lumiere.com', 'Camille Rousseau', 256.00, 0.00, 256.00, 'Shipped', 'Paid', ?, '1Z9999999999999999')`,
        [customer.id, JSON.stringify({ address: '740 Park Avenue, Apt 14B, New York, NY 10021' })]
      );
      await db.run(
        `INSERT INTO order_items (order_id, product_id, product_name, sku, unit_price, quantity, total_price)
         VALUES (?, 1, 'Radiance Glow Serum', 'LUM-SKU-001', 128.00, 2, 256.00)`,
        [ord1.lastInsertRowid]
      );

      // Order 2: Confirmed
      const ord2 = await db.run(
        `INSERT INTO orders (order_number, customer_id, customer_email, customer_name, subtotal, shipping_fee, total_amount, status, payment_status, shipping_address_json, tracking_number)
         VALUES ('LUM-2026-8902', ?, 'customer@lumiere.com', 'Camille Rousseau', 215.00, 0.00, 215.00, 'Confirmed', 'Paid', ?, '1Z8888888888888888')`,
        [customer.id, JSON.stringify({ address: '740 Park Avenue, Apt 14B, New York, NY 10021' })]
      );
      await db.run(
        `INSERT INTO order_items (order_id, product_id, product_name, sku, unit_price, quantity, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [ord2.lastInsertRowid, 3, "Noir d'Or Eau de Parfum", 'LUM-SKU-003', 215.00, 1, 215.00]
      );

      // Wishlist items
      const wishlist = await db.get('SELECT id FROM wishlists WHERE user_id = ?', [customer.id]);
      if (wishlist) {
        await db.run('INSERT OR IGNORE INTO wishlist_items (wishlist_id, product_id) VALUES (?, 14)', [wishlist.id]);
        await db.run('INSERT OR IGNORE INTO wishlist_items (wishlist_id, product_id) VALUES (?, 42)', [wishlist.id]);
      }
    }
  }

  // 10. Seed Initial Audit Log
  const auditCount = await db.get('SELECT COUNT(*) as count FROM audit_logs');
  if (parseInt(auditCount.count, 10) === 0) {
    const owner = await db.get('SELECT id FROM users WHERE email = ?', ['owner@lumiere.com']);
    await db.run(
      `INSERT INTO audit_logs (user_id, user_email, user_role, action, entity_type, entity_id, details_json)
       VALUES (?, 'owner@lumiere.com', 'OWNER', 'system.initialize', 'system', '0', '{"description":"Lumiere luxury commerce initialized with RBAC and initial stock"}')`,
      [owner ? owner.id : null]
    );
  }

  console.log('[InitDB] Database ready with full relational data.');
}

if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('[InitDB] Completed successfully.');
      process.exit(0);
    })
    .catch(err => {
      console.error('[InitDB] Failed:', err);
      process.exit(1);
    });
}

module.exports = { initDatabase };
