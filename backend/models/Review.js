/**
 * Review Model Schema Definition
 */
class Review {
  constructor({ id, author, location, rating = 5, verified = true, date = new Date().toISOString(), title, comment, category }) {
    this.id = id;
    this.author = author;
    this.location = location;
    this.rating = rating;
    this.verified = verified;
    this.date = date;
    this.title = title;
    this.comment = comment;
    this.category = category;
  }
}

module.exports = Review;
