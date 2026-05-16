const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimiter = require('../middleware/rateLimiter');

// Apply rate limiting to authentication routes
router.post('/signup', rateLimiter.authLimiter, authController.signup);
router.post('/login', rateLimiter.authLimiter, authController.login);
router.post('/logout', authController.logout);

// Protected route example - requires valid JWT in HttpOnly cookie
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);

module.exports = router;