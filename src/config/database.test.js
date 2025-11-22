const { Sequelize } = require('sequelize');
require('dotenv').config();

// Test database configuration - uses separate test database
const sequelize = new Sequelize(
  process.env.DB_NAME_TEST || 'yettel_test_test',
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false, // Disable logging in tests
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;

