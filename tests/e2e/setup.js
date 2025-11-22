// Force test environment
process.env.NODE_ENV = 'test';

const sequelize = require('../../src/config/database.test');
const { User, Task } = require('../../src/models');

/**
 * Setup test database before each test suite
 * - Syncs all models (creates tables)
 * - Cleans all data
 */
async function setupTestDatabase() {
  try {
    // Sync models - creates tables if they don't exist, drops and recreates them
    await sequelize.sync({ force: true });
    console.log('Test database synced and cleaned');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}

/**
 * Clean all data from test database
 */
async function cleanTestDatabase() {
  try {
    // Delete all data (order matters due to foreign keys)
    await Task.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  } catch (error) {
    console.error('Error cleaning test database:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
async function closeDatabaseConnection() {
  try {
    await sequelize.close();
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

module.exports = {
  setupTestDatabase,
  cleanTestDatabase,
  closeDatabaseConnection
};

