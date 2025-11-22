const { Task, User } = require('../models');
const { validationResult } = require('express-validator');

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { body } = req.body;
    const task = await Task.create({
      body,
      userId: req.user.id
    });

    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: task.id,
        body: task.body,
        userId: task.userId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const listTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Fixed pagination size
    const offset = (page - 1) * limit;
    const sort = req.query.sort || 'newest'; // 'newest' or 'oldest'

    const order = sort === 'oldest' ? [['createdAt', 'ASC']] : [['createdAt', 'DESC']];

    // Build where clause based on user role
    const whereClause = {};
    if (req.user.role === 'basic') {
      whereClause.userId = req.user.id;
    }
    // Admin can see all tasks, so no where clause restriction

    const { count, rows: tasks } = await Task.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'username', 'email']
      }],
      order,
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      tasks,
      pagination: {
        currentPage: page,
        totalPages,
        totalTasks: count,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { body } = req.body;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Check permissions: basic users can only update their own tasks, admin can update any
    if (req.user.role === 'basic' && task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You can only update your own tasks.' });
    }

    task.body = body;
    await task.save();

    res.json({
      message: 'Task updated successfully',
      task: {
        id: task.id,
        body: task.body,
        userId: task.userId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  listTasks,
  updateTask
};

