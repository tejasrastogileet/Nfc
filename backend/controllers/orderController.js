const { PrismaClient } = require('@prisma/client');
const { createOrder: createRazorpayOrder, verifyPayment: verifyPaymentSignature } = require('../utils/razorpay');
const { sendOrderConfirmation } = require('../utils/email');

const prisma = new PrismaClient();

/**
 * Create order
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { couponCode } = req.body;

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate stock and calculate total
    let subtotal = 0;
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.name}`
        });
      }
      subtotal += item.product.price * item.quantity;
    }

    // Apply coupon if provided
    let discountAmount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode }
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        if (now >= coupon.validFrom && now <= coupon.validUntil) {
          if (coupon.minAmount && subtotal < coupon.minAmount) {
            return res.status(400).json({
              success: false,
              message: `Minimum order amount of ₹${coupon.minAmount} required for this coupon`
            });
          }

          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
          } else {
            discountAmount = coupon.discountValue;
          }

          if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({
              success: false,
              message: 'Coupon usage limit exceeded'
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            message: 'Coupon is not valid'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid coupon code'
        });
      }
    }

    const totalAmount = subtotal - discountAmount;

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(totalAmount);

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        razorpayOrderId: razorpayOrder.id,
        couponCode: couponCode || null,
        discountAmount,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Update coupon usage if applied
    if (coupon) {
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: process.env.RAZORPAY_KEY_ID
        }
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
 * Verify payment and update order
 */
const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'All payment details are required'
      });
    }

    // Verify payment signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
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

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID mismatch'
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        razorpayPaymentId: razorpay_payment_id,
        orderStatus: 'PROCESSING'
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    // Update product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: order.userId
        }
      }
    });

    // Send confirmation email
    try {
      await sendOrderConfirmation(order.user.email, updatedOrder);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Payment verified and order confirmed',
      data: { order: updatedOrder }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get user's orders
 */
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getMyOrders
};

