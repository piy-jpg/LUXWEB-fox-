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
router.get('/analytics/detailed', requirePermission('analytics.view'), adminController.getDetailedAnalytics);

// 2. Products Management
router.get('/products', requirePermission('products.view'), adminController.getProducts);
router.post('/products', requirePermission('products.create'), adminController.createProduct);
router.put('/products/:id', requirePermission('products.edit'), adminController.updateProduct);
router.put('/products/:id/restore', requirePermission('products.edit'), adminController.restoreProduct);
router.delete('/products/:id', requirePermission('products.delete'), adminController.archiveProduct);
router.post('/categories', requirePermission('products.create'), adminController.createCategory);
router.post('/upload-image', requirePermission('products.create'), adminController.uploadImage);
router.get('/categories', requirePermission('products.view'), adminController.getCategoriesAdmin);
router.put('/categories/:id/status', requirePermission('products.edit'), adminController.updateCategoryStatus);
router.delete('/categories/:id', requirePermission('products.delete'), adminController.deleteCategory);
router.get('/variants', requirePermission('products.view'), adminController.getProductVariants);
router.post('/variants', requirePermission('products.edit'), adminController.createProductVariant);
router.delete('/variants/:id', requirePermission('products.edit'), adminController.deleteProductVariant);

// 3. Inventory Management (Transactional)
router.get('/inventory', requirePermission('inventory.view'), adminController.getInventory);
router.get('/inventory/transactions', requirePermission('inventory.view'), adminController.getAllInventoryTransactions);
router.get('/inventory/:id/history', requirePermission('inventory.view'), adminController.getInventoryHistory);
router.post('/inventory/adjust', requirePermission('inventory.adjust'), adminController.adjustInventory);

// 4. Orders Management
router.get('/orders', requirePermission('orders.view'), adminController.getOrders);
router.get('/orders/:id', requirePermission('orders.view'), adminController.getOrderDetails);
router.put('/orders/:id/status', requirePermission('orders.update'), adminController.updateOrderStatus);
router.delete('/orders/:id', requirePermission('orders.update'), adminController.deleteOrder);
router.post('/orders/:id/restore', requirePermission('orders.update'), adminController.restoreOrder);

// 5. Customers Directory
router.get('/customers', requirePermission('customers.view'), adminController.getCustomers);
router.get('/customers/:id', requirePermission('customers.view'), adminController.getCustomerDetails);
router.get('/customers/:id/orders', requirePermission('customers.view'), adminController.getCustomerOrders);
router.put('/customers/:id', requirePermission('customers.view'), adminController.updateCustomer);
router.put('/customers/:id/status', requirePermission('customers.view'), adminController.updateCustomerStatus);
router.delete('/customers/:id', requirePermission('customers.view'), adminController.deleteCustomer);
router.post('/customers/bulk-delete', requirePermission('customers.view'), adminController.bulkDeleteCustomers);

// 6. Staff & RBAC Management (Owner exclusive)
router.get('/staff', requirePermission('staff.manage'), adminController.getStaff);
router.post('/staff', requirePermission('staff.manage'), adminController.createStaff);
router.put('/staff/:id', requirePermission('staff.manage'), adminController.updateStaff);
router.delete('/staff/:id', requirePermission('staff.manage'), adminController.deleteStaff);
router.post('/staff/:id/reset-password', requirePermission('staff.manage'), adminController.resetStaffPassword);
router.get('/staff/:id/activity', requirePermission('staff.manage'), adminController.getStaffActivity);
router.get('/staff-audit', requirePermission('staff.manage'), adminController.getStaffAuditLogs);
router.put('/roles/:id/permissions', requirePermission('staff.manage'), adminController.updateRolePermissions);

// 7. Settings & Audit Logs (Owner exclusive)
router.get('/settings', requirePermission('settings.manage'), adminController.getStoreSettings);
router.put('/settings', requirePermission('settings.manage'), adminController.updateStoreSettings);
router.post('/settings/test-email', requirePermission('settings.manage'), adminController.sendTestEmail);
router.post('/settings/clear-cache', requirePermission('settings.manage'), adminController.clearCache);
router.post('/settings/reset', requirePermission('settings.manage'), adminController.resetStoreSettings);
router.get('/audit-logs', requirePermission('settings.manage'), adminController.getAuditLogs);

// 8. Executive Reports & Registers
router.get('/reports/data', adminController.getReportData);
router.get('/reports/saved', adminController.getSavedReports);
router.post('/reports/save', adminController.saveCustomReport);
router.delete('/reports/:id', requirePermission('analytics.view'), adminController.deleteSavedReport);

module.exports = router;


