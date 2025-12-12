const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.use(authenticate, isAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id', adminController.updateOrderStatus);
router.get('/low-stock', adminController.getLowStockProducts);
router.post('/low-stock/alerts', adminController.sendLowStockAlerts);
router.get('/users', adminController.getAllUsers);

module.exports = router;



