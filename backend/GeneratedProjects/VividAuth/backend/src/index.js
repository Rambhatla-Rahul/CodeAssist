// Entry point for the backend server
const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

// Connect to MongoDB
connectDB();

// Start server
const PORT = env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
