const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get refund requests
exports.getRefundRequests = async (req, res) => {
  try {
    const requests = await prisma.refundRequest.findMany({
      where: { userId: req.user.id },
      include: { order: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Get refund requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to get refund requests' });
  }
};

// Create refund request
exports.createRefundRequest = async (req, res) => {
  try {
    const { orderId, reason, refundAmount, notes } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if refund request already exists
    const existingRequest = await prisma.refundRequest.findFirst({
      where: { orderId, status: { not: 'REJECTED' } }
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Refund request already exists for this order' });
    }

    const refundRequest = await prisma.refundRequest.create({
      data: {
        orderId,
        userId: req.user.id,
        reason,
        refundAmount,
        notes
      },
      include: { order: true }
    });

    res.status(201).json({ success: true, data: refundRequest, message: 'Refund request created' });
  } catch (error) {
    console.error('Create refund request error:', error);
    res.status(500).json({ success: false, message: 'Failed to create refund request' });
  }
};

// Get refund request details
exports.getRefundRequestDetails = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await prisma.refundRequest.findUnique({
      where: { id: requestId },
      include: { order: { include: { items: { include: { product: true } } } } }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Get refund details error:', error);
    res.status(500).json({ success: false, message: 'Failed to get refund request' });
  }
};

// Admin: Get all refund requests
exports.getAllRefundRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const requests = await prisma.refundRequest.findMany({
      where,
      include: { order: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.refundRequest.count({ where });

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all refund requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to get refund requests' });
  }
};

// Admin: Update refund request status
exports.updateRefundStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const refundRequest = await prisma.refundRequest.update({
      where: { id: requestId },
      data: {
        status,
        processedAt: status !== 'PENDING' ? new Date() : null
      },
      include: { order: true, user: true }
    });

    res.json({ success: true, data: refundRequest, message: 'Refund request updated' });
  } catch (error) {
    console.error('Update refund status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update refund request' });
  }
};
