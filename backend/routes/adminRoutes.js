/**
 * Admin Management Routes
 * All routes strictly protected: Customers are denied.
 * Staff members are granted access strictly according to server-enforced permissions.
 */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole, requirePermission } = require('../middleware/auth');

// All admin routes require authentication and staff/owner role
router.use(authenticateToken);
router.use(requireRole('OWNER', 'MANAGER', 'INVENTORY_STAFF', 'ORDER_STAFF'));

// 1. Dashboard Overview & Analytics
router.get('/overview', requirePermission('analytics.view'), adminController.getOverview);
router.get('/analytics', requirePermission('analytics.view'), adminController.getOverview);

// 2. Products Management
router.get('/products', requirePermission('products.view'), adminController.getProducts);
router.post('/products', requirePermission('products.create'), adminController.createProduct);
router.put('/products/:id', requirePermission('products.edit'), adminController.updateProduct);
router.delete('/products/:id', requirePermission('products.delete'), adminController.archiveProduct);

// 3. Inventory Management (Transactional)
router.get('/inventory', requirePermission('inventory.view'), adminController.getInventory);
router.get('/inventory/:id/history', requirePermission('inventory.view'), adminController.getInventoryHistory);
router.post('/inventory/adjust', requirePermission('inventory.adjust'), adminController.adjustInventory);

// 4. Orders Management
router.get('/orders', requirePermission('orders.view'), adminController.getOrders);
router.get('/orders/:id', requirePermission('orders.view'), adminController.getOrderDetails);
router.put('/orders/:id/status', requirePermission('orders.update'), adminController.updateOrderStatus);

// 5. Customers Directory
router.get('/customers', requirePermission('customers.view'), adminController.getCustomers);
router.get('/customers/:id', requirePermission('customers.view'), adminController.getCustomerDetails);

// 6. Staff & RBAC Management (Owner exclusive)
router.get('/staff', requirePermission('staff.manage'), adminController.getStaff);
router.post('/staff', requirePermission('staff.manage'), adminController.createStaff);
router.put('/staff/:id', requirePermission('staff.manage'), adminController.updateStaff);
router.post('/staff/:id/reset-password', requirePermission('staff.manage'), adminController.resetStaffPassword);

// 7. Settings & Audit Logs (Owner exclusive)
router.get('/audit-logs', requirePermission('settings.manage'), adminController.getAuditLogs);

module.exports = router;
