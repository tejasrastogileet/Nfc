const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// Protected routes (require authentication)
router.use(authenticate);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Password management
router.post('/change-password', userController.changePassword);
router.post('/request-reset', userController.requestPasswordReset);
router.post('/reset-password', userController.resetPassword);

// Addresses
router.get('/addresses', userController.getAddresses);
router.post('/addresses', userController.addAddress);
router.put('/addresses/:addressId', userController.updateAddress);
router.delete('/addresses/:addressId', userController.deleteAddress);

// Newsletter
router.post('/newsletter/toggle', userController.toggleNewsletterSubscription);

module.exports = router;
