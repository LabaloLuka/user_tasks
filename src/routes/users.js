const express = require('express');
const router = express.Router();
const { getProfile, updateOwnProfile, updateUserProfile } = require('../controllers/userController');
const { updateProfileValidation, updateUserProfileValidation } = require('../middleware/validation');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorization');

// Get own profile - both basic and admin
router.get('/me', authenticate, getProfile);

// Update own profile - both basic and admin
router.put('/me', authenticate, updateProfileValidation, updateOwnProfile);

// Update any user profile - only admin
router.put('/:id', authenticate, authorize('admin'), updateUserProfileValidation, updateUserProfile);

module.exports = router;

