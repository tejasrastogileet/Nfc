const { PrismaClient } = require('@prisma/client');
const { sendLowStockAlert } = require('../utils/email');

const prisma = new PrismaClient();

/**
 * Get dashboard stats
 */
const getDashboardStats = async (req, res) => {
  try {
    const [totalSales, totalOrders, totalUsers, totalProducts] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true }
      }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count()
    ]);

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Revenue analytics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueData = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        totalAmount: true,
        createdAt: true
      }
    });

    // Group by date
    const revenueByDate = {};
    revenueData.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + order.totalAmount;
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalSales: totalSales._sum.totalAmount || 0,
          totalOrders,
          totalUsers,
          totalProducts
        },
        recentOrders,
        revenueAnalytics: revenueByDate
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
 * Get all orders (Admin)
 */
const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.orderStatus = status.toUpperCase();
    if (paymentStatus) where.paymentStatus = paymentStatus.toUpperCase();

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            include: {
              product: true
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
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
 * Update order status (Admin)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: 'Order status is required'
      });
    }

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(orderStatus.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { orderStatus: orderStatus.toUpperCase() },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Order status updated',
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
 * Get low stock products
 */
const getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const products = await prisma.product.findMany({
      where: {
        stock: {
          lte: parseInt(threshold)
        }
      },
      orderBy: { stock: 'asc' }
    });

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Send low stock alerts
 */
const sendLowStockAlerts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const products = await prisma.product.findMany({
      where: {
        stock: {
          lte: parseInt(threshold)
        }
      }
    });

    const alerts = [];
    for (const product of products) {
      try {
        await sendLowStockAlert(product);
        alerts.push({ product: product.name, status: 'sent' });
      } catch (error) {
        alerts.push({ product: product.name, status: 'failed', error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Low stock alerts processed',
      data: { alerts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all users (Admin)
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
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

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getLowStockProducts,
  sendLowStockAlerts,
  getAllUsers
};



