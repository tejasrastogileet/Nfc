const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/create', orderController.createOrder);
router.post('/verify-payment', orderController.verifyPayment);
router.get('/my', orderController.getMyOrders);

module.exports = router;



