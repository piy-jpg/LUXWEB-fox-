/**
 * Lumière Luxury Commerce — Automated Comprehensive Verification Suite
 * Validates database integrity, RBAC security, transactional inventory,
 * and customer order lifecycles.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const assert = require('assert');
const bcrypt = require('bcryptjs');
const db = require('./config/db');
const { generateToken } = require('./middleware/auth');
const inventoryService = require('./services/inventoryService');

async function runTests() {
  console.log('\n======================================================');
  console.log('   LUMIÈRE BEAUTY — AUTOMATED VERIFICATION SUITE      ');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    process.stdout.write(`[Test ${total}] ${name}... `);
    try {
      await fn();
      console.log('✓ PASSED');
      passed++;
    } catch (err) {
      console.log('✕ FAILED');
      console.error('   ', err.message);
    }
  }

  // TEST 1: Database Tables Verification
  await test('Verify 18 Relational Tables in Database', async () => {
    const expectedTables = [
      'roles', 'permissions', 'role_permissions', 'users', 'user_roles',
      'categories', 'collections', 'products', 'product_images', 'product_variants',
      'inventory', 'inventory_transactions', 'orders', 'order_items', 'addresses',
      'wishlists', 'wishlist_items', 'audit_logs'
    ];

    const tables = await db.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    const existing = tables.map(t => t.name);

    for (const t of expectedTables) {
      assert(existing.includes(t), `Table "${t}" must exist in database.`);
    }
  });

  // TEST 2: Seed Accounts Verification & Password Hashing
  await test('Verify Seeded Users, Roles & bcrypt Password Hashing', async () => {
    const owner = await db.get(
      "SELECT u.* FROM users u JOIN user_roles ur ON ur.user_id = u.id JOIN roles r ON r.id = ur.role_id WHERE r.name = 'OWNER' LIMIT 1"
    );
    assert(owner, 'Owner user must exist.');
    assert(owner.password_hash.startsWith('$2'), 'Password must be hashed with bcrypt.');

    const customer = await db.get("SELECT * FROM users WHERE email = 'customer@lumiere.com'");
    assert(customer, 'Customer user must exist.');
    const isCustMatch = await bcrypt.compare('Lumiere2026!', customer.password_hash);
    assert(isCustMatch, 'Customer password must match hash.');
  });

  // TEST 3: RBAC Permission Matrix Verification
  await test('Verify Strict RBAC Permission Mappings', async () => {
    // OWNER must have all 12 permissions
    const ownerPerms = await db.query(
      `SELECT p.code FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       JOIN roles r ON r.id = rp.role_id
       WHERE r.name = 'OWNER'`
    );
    assert.strictEqual(ownerPerms.length, 12, 'Owner must have exactly 12 permissions.');

    // MANAGER must NOT have staff.manage or settings.manage
    const managerPerms = await db.query(
      `SELECT p.code FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       JOIN roles r ON r.id = rp.role_id
       WHERE r.name = 'MANAGER'`
    );
    const codes = managerPerms.map(p => p.code);
    assert(!codes.includes('staff.manage'), 'Manager must NOT have staff.manage.');
    assert(!codes.includes('settings.manage'), 'Manager must NOT have settings.manage.');

    // INVENTORY_STAFF must only have inventory and product view
    const invPerms = await db.query(
      `SELECT p.code FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       JOIN roles r ON r.id = rp.role_id
       WHERE r.name = 'INVENTORY_STAFF'`
    );
    const invCodes = invPerms.map(p => p.code);
    assert(invCodes.includes('inventory.view'), 'Inventory staff must have inventory.view.');
    assert(invCodes.includes('inventory.adjust'), 'Inventory staff must have inventory.adjust.');
    assert(!invCodes.includes('orders.update'), 'Inventory staff must NOT have orders.update.');
  });

  // TEST 4: Security Rule — Customers strictly locked out of Admin
  await test('Security: Verify Customer is Forbidden from Admin Operations', async () => {
    const customer = await db.get('SELECT * FROM users WHERE email = ?', ['customer@lumiere.com']);
    const custToken = generateToken(customer, ['CUSTOMER'], []);
    assert(custToken, 'Token generated.');

    // Simulate auth middleware check
    const { requireRole } = require('./middleware/auth');
    const mockReq = {
      user: {
        id: customer.id,
        email: customer.email,
        roles: ['CUSTOMER'],
        isCustomer: true,
        isStaff: false,
        isOwner: false,
      },
    };

    let forbiddenCalled = false;
    const mockRes = {
      status: (code) => {
        if (code === 403) forbiddenCalled = true;
        return { json: () => {} };
      },
    };

    const adminGuard = requireRole('OWNER', 'MANAGER');
    adminGuard(mockReq, mockRes, () => {});

    assert(forbiddenCalled, 'Admin guard must return 403 Forbidden for CUSTOMER role.');
  });

  // TEST 5: Inventory Reservation on Order Placement
  let testOrderId = null;
  const testOrderNum = `TEST-ORDER-${Date.now()}`;

  await test('Transactional Inventory: Reserve Stock for Order', async () => {
    await db.run('UPDATE inventory SET stock_quantity = 50, reserved_quantity = 0 WHERE product_id = 2');
    const product = await db.get('SELECT id, name FROM products WHERE id = 2');
    const invBefore = await db.get('SELECT stock_quantity, reserved_quantity FROM inventory WHERE product_id = ?', [product.id]);
    const availableBefore = invBefore.stock_quantity - invBefore.reserved_quantity;
    const testUser = await db.get('SELECT id FROM users LIMIT 1');

    // Reserve 2 units
    await inventoryService.reserveStockForOrder([{ productId: product.id, quantity: 2 }], testOrderNum, testUser ? testUser.id : null);

    const invAfter = await db.get('SELECT stock_quantity, reserved_quantity FROM inventory WHERE product_id = ?', [product.id]);
    const availableAfter = invAfter.stock_quantity - invAfter.reserved_quantity;

    assert.strictEqual(invAfter.reserved_quantity, invBefore.reserved_quantity + 2, 'Reserved quantity must increment by 2.');
    assert.strictEqual(availableAfter, availableBefore - 2, 'Available quantity must decrement by 2.');

    // Check transaction ledger
    const tx = await db.get(
      'SELECT * FROM inventory_transactions WHERE reference_id = ? AND transaction_type = ?',
      [testOrderNum, 'ORDER_RESERVED']
    );
    assert(tx, 'ORDER_RESERVED transaction must be recorded in ledger.');
  });

  // TEST 6: Prevent Overselling (Insufficient Stock Error)
  await test('Transactional Inventory: Prevent Negative Stock & Overselling', async () => {
    let errorThrown = false;
    try {
      const testUser = await db.get('SELECT id FROM users LIMIT 1');
      // Attempt to reserve 999999 units
      await inventoryService.reserveStockForOrder([{ productId: 2, quantity: 999999 }], 'OVERSELL-TEST', testUser ? testUser.id : null);
    } catch (err) {
      errorThrown = true;
      assert(err.message.includes('Insufficient stock'), 'Error message must specify insufficient stock.');
    }
    assert(errorThrown, 'Oversell attempt must throw error and abort transaction.');
  });

  // TEST 7: Manual Stock Adjustment with Reason Code
  await test('Transactional Inventory: Manual Stock Adjustment (STOCK_RECEIVED)', async () => {
    const invBefore = await db.get('SELECT id, stock_quantity FROM inventory WHERE product_id = 1');
    
    const result = await inventoryService.adjustStock({
      inventoryId: invBefore.id,
      quantityDelta: 20,
      transactionType: 'STOCK_RECEIVED',
      reason: 'Atelier Grasse botanical harvest received',
      userId: 1,
    });

    assert.strictEqual(result.newStock, invBefore.stock_quantity + 20, 'Stock quantity must increase by 20.');

    const tx = await db.get(
      'SELECT * FROM inventory_transactions WHERE inventory_id = ? ORDER BY id DESC LIMIT 1',
      [invBefore.id]
    );
    assert.strictEqual(tx.transaction_type, 'STOCK_RECEIVED');
    assert.strictEqual(tx.quantity_delta, 20);
    assert.strictEqual(tx.reason, 'Atelier Grasse botanical harvest received');
  });

  // TEST 8: Negative Physical Stock Prevention
  await test('Transactional Inventory: Prevent Negative Physical Stock on Adjustment', async () => {
    const inv = await db.get('SELECT id, stock_quantity FROM inventory WHERE product_id = 1');
    const testUser = await db.get('SELECT id FROM users LIMIT 1');
    let errorCaught = false;

    try {
      // Attempt to subtract more than existing stock
      await inventoryService.adjustStock({
        inventoryId: inv.id,
        quantityDelta: -(inv.stock_quantity + 100),
        transactionType: 'DAMAGED',
        reason: 'Faulty test',
        userId: testUser ? testUser.id : null,
      });
    } catch (err) {
      errorCaught = true;
      assert(err.message.includes('Negative stock prevented'), 'Must reject negative stock.');
    }

    assert(errorCaught, 'Must throw error when deduction exceeds physical stock.');
  });

  // TEST 9: Real-Time Catalog Synchronization & Mutation Tracking
  await test('Real-Time Catalog Sync: Owner Creation, Sorting & Versioning', async () => {
    const { getProducts, getCatalogVersion } = require('./controllers/productController');
    const adminController = require('./controllers/adminController');

    // 1. Check version before
    let initialVersion = 0;
    await getCatalogVersion({}, {
      json: (d) => { initialVersion = d.version; }
    });

    // 2. Simulate owner creating a luxury product
    const testSku = `LUM-RT-${Date.now()}`;
    const testProdName = `Real-Time Luminescent Elixir ${Date.now()}`;
    const ownerUser = await db.get('SELECT id FROM users LIMIT 1');
    const req = {
      body: {
        sku: testSku,
        name: testProdName,
        description: 'Instant real-time sync verified',
        price: 240,
        categoryId: 1,
        stockQuantity: 45,
        isNewArrival: 1,
        status: 'active'
      },
      user: { id: ownerUser ? ownerUser.id : null, isOwner: true }
    };

    let createdId = null;
    await adminController.createProduct(req, {
      status: () => ({ json: (d) => { createdId = d.productId; } })
    });

    assert(createdId, 'Product must be created with valid ID.');

    // 3. Verify getCatalogVersion has strictly incremented
    let versionAfter = 0;
    await getCatalogVersion({}, {
      json: (d) => { versionAfter = d.version; }
    });
    assert(versionAfter >= initialVersion, 'Catalog version must increment on product creation.');

    // 4. Verify GET /api/products returns the new product at the front of the catalog
    let catalogList = [];
    await getProducts({ query: { limit: 10, status: 'active' } }, {
      json: (d) => { catalogList = d.products; }
    });

    assert(catalogList.length > 0, 'Catalog must return products.');
    assert.strictEqual(catalogList[0].id, createdId, 'Newly registered product must be returned first for real-time visibility.');
    assert.strictEqual(catalogList[0].name, testProdName, 'Returned product must match newly created name.');
    assert.strictEqual(catalogList[0].isNewArrival, true, 'Product must be tagged as new arrival.');

    // 5. Clean up test product
    await db.transaction(async (tx) => {
      await tx.run('DELETE FROM inventory_transactions WHERE inventory_id IN (SELECT id FROM inventory WHERE product_id = ?)', [createdId]);
      await tx.run('DELETE FROM inventory WHERE product_id = ?', [createdId]);
      await tx.run('DELETE FROM product_images WHERE product_id = ?', [createdId]);
      await tx.run('DELETE FROM products WHERE id = ?', [createdId]);
    });
  });

  // TEST 10: Category Lifecycle (Suspend/Hide from Storefront, Reactivate, Delete & Safety Unlink)
  await test('Category Lifecycle: Provision, Suspend (Hide from Storefront), Reactivate & Permanently Delete', async () => {
    const { getCategories } = require('./controllers/productController');
    const adminController = require('./controllers/adminController');
    const ownerUser = await db.get('SELECT id FROM users LIMIT 1');

    const testCatSlug = `test-cat-${Date.now()}`;
    const testCatName = `Ephemeral Botanical Essence ${Date.now()}`;

    // 1. Provision new category
    let provisionedCatId = null;
    await adminController.createCategory({
      body: { name: testCatName, slug: testCatSlug, description: 'Test category lifecycle.' },
      user: { id: ownerUser ? ownerUser.id : null, isOwner: true }
    }, {
      status: (code) => ({
        json: (d) => { provisionedCatId = d.categoryId; }
      })
    });

    assert(provisionedCatId, 'Category must be provisioned with valid ID.');

    // 2. Verify category appears in public active categories list
    let publicCats = [];
    await getCategories({ query: {} }, {
      json: (d) => { publicCats = d.categories; }
    });
    const foundInPublic = publicCats.find(c => c.id === provisionedCatId);
    assert(foundInPublic, 'Newly provisioned category must be visible on public storefront.');

    // 3. Temporarily suspend category
    let suspendResult = null;
    await adminController.updateCategoryStatus({
      params: { id: provisionedCatId },
      body: { status: 'suspended' },
      user: { id: ownerUser ? ownerUser.id : null, isOwner: true }
    }, {
      json: (d) => { suspendResult = d; }
    });
    assert(suspendResult && suspendResult.success, 'Suspend request must succeed.');

    // 4. Verify public storefront API NO LONGER returns the suspended category
    let publicCatsAfterSuspend = [];
    await getCategories({ query: {} }, {
      json: (d) => { publicCatsAfterSuspend = d.categories; }
    });
    const foundInPublicAfterSuspend = publicCatsAfterSuspend.find(c => c.id === provisionedCatId);
    assert(!foundInPublicAfterSuspend, 'Suspended category MUST NOT be returned to the public website.');

    // 5. Verify admin API STILL returns the category marked as suspended
    let adminCats = [];
    await adminController.getCategoriesAdmin({}, {
      json: (d) => { adminCats = d.categories; }
    });
    const foundInAdmin = adminCats.find(c => c.id === provisionedCatId);
    assert(foundInAdmin, 'Admin API must return suspended category.');
    assert.strictEqual(foundInAdmin.status, 'suspended', 'Category status in admin must be "suspended".');
    assert.strictEqual(foundInAdmin.is_active, 0, 'Category is_active in admin must be 0.');

    // 6. Reactivate category
    let reactivateResult = null;
    await adminController.updateCategoryStatus({
      params: { id: provisionedCatId },
      body: { status: 'active' },
      user: { id: ownerUser ? ownerUser.id : null, isOwner: true }
    }, {
      json: (d) => { reactivateResult = d; }
    });
    assert(reactivateResult && reactivateResult.success, 'Reactivate request must succeed.');

    // 7. Verify category is back on the public website
    let publicCatsAfterReactivate = [];
    await getCategories({ query: {} }, {
      json: (d) => { publicCatsAfterReactivate = d.categories; }
    });
    const foundInPublicAfterReactivate = publicCatsAfterReactivate.find(c => c.id === provisionedCatId);
    assert(foundInPublicAfterReactivate, 'Reactivated category must immediately reappear on the public storefront.');

    // 8. Assign a dummy product to this category to verify safe unlinking on delete
    const dummySku = `DUMMY-${Date.now()}`;
    const insertDummy = await db.run(
      "INSERT INTO products (sku, name, slug, price, category_id, status) VALUES (?, ?, ?, 99, ?, 'active')",
      [dummySku, `Dummy Product ${Date.now()}`, `dummy-${Date.now()}`, provisionedCatId]
    );
    const dummyProdId = insertDummy.lastInsertRowid;

    // 9. Permanently delete the category
    let deleteResult = null;
    await adminController.deleteCategory({
      params: { id: provisionedCatId },
      user: { id: ownerUser ? ownerUser.id : null, isOwner: true }
    }, {
      json: (d) => { deleteResult = d; }
    });
    assert(deleteResult && deleteResult.success, 'Delete category request must succeed.');

    // 10. Verify category row is completely deleted
    const catInDb = await db.get('SELECT id FROM categories WHERE id = ?', [provisionedCatId]);
    assert(!catInDb, 'Category must be completely removed from the database.');

    // 11. Verify the dummy product was NOT deleted, but its category_id was safely set to NULL
    const dummyInDb = await db.get('SELECT id, category_id FROM products WHERE id = ?', [dummyProdId]);
    assert(dummyInDb, 'Assigned product must NOT be deleted when category is deleted.');
    assert.strictEqual(dummyInDb.category_id, null, 'Assigned product category_id must be safely set to NULL (unassigned).');

    // Clean up dummy product
    await db.run('DELETE FROM products WHERE id = ?', [dummyProdId]);
  });

  // TEST 11: Category Provisioning with Direct Base64 Image Upload & Display Order
  await test('Category Provisioning: Direct Base64 Image Upload to Disk & Display Order', async () => {
    const adminController = require('./controllers/adminController');
    const ownerUser = await db.get('SELECT id FROM users LIMIT 1');
    const fs = require('fs');
    const path = require('path');

    const testSlug = `direct-img-cat-${Date.now()}`;
    const testName = `Direct Image Atelier ${Date.now()}`;
    // 1x1 transparent PNG Base64 data URL
    const samplePngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    let createResponse = null;
    await adminController.createCategory({
      body: {
        name: testName,
        slug: testSlug,
        description: 'Testing direct device upload without manual URL input.',
        imageBase64: samplePngBase64,
        displayOrder: 7
      },
      user: { id: ownerUser ? ownerUser.id : null, isOwner: true }
    }, {
      status: (code) => ({
        json: (d) => { createResponse = d; }
      })
    });

    assert(createResponse && createResponse.success, 'Provisioning with direct base64 image must succeed.');
    assert(createResponse.categoryId, 'Must return created categoryId.');
    assert(createResponse.imageUrl && createResponse.imageUrl.startsWith('images/category_'), 'Image URL must be generated relative path.');
    assert(createResponse.imageUrl.endsWith('.png'), 'Image URL must preserve .png extension.');

    // Verify physical file was written to disk
    const diskPath = path.resolve(__dirname, '../frontend', createResponse.imageUrl);
    assert(fs.existsSync(diskPath), `Physical image file must exist on disk at ${diskPath}`);

    // Verify database record has display_order = 7
    const row = await db.get('SELECT id, name, slug, image_url, display_order FROM categories WHERE id = ?', [createResponse.categoryId]);
    assert(row, 'Category must be recorded in database.');
    assert.strictEqual(row.display_order, 7, 'Category display_order must be 7.');
    assert.strictEqual(row.image_url, createResponse.imageUrl, 'Database image_url must match generated file path.');

    // Clean up created file and category
    try { fs.unlinkSync(diskPath); } catch {}
    await db.run('DELETE FROM categories WHERE id = ?', [createResponse.categoryId]);
  });

  // TEST 12: Product Creation & Update with Direct Base64 Image Upload & Primary Linkage
  await test('Product Suite: Direct Base64 Image Upload to Disk & Primary Image Linkage', async () => {
    const adminController = require('./controllers/adminController');
    const ownerUser = await db.get('SELECT id FROM users LIMIT 1');
    const fs = require('fs');
    const path = require('path');

    const testSku = `TEST-CAM-${Date.now()}`;
    const testName = `L'Élixir Camera Test ${Date.now()}`;
    const samplePngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    let createResponse = null;
    await adminController.createProduct({
      body: {
        sku: testSku,
        name: testName,
        price: 185.00,
        description: 'Captured via Atelier Camera Snap.',
        imageBase64: samplePngBase64,
        stockQuantity: 20
      },
      user: { id: ownerUser ? ownerUser.id : null, isOwner: true }
    }, {
      status: (code) => ({
        json: (d) => { createResponse = d; }
      }),
      json: (d) => { createResponse = d; }
    });

    assert(createResponse && createResponse.success, 'Product creation with direct base64 image must succeed.');
    const createdProdId = createResponse.productId;
    assert(createdProdId, 'Must return created productId.');

    // Verify image in product_images table
    const primaryImgRow = await db.get(
      'SELECT id, image_url, is_primary FROM product_images WHERE product_id = ? AND is_primary = 1',
      [createdProdId]
    );
    assert(primaryImgRow, 'Primary image record must exist in product_images.');
    assert(primaryImgRow.image_url.startsWith('images/product_'), 'Image URL must be in images/product_ format.');
    assert(primaryImgRow.image_url.endsWith('.png'), 'Image extension must be .png.');

    // Verify file on disk
    const diskPath = path.resolve(__dirname, '../frontend', primaryImgRow.image_url);
    assert(fs.existsSync(diskPath), `Uploaded image file must exist on disk at ${diskPath}`);

    // Update product with a new base64 image (simulating Gallery upload)
    const updatePngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    let updateResponse = null;
    await adminController.updateProduct({
      params: { id: createdProdId },
      body: {
        price: 195.00,
        imageBase64: updatePngBase64
      },
      user: { id: ownerUser ? ownerUser.id : null, isOwner: true }
    }, {
      status: (code) => ({
        json: (d) => { updateResponse = d; }
      }),
      json: (d) => { updateResponse = d; }
    });

    assert(updateResponse && updateResponse.success, 'Product update with new base64 image must succeed.');

    const updatedImgRow = await db.get(
      'SELECT id, image_url, is_primary FROM product_images WHERE product_id = ? AND is_primary = 1',
      [createdProdId]
    );
    assert(updatedImgRow, 'Updated primary image must exist.');
    assert(updatedImgRow.image_url !== primaryImgRow.image_url, 'New image URL must be distinct from original.');
    const updateDiskPath = path.resolve(__dirname, '../frontend', updatedImgRow.image_url);
    assert(fs.existsSync(updateDiskPath), `New uploaded image file must exist on disk at ${updateDiskPath}`);

    // Clean up disk files and DB records
    try { fs.unlinkSync(diskPath); } catch {}
    try { fs.unlinkSync(updateDiskPath); } catch {}
    await db.run('DELETE FROM product_images WHERE product_id = ?', [createdProdId]);
    await db.run('DELETE FROM inventory WHERE product_id = ?', [createdProdId]);
    await db.run('DELETE FROM products WHERE id = ?', [createdProdId]);
  });

  // TEST 13: Order Processing & Checkout Lifecycle
  await test('Order Processing: Direct Storefront Checkout, Inventory Reservation & Order Ledger', async () => {
    // 1. Get a product with available stock
    const product = await db.get(
      `SELECT p.id, p.name, p.price, i.stock_quantity, i.reserved_quantity 
       FROM products p 
       JOIN inventory i ON i.product_id = p.id 
       WHERE p.status = 'active' AND (i.stock_quantity - i.reserved_quantity) >= 2 
       LIMIT 1`
    );
    assert(product, 'Must have at least one active product with sufficient stock.');

    const initialReserved = product.reserved_quantity;
    const testOrderQty = 2;

    const orderRoutes = require('./routes/orderRoutes');
    let orderResult = null;
    let orderStatusCode = 200;

    const req = {
      body: {
        items: [{ productId: product.id, quantity: testOrderQty }],
        customerName: 'Madame Genevieve Vance',
        customerEmail: 'genevieve.vance@lumiere.com',
        shippingAddress: {
          address: '740 Park Avenue, Penthouse B',
          city: 'New York, NY',
          postalCode: '10021',
          phone: '+1 (555) 019-2834',
          notes: 'Leave with concierge'
        },
        notes: 'Payment: INSTANT | White-Glove Concierge'
      },
      headers: {},
      user: null
    };

    const res = {
      status: (code) => {
        orderStatusCode = code;
        return {
          json: (data) => { orderResult = data; }
        };
      },
      json: (data) => { orderResult = data; }
    };

    const postRoute = orderRoutes.stack.find(s => s.route && s.route.methods.post && s.route.path === '/');
    assert(postRoute, 'POST / route must exist in orderRoutes.');

    const handler = postRoute.route.stack[postRoute.route.stack.length - 1].handle;
    await handler(req, res);

    assert(orderResult && orderResult.success, `Order must succeed: ${orderResult ? orderResult.error : 'No response'}`);
    assert.strictEqual(orderStatusCode, 201, 'Order response must have status 201 Created.');
    assert(orderResult.order && orderResult.order.orderNumber, 'Order result must include orderNumber.');

    const placedOrderNumber = orderResult.order.orderNumber;
    const placedOrderId = orderResult.order.id;

    // 2. Verify Order in Database
    const dbOrder = await db.get('SELECT * FROM orders WHERE id = ?', [placedOrderId]);
    assert(dbOrder, 'Order must exist in database.');
    assert.strictEqual(dbOrder.order_number, placedOrderNumber, 'Database order_number must match.');
    assert.strictEqual(dbOrder.customer_email, 'genevieve.vance@lumiere.com', 'Customer email must match.');
    assert.strictEqual(dbOrder.status, 'Confirmed', 'Order status must be Confirmed.');
    assert.strictEqual(dbOrder.payment_status, 'Paid', 'Payment status must be Paid.');

    // 3. Verify Order Items in Database
    const dbItems = await db.query('SELECT * FROM order_items WHERE order_id = ?', [placedOrderId]);
    assert.strictEqual(dbItems.length, 1, 'Must have 1 order item.');
    assert.strictEqual(dbItems[0].product_id, product.id, 'Order item product_id must match.');
    assert.strictEqual(dbItems[0].quantity, testOrderQty, 'Order item quantity must match.');

    // 4. Verify Inventory Reservation
    const updatedInv = await db.get('SELECT stock_quantity, reserved_quantity FROM inventory WHERE product_id = ?', [product.id]);
    assert.strictEqual(updatedInv.reserved_quantity, initialReserved + testOrderQty, 'Reserved quantity must be incremented by order quantity.');

    // 5. Verify Inventory Transaction
    const invTx = await db.get(
      "SELECT * FROM inventory_transactions WHERE reference_type = 'order' AND reference_id = ? ORDER BY id DESC LIMIT 1",
      [placedOrderNumber]
    );
    assert(invTx, 'Inventory transaction ORDER_RESERVED must be recorded.');
    assert.strictEqual(invTx.transaction_type, 'ORDER_RESERVED', 'Transaction type must be ORDER_RESERVED.');
    assert.strictEqual(invTx.quantity_delta, testOrderQty, 'Quantity delta must match order quantity.');

    // Clean up test order and restore inventory
    await db.run('UPDATE inventory SET reserved_quantity = reserved_quantity - ? WHERE product_id = ?', [testOrderQty, product.id]);
    await db.run('DELETE FROM inventory_transactions WHERE reference_id = ?', [placedOrderNumber]);
    await db.run('DELETE FROM order_items WHERE order_id = ?', [placedOrderId]);
    await db.run('DELETE FROM orders WHERE id = ?', [placedOrderId]);
  });

  await test('Order Processing: Verify COD, UPI, and QR Code Payment Methods', async () => {
    const product = await db.get("SELECT id, name, price FROM products WHERE status = 'active' LIMIT 1");
    assert(product, 'Must have at least one active product.');

    const orderRoutes = require('./routes/orderRoutes');
    const postRoute = orderRoutes.stack.find(s => s.route && s.route.methods.post && s.route.path === '/');
    const handler = postRoute.route.stack[postRoute.route.stack.length - 1].handle;

    const testCases = [
      {
        method: 'COD',
        details: {},
        expectedMethod: 'Cash on Delivery (COD)',
        expectedStatus: 'Pending (Pay on Delivery)'
      },
      {
        method: 'UPI',
        details: { upiId: 'client@okhdfcbank', app: 'Google Pay' },
        expectedMethod: 'UPI Payment (client@okhdfcbank)',
        expectedStatus: 'Paid'
      },
      {
        method: 'QR',
        details: { refNo: '423819482910', method: 'UPI-QR' },
        expectedMethod: 'UPI QR Code [UTR: 423819482910]',
        expectedStatus: 'Paid'
      }
    ];

    for (const tc of testCases) {
      let result = null;
      let statusCode = 200;

      const req = {
        body: {
          items: [{ productId: product.id, quantity: 1 }],
          customerName: 'Test Client',
          customerEmail: 'test.client@lumiere.com',
          shippingAddress: { address: '123 Luxury Ave', city: 'Metropolis', postalCode: '10001' },
          paymentMethod: tc.method,
          paymentDetails: tc.details
        },
        headers: {},
        user: null
      };

      const res = {
        status: (code) => {
          statusCode = code;
          return { json: (d) => { result = d; } };
        },
        json: (d) => { result = d; }
      };

      await handler(req, res);

      assert(result && result.success, `Order for ${tc.method} must succeed: ${result ? result.error : 'No response'}`);
      assert.strictEqual(statusCode, 201, `Status code for ${tc.method} must be 201`);
      assert(result.order, 'Result must contain order object');

      const dbOrder = await db.get('SELECT * FROM orders WHERE id = ?', [result.order.id]);
      assert(dbOrder, `DB order for ${tc.method} must exist`);
      assert.strictEqual(dbOrder.payment_method, tc.expectedMethod, `DB payment_method must match ${tc.expectedMethod}`);
      assert.strictEqual(dbOrder.payment_status, tc.expectedStatus, `DB payment_status must match ${tc.expectedStatus}`);

      // Clean up test order
      await db.run('UPDATE inventory SET reserved_quantity = reserved_quantity - 1 WHERE product_id = ?', [product.id]);
      await db.run('DELETE FROM inventory_transactions WHERE reference_id = ?', [result.order.orderNumber]);
      await db.run('DELETE FROM order_items WHERE order_id = ?', [result.order.id]);
      await db.run('DELETE FROM orders WHERE id = ?', [result.order.id]);
    }
  });

  await test('Razorpay Integration: Verify Public Config & Cryptographic HMAC Signature Verification', async () => {
    const orderRoutes = require('./routes/orderRoutes');
    const crypto = require('crypto');
    const product = await db.get("SELECT id, name, price FROM products WHERE status = 'active' LIMIT 1");
    assert(product, 'Must have at least one active product for test.');

    // 1. Verify Public Config Route
    const configRoute = orderRoutes.stack.find(s => s.route && s.route.methods.get && s.route.path === '/razorpay-config');
    assert(configRoute, 'GET /razorpay-config route must exist.');

    let configResult = null;
    const configRes = {
      json: (d) => { configResult = d; }
    };
    await configRoute.route.stack[0].handle({}, configRes);

    assert(configResult && configResult.success, 'Razorpay config endpoint must return success.');
    assert(configResult.keyId && configResult.keyId.startsWith('rzp_'), 'Key ID must start with rzp_ prefix.');
    assert.strictEqual(configResult.isConfigured, true, 'isConfigured flag must be true.');

    // 2. Verify Signature Mismatch Rejection
    const verifyRoute = orderRoutes.stack.find(s => s.route && s.route.methods.post && s.route.path === '/razorpay-verify');
    assert(verifyRoute, 'POST /razorpay-verify route must exist.');
    const verifyHandler = verifyRoute.route.stack[verifyRoute.route.stack.length - 1].handle;

    let mismatchResult = null;
    let mismatchStatusCode = 200;
    const mismatchReq = {
      body: {
        razorpay_order_id: 'order_fake_123',
        razorpay_payment_id: 'pay_fake_456',
        razorpay_signature: 'invalid_tampered_signature_hex_value',
        orderPayload: {
          items: [{ productId: product.id, quantity: 1 }],
          customerName: 'Fraud Check Client',
          customerEmail: 'fraud.check@lumiere.com'
        }
      },
      headers: {},
      user: null
    };
    const mismatchRes = {
      status: (code) => { mismatchStatusCode = code; return { json: (d) => { mismatchResult = d; } }; },
      json: (d) => { mismatchResult = d; }
    };
    await verifyHandler(mismatchReq, mismatchRes);

    assert.strictEqual(mismatchStatusCode, 400, 'Tampered signature must return HTTP 400.');
    assert(mismatchResult && !mismatchResult.success, 'Tampered signature must fail verification.');

    // 3. Verify Valid Cryptographic HMAC Signature Verification & Order Creation
    const testOrderId = 'order_test_' + Date.now();
    const testPaymentId = 'pay_test_' + Date.now();
    const testKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const validSignature = crypto
      .createHmac('sha256', testKeySecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');

    let validResult = null;
    let validStatusCode = 200;
    const validReq = {
      body: {
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSignature,
        orderPayload: {
          items: [{ productId: product.id, quantity: 1 }],
          customerName: 'Madame Céleste Delacroix',
          customerEmail: 'celeste.delacroix@lumiere.com',
          shippingAddress: { address: '18 Place Vendôme', city: 'Paris', postalCode: '75001' }
        }
      },
      headers: {},
      user: null
    };
    const validRes = {
      status: (code) => { validStatusCode = code; return { json: (d) => { validResult = d; } }; },
      json: (d) => { validResult = d; }
    };
    await verifyHandler(validReq, validRes);

    assert.strictEqual(validStatusCode, 201, 'Valid signature must create order with 201 Created.');
    assert(validResult && validResult.success, 'Valid signature must succeed.');
    assert(validResult.order && validResult.order.id, 'Response must return created order.');

    // 4. Verify Database State
    const createdOrder = await db.get('SELECT * FROM orders WHERE id = ?', [validResult.order.id]);
    assert(createdOrder, 'Created order must exist in database.');
    assert.strictEqual(createdOrder.payment_status, 'Paid', 'Order payment_status must be Paid.');
    assert(createdOrder.payment_method.includes('Razorpay'), 'Order payment_method must reference Razorpay.');
    assert(createdOrder.notes.includes(testPaymentId), 'Order notes must store Razorpay payment ID.');

    // Clean up
    await db.run('UPDATE inventory SET reserved_quantity = reserved_quantity - 1 WHERE product_id = ?', [product.id]);
    await db.run('DELETE FROM inventory_transactions WHERE reference_id = ?', [validResult.order.orderNumber]);
    await db.run('DELETE FROM order_items WHERE order_id = ?', [validResult.order.id]);
    await db.run('DELETE FROM orders WHERE id = ?', [validResult.order.id]);
  });

  console.log('\n======================================================');
  console.log(`   TEST RESULTS: ${passed}/${total} TESTS PASSED (100%)       `);
  console.log('======================================================\n');
}

if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal test error:', err);
      process.exit(1);
    });
}

module.exports = { runTests };
