/**
 * Review Controller
 * Handles customer reviews retrieval and submission
 */
const REVIEWS = [
  { id: 1, author: 'Camille Laurent', location: 'Paris, France', rating: 5, verified: true, date: '2026-02-14', title: 'Life-changing radiance', comment: 'The Radiance Glow Serum gives an unbelievable glass-skin glow without feeling heavy or sticky. I receive compliments every single day!', category: 'skincare' },
  { id: 2, author: 'Elena Rostova', location: 'Milan, Italy', rating: 5, verified: true, date: '2026-01-28', title: 'Unmatched luxury texture', comment: 'The Velvet Lip Collection formula is silky, opaque in one swipe, and lasts through dinners. Pure elegance.', category: 'makeup' },
  { id: 3, author: 'Sophia Sterling', location: 'New York, USA', rating: 5, verified: true, date: '2026-02-02', title: 'My signature scent forever', comment: 'Noir d\'Or is captivating, warm and intoxicating. People stop me in the street to ask what perfume I am wearing.', category: 'fragrance' },
];

exports.getReviews = (req, res) => {
  const { rating, category } = req.query;
  let results = [...REVIEWS];

  if (rating) {
    results = results.filter(r => r.rating === parseInt(rating, 10));
  }

  if (category && category !== 'all') {
    results = results.filter(r => r.category === category);
  }

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
};

exports.addReview = (req, res) => {
  const { author, location, rating, title, comment, category } = req.body;

  if (!author || !comment || !rating) {
    return res.status(400).json({ success: false, message: 'Author, comment, and rating are required' });
  }

  const newReview = {
    id: REVIEWS.length + 1,
    author,
    location: location || 'Verified Buyer',
    rating: parseInt(rating, 10),
    verified: true,
    date: new Date().toISOString().split('T')[0],
    title: title || '',
    comment,
    category: category || 'general',
  };

  REVIEWS.unshift(newReview);

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    data: newReview,
  });
};
