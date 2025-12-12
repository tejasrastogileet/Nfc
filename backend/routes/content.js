const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/page/:slug', contentController.getPage);
router.get('/faqs', contentController.getAllFAQs);
router.get('/blog', contentController.getAllBlogPosts);
router.get('/blog/:slug', contentController.getBlogPostBySlug);

// Admin routes
router.use(authenticate, isAdmin);

// Pages
router.get('/pages/all', contentController.getAllPages);
router.post('/pages', contentController.createPage);
router.put('/pages/:slug', contentController.updatePage);
router.delete('/pages/:slug', contentController.deletePage);

// FAQs
router.post('/faqs', contentController.createFAQ);
router.put('/faqs/:faqId', contentController.updateFAQ);
router.delete('/faqs/:faqId', contentController.deleteFAQ);

// Blog
router.post('/blog', contentController.createBlogPost);
router.put('/blog/:postId', contentController.updateBlogPost);
router.delete('/blog/:postId', contentController.deleteBlogPost);

module.exports = router;
