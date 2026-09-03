/**
 * End-to-End API Route Tests
 */
const assert = require('assert');

async function testApi() {
  const baseUrl = 'http://localhost:5001';
  console.log('\nTesting Live HTTP Endpoints against', baseUrl);

  // 1. Customer Login
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@lumiere.com', password: 'Lumiere2026!' }),
  });
  const loginData = await loginRes.json();
  assert(loginData.success, 'Customer login should succeed');
  assert(loginData.token, 'Customer login should return JWT token');
  const custToken = loginData.token;
  console.log('✓ Customer Login successful');

  // 2. Customer Me Check
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${custToken}` },
  });
  const meData = await meRes.json();
  assert(meData.success, 'Me endpoint should succeed');
  assert.strictEqual(meData.user.email, 'customer@lumiere.com');
  console.log('✓ /api/auth/me verified');

  // 3. Customer Profile
  const profRes = await fetch(`${baseUrl}/api/account/profile`, {
    headers: { 'Authorization': `Bearer ${custToken}` },
  });
  const profData = await profRes.json();
  assert(profData.success, 'Customer profile should succeed');
  console.log('✓ /api/account/profile returned member info');

  // 4. Security Check: Customer accessing Admin -> Must be 403
  const adminAttempt = await fetch(`${baseUrl}/api/admin/overview`, {
    headers: { 'Authorization': `Bearer ${custToken}` },
  });
  assert.strictEqual(adminAttempt.status, 403, 'Customer must be blocked with 403 on /api/admin/overview');
  console.log('✓ Security: Customer blocked from /api/admin/overview with 403 Forbidden');

  // 5. Owner Login & Admin Overview
  const ownerLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner@lumiere.com', password: 'LumiereOwner2026!' }),
  });
  const ownerData = await ownerLogin.json();
  assert(ownerData.success, 'Owner login should succeed');
  const ownerToken = ownerData.token;

  const adminOverview = await fetch(`${baseUrl}/api/admin/overview`, {
    headers: { 'Authorization': `Bearer ${ownerToken}` },
  });
  assert.strictEqual(adminOverview.status, 200, 'Owner must access /api/admin/overview with 200');
  const overviewData = await adminOverview.json();
  assert(overviewData.metrics.totalRevenue >= 0, 'Overview metrics must include revenue');
  console.log('✓ Owner /api/admin/overview verified (Revenue: $' + overviewData.metrics.totalRevenue + ')');

  // 6. Storefront Checkout Flow
  const checkoutRes = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      items: [{ id: 1, qty: 1 }],
      customerName: 'Camille Rousseau',
      customerEmail: 'customer@lumiere.com',
      shippingAddress: { address: '740 Park Ave, New York, NY' },
    }),
  });
  const checkoutData = await checkoutRes.json();
  assert(checkoutData.success, 'Checkout should succeed');
  assert(checkoutData.order.orderNumber.startsWith('LUM-2026-'), 'Order number should be generated');
  console.log('✓ Storefront Checkout verified: Created Order #' + checkoutData.order.orderNumber);

  console.log('\nAll End-to-End API tests passed!\n');
}

testApi().catch(err => {
  console.error('API Test Failed:', err);
  process.exit(1);
});
