const express = require('express');
const router = express.Router();
const { createTask, listTasks, updateTask } = require('../controllers/taskController');
const { taskValidation } = require('../middleware/validation');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorization');

// List tasks - both basic and admin can access
router.get('/', authenticate, listTasks);

// Create task - only basic users can create tasks
router.post('/', authenticate, authorize('basic'), taskValidation, createTask);

// Update task - basic can update own, admin can update any
router.put('/:id', authenticate, taskValidation, updateTask);

module.exports = router;

