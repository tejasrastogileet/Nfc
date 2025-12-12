const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refundController');
const { authenticate, isAdmin } = require('../middleware/auth');

// User routes (authenticated)
router.use(authenticate);

router.get('/', refundController.getRefundRequests);
router.post('/', refundController.createRefundRequest);
router.get('/:requestId', refundController.getRefundRequestDetails);

// Admin routes
router.get('/admin/all', isAdmin, refundController.getAllRefundRequests);
router.patch('/:requestId/status', isAdmin, refundController.updateRefundStatus);

module.exports = router;
