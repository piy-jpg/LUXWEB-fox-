/**
 * Product Model Schema Definition
 */
class Product {
  constructor({ id, name, category, categoryLabel, desc, price, oldPrice = null, badge = null, badgeType = null, stars = 5, img, stock = 100 }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.categoryLabel = categoryLabel;
    this.desc = desc;
    this.price = price;
    this.oldPrice = oldPrice;
    this.badge = badge;
    this.badgeType = badgeType;
    this.stars = stars;
    this.img = img;
    this.stock = stock;
    this.createdAt = new Date();
  }
}

module.exports = Product;
