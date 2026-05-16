'use strict';

const authService = require('../services/authService');
const { validateSignup, validateLogin } = require('../utils/validationHelper');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = validateSignup(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: error.details[0].message
      });
    }

    const { name, email, password } = req.body;

    // Attempt to register user
    const result = await authService.registerUser({ name, email, password });
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    // Set HttpOnly cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Send success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: error.details[0].message
      });
    }

    const { email, password } = req.body;

    // Attempt to authenticate user
    const result = await authService.authenticateUser({ email, password });
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message
      });
    }

    // Set HttpOnly cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Send success response
    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      user: result.user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    // Clear HttpOnly cookie
    res.clearCookie('token');

    // Send success response
    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is attached to req by auth middleware
    const user = req.user;
    
    // Remove sensitive data
    const sanitizedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      user: sanitizedUser
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser
};