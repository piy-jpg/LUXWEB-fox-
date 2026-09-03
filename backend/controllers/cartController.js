/**
 * Cart Controller
 * Simulates cart operations for checkout calculation & validation
 */
exports.calculateTotal = (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'Items array required' });
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  res.json({
    success: true,
    data: {
      subtotal,
      shipping,
      freeShippingEligible: subtotal >= 100,
      total,
    },
  });
};
