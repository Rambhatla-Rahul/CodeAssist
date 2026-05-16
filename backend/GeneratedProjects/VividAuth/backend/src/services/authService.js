'use strict';

const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/passwordHelper');
const { generateToken } = require('../utils/jwtHelper');

/**
 * Registers a new user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} name - User's name
 * @returns {Promise<Object>} - Registered user object without password
 */
async function registerUser(email, password, name) {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new user
  const newUser = new User({
    email,
    password: hashedPassword,
    name
  });

  // Save user to database
  const savedUser = await newUser.save();
  
  // Remove password from response
  const userResponse = savedUser.toObject();
  delete userResponse.password;
  
  return userResponse;
}

/**
 * Validates user credentials and generates JWT token
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<string>} - JWT token
 */
async function loginUser(email, password) {
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Compare passwords
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT token
  const token = generateToken(user._id);
  
  return token;
}

/**
 * Validates a JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} - Decoded user data
 */
async function validateToken(token) {
  // This would typically use jwtHelper.verifyToken
  // Implementation depends on specific requirements
  // For now we'll just return a placeholder
  throw new Error('validateToken not implemented');
}

module.exports = {
  registerUser,
  loginUser,
  validateToken
};