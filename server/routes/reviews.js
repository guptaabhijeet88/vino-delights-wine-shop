const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const count = reviews.length;
    const avgRating = count > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)
      : 0;

    res.json({ reviews, count, avgRating: Number(avgRating) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a review (auth required)
router.post('/:productId', auth, async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    // Check product exists
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check if user already reviewed this product
    const existing = await Review.findOne({
      user: req.user._id,
      product: req.params.productId
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      user: req.user._id,
      product: req.params.productId,
      rating,
      title,
      comment
    });
    await review.save();

    // Populate user name before responding
    await review.populate('user', 'name');

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete own review (auth required)
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
