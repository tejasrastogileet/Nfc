const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public route
router.post('/validate', couponController.validateCoupon);

// Admin routes
router.use(authenticate, isAdmin);
router.post('/', couponController.createCoupon);
router.get('/', couponController.getAllCoupons);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;



