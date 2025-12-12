const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

// Get product reviews (public)
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes
router.use(authenticate);

// Add review
router.post('/product/:productId', reviewController.addReview);

// Update and delete own reviews
router.put('/:reviewId', reviewController.updateReview);
router.delete('/:reviewId', reviewController.deleteReview);

// Mark helpful
router.post('/:reviewId/helpful', reviewController.markHelpful);

module.exports = router;
