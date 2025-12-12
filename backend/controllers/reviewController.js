const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.review.count({ where: { productId } });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to get reviews' });
  }
};

// Add review
exports.addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: req.user.id
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // Check if user purchased this product
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: req.user.id }
      }
    });

    if (!orderItem) {
      return res.status(403).json({ success: false, message: 'You can only review products you have purchased' });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.user.id,
        rating,
        title,
        comment
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    // Update product average rating
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });

    const ratingMap = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
    const avgRating = allReviews.reduce((sum, r) => sum + ratingMap[r.rating], 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: avgRating,
        totalReviews: allReviews.length
      }
    });

    res.status(201).json({ success: true, data: review, message: 'Review added successfully' });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ success: false, message: 'Failed to add review' });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own reviews' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: rating || review.rating,
        title: title || review.title,
        comment: comment || review.comment
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.json({ success: true, data: updatedReview, message: 'Review updated successfully' });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: 'Failed to update review' });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own reviews' });
    }

    const productId = review.productId;

    await prisma.review.delete({ where: { id: reviewId } });

    // Update product average rating
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });

    if (allReviews.length > 0) {
      const ratingMap = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
      const avgRating = allReviews.reduce((sum, r) => sum + ratingMap[r.rating], 0) / allReviews.length;

      await prisma.product.update({
        where: { id: productId },
        data: {
          averageRating: avgRating,
          totalReviews: allReviews.length
        }
      });
    } else {
      await prisma.product.update({
        where: { id: productId },
        data: {
          averageRating: null,
          totalReviews: 0
        }
      });
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
};

// Mark review helpful
exports.markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: { increment: 1 }
      }
    });

    res.json({ success: true, data: review });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark review helpful' });
  }
};
