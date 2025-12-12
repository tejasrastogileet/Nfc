const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get static page
exports.getPage = async (req, res) => {
  try {
    const { slug } = req.params;

    const page = await prisma.staticPage.findUnique({
      where: { slug }
    });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ success: false, message: 'Failed to get page' });
  }
};

// Get all pages (admin)
exports.getAllPages = async (req, res) => {
  try {
    const pages = await prisma.staticPage.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: pages });
  } catch (error) {
    console.error('Get all pages error:', error);
    res.status(500).json({ success: false, message: 'Failed to get pages' });
  }
};

// Create page (admin)
exports.createPage = async (req, res) => {
  try {
    const { slug, title, content } = req.body;

    const page = await prisma.staticPage.create({
      data: { slug, title, content }
    });

    res.status(201).json({ success: true, data: page, message: 'Page created successfully' });
  } catch (error) {
    console.error('Create page error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Slug already exists' });
    }
    res.status(500).json({ success: false, message: 'Failed to create page' });
  }
};

// Update page (admin)
exports.updatePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content } = req.body;

    const page = await prisma.staticPage.update({
      where: { slug },
      data: { title, content }
    });

    res.json({ success: true, data: page, message: 'Page updated successfully' });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ success: false, message: 'Failed to update page' });
  }
};

// Delete page (admin)
exports.deletePage = async (req, res) => {
  try {
    const { slug } = req.params;

    await prisma.staticPage.delete({ where: { slug } });

    res.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete page' });
  }
};

// Get all FAQs
exports.getAllFAQs = async (req, res) => {
  try {
    const { category } = req.query;

    const where = { isActive: true };
    if (category) where.category = category;

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    const categories = await prisma.fAQ.findMany({
      where: { isActive: true },
      distinct: ['category'],
      select: { category: true }
    });

    res.json({
      success: true,
      data: {
        faqs,
        categories: categories.map(c => c.category)
      }
    });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ success: false, message: 'Failed to get FAQs' });
  }
};

// Create FAQ (admin)
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, category, order } = req.body;

    const faq = await prisma.fAQ.create({
      data: { question, answer, category, order: order || 0 }
    });

    res.status(201).json({ success: true, data: faq, message: 'FAQ created' });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ success: false, message: 'Failed to create FAQ' });
  }
};

// Update FAQ (admin)
exports.updateFAQ = async (req, res) => {
  try {
    const { faqId } = req.params;
    const { question, answer, category, order, isActive } = req.body;

    const faq = await prisma.fAQ.update({
      where: { id: faqId },
      data: { question, answer, category, order, isActive }
    });

    res.json({ success: true, data: faq, message: 'FAQ updated' });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ success: false, message: 'Failed to update FAQ' });
  }
};

// Delete FAQ (admin)
exports.deleteFAQ = async (req, res) => {
  try {
    const { faqId } = req.params;

    await prisma.fAQ.delete({ where: { id: faqId } });

    res.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete FAQ' });
  }
};

// Get all blog posts
exports.getAllBlogPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.blogPost.count({ where: { published: true } });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ success: false, message: 'Failed to get blog posts' });
  }
};

// Get blog post by slug
exports.getBlogPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // Increment views
    await prisma.blogPost.update({
      where: { slug },
      data: { views: { increment: 1 } }
    });

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ success: false, message: 'Failed to get blog post' });
  }
};

// Create blog post (admin)
exports.createBlogPost = async (req, res) => {
  try {
    const { title, slug, content, excerpt, author, image, published } = req.body;

    const post = await prisma.blogPost.create({
      data: { title, slug, content, excerpt, author, image, published: published || false }
    });

    res.status(201).json({ success: true, data: post, message: 'Blog post created' });
  } catch (error) {
    console.error('Create blog post error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Slug already exists' });
    }
    res.status(500).json({ success: false, message: 'Failed to create blog post' });
  }
};

// Update blog post (admin)
exports.updateBlogPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, slug, content, excerpt, author, image, published } = req.body;

    const post = await prisma.blogPost.update({
      where: { id: postId },
      data: { title, slug, content, excerpt, author, image, published }
    });

    res.json({ success: true, data: post, message: 'Blog post updated' });
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({ success: false, message: 'Failed to update blog post' });
  }
};

// Delete blog post (admin)
exports.deleteBlogPost = async (req, res) => {
  try {
    const { postId } = req.params;

    await prisma.blogPost.delete({ where: { id: postId } });

    res.json({ success: true, message: 'Blog post deleted' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete blog post' });
  }
};
