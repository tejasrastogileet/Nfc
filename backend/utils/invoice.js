const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Ensure invoices directory exists
const invoicesDir = path.join(__dirname, '../invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

/**
 * Generate PDF invoice for an order
 */
const generateInvoice = async (order, user, orderItems) => {
  return new Promise((resolve, reject) => {
    try {
      const invoiceId = uuidv4();
      const fileName = `invoice_${order.id}_${invoiceId}.pdf`;
      const filePath = path.join(invoicesDir, fileName);

      const doc = new PDFDocument({ margin: 50 });

      // Pipe PDF to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('INVOICE', { align: 'center' });
      doc.moveDown();

      // Invoice details
      doc.fontSize(12);
      doc.text(`Invoice #: ${order.id.substring(0, 8).toUpperCase()}`, { align: 'left' });
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'left' });
      doc.moveDown();

      // Customer details
      doc.text('Bill To:', { underline: true });
      doc.text(`Name: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      doc.moveDown();

      // Order details
      doc.text('Order Details:', { underline: true });
      doc.text(`Order Status: ${order.orderStatus}`);
      doc.text(`Payment Status: ${order.paymentStatus}`);
      doc.moveDown();

      // Items table header
      const tableTop = doc.y;
      doc.fontSize(10);
      doc.text('Item', 50, tableTop);
      doc.text('Quantity', 200, tableTop);
      doc.text('Price', 300, tableTop);
      doc.text('Total', 400, tableTop);

      // Draw line
      doc.moveTo(50, doc.y + 5)
         .lineTo(550, doc.y + 5)
         .stroke();

      // Items
      let yPosition = doc.y + 10;
      orderItems.forEach((item) => {
        doc.text(item.product.name.substring(0, 30), 50, yPosition);
        doc.text(item.quantity.toString(), 200, yPosition);
        doc.text(`₹${item.price.toFixed(2)}`, 300, yPosition);
        doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, 400, yPosition);
        yPosition += 20;
      });

      // Totals
      doc.moveDown(2);
      const totalsY = doc.y;
      doc.text('Subtotal:', 300, totalsY);
      doc.text(`₹${(order.totalAmount + order.discountAmount).toFixed(2)}`, 400, totalsY);

      if (order.discountAmount > 0) {
        doc.text('Discount:', 300, totalsY + 20);
        doc.text(`-₹${order.discountAmount.toFixed(2)}`, 400, totalsY + 20);
      }

      doc.fontSize(12);
      doc.text('Total:', 300, totalsY + 40, { bold: true });
      doc.text(`₹${order.totalAmount.toFixed(2)}`, 400, totalsY + 40, { bold: true });

      // Footer
      doc.fontSize(10);
      doc.text('Thank you for your purchase!', 50, doc.page.height - 100, {
        align: 'center'
      });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        const fileUrl = `/api/invoice/download/${fileName}`;
        resolve({
          fileName,
          filePath,
          fileUrl
        });
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete invoice file
 */
const deleteInvoice = (fileName) => {
  const filePath = path.join(invoicesDir, fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  generateInvoice,
  deleteInvoice,
  invoicesDir
};



