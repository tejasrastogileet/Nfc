const { PrismaClient } = require('@prisma/client');
const { generateInvoice, deleteInvoice } = require('../utils/invoice');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

/**
 * Generate invoice for an order
 */
const generateInvoiceForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Generate invoice
    const invoice = await generateInvoice(order, order.user, order.items);

    res.json({
      success: true,
      message: 'Invoice generated successfully',
      data: {
        invoiceUrl: invoice.fileUrl,
        fileName: invoice.fileName
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Download invoice
 */
const downloadInvoice = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, '../invoices', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading invoice:', err);
        res.status(500).json({
          success: false,
          message: 'Error downloading invoice'
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  generateInvoiceForOrder,
  downloadInvoice
};



