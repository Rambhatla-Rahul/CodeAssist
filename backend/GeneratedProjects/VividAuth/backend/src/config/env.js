'use strict';

require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/authdb',
  JWT_SECRET: process.env.JWT_SECRET || 'your-default-jwt-secret',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'your-default-cookie-secret'
};

module.exports = env;