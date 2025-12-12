const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get wishlist
router.get('/', wishlistController.getWishlist);

// Add to wishlist
router.post('/add', wishlistController.addToWishlist);

// Remove from wishlist
router.delete('/item/:itemId', wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/', wishlistController.clearWishlist);

module.exports = router;
