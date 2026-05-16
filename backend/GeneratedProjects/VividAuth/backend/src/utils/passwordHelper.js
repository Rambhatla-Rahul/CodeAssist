'use strict';

const bcrypt = require('bcryptjs');

/**
 * Hashes a plain text password
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} - A promise that resolves to the hashed password
 */
async function hashPassword(password) {
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

/**
 * Compares a plain text password with a hashed password
 * @param {string} plainPassword - The plain text password to compare
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} - A promise that resolves to true if passwords match, false otherwise
 */
async function comparePasswords(plainPassword, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
}

module.exports = {
  hashPassword,
  comparePasswords
};