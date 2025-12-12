const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/generate/:orderId', invoiceController.generateInvoiceForOrder);
router.get('/download/:fileName', invoiceController.downloadInvoice);

module.exports = router;



