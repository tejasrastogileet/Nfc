const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send low stock alert email
 */
const sendLowStockAlert = async (product) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_FROM || process.env.EMAIL_USER, // Admin email
      subject: `Low Stock Alert: ${product.name}`,
      html: `
        <h2>Low Stock Alert</h2>
        <p>Product: <strong>${product.name}</strong></p>
        <p>Current Stock: <strong>${product.stock}</strong></p>
        <p>Category: ${product.category}</p>
        <p>Model: ${product.model || 'N/A'}</p>
        <p>Please restock this product soon.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Low stock alert sent for product: ${product.name}`);
  } catch (error) {
    console.error('Error sending low stock alert:', error);
    throw error;
  }
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmation = async (userEmail, order) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: userEmail,
      subject: `Order Confirmation - Order #${order.id.substring(0, 8)}`,
      html: `
        <h2>Order Confirmed</h2>
        <p>Thank you for your order!</p>
        <p>Order ID: ${order.id}</p>
        <p>Total Amount: ₹${order.totalAmount}</p>
        <p>Status: ${order.orderStatus}</p>
        <p>Payment Status: ${order.paymentStatus}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation sent to: ${userEmail}`);
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    // Don't throw error, just log it
  }
};

module.exports = {
  sendLowStockAlert,
  sendOrderConfirmation
};



