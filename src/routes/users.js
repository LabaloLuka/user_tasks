const express = require('express');
const router = express.Router();
const { getProfile, updateOwnProfile, updateUserProfile } = require('../controllers/userController');
const { updateProfileValidation, updateUserProfileValidation } = require('../middleware/validation');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorization');

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get own profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', authenticate, getProfile);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update own profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John Updated"
 *               lastName:
 *                 type: string
 *                 example: "Doe Updated"
 *               username:
 *                 type: string
 *                 example: "johndoe_new"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.new@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     description: All fields are optional. Only provided fields will be updated.
 */
router.put('/me', authenticate, updateProfileValidation, updateOwnProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update any user profile (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Admin Changed"
 *               lastName:
 *                 type: string
 *                 example: "This Name"
 *               username:
 *                 type: string
 *                 example: "newusername"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newemail@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "newpassword123"
 *               role:
 *                 type: string
 *                 enum: [basic, admin]
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User profile updated successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Only admin users can update other users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     description: |
 *       - Only admin users can access this endpoint
 *       - All fields are optional. Only provided fields will be updated.
 *       - Admin can change user roles
 */
router.put('/:id', authenticate, authorize('admin'), updateUserProfileValidation, updateUserProfile);

module.exports = router;

