/**
 * Order Model Schema Definition
 */
class Order {
  constructor({ id, customerEmail, items = [], totalAmount, status = 'pending', shippingAddress }) {
    this.id = id;
    this.customerEmail = customerEmail;
    this.items = items;
    this.totalAmount = totalAmount;
    this.status = status;
    this.shippingAddress = shippingAddress;
    this.createdAt = new Date();
  }
}

module.exports = Order;
