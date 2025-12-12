const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get wishlist
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: req.user.id },
        include: {
          items: {
            include: { product: true }
          }
        }
      });
    }

    res.json({ success: true, data: wishlist });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to get wishlist' });
  }
};

// Add to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: req.user.id }
      });
    }

    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId
        }
      }
    });

    if (existingItem) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId
      },
      include: {
        product: true
      }
    });

    res.status(201).json({ success: true, data: item, message: 'Added to wishlist' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
      include: { wishlist: true }
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.wishlist.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.wishlistItem.delete({ where: { id: itemId } });

    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id }
    });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    await prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id }
    });

    res.json({ success: true, message: 'Wishlist cleared' });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear wishlist' });
  }
};
