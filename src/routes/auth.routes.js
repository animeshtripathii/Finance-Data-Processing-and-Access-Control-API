const express=require('express');
const authRouter=express.Router();
const { authmiddleware, requireRole }=require('../middlewares/auth.middleware');
const validate=require('../middlewares/validate.middleware');
const { registerSchema, loginSchema, updateUserRoleSchema, updateUserStatusSchema } = require('../validations/auth.validation');
const {registerUser,loginUser,logoutUser,getUsers,updateUserRole,updateUserStatus}=require('../controllers/auth.controller');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Animesh
 *               email:
 *                 type: string
 *                 example: animesh@example.com
 *               password:
 *                 type: string
 *                 example: StrongPass123!
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or duplicate user
 */


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: animesh@example.com
 *               password:
 *                 type: string
 *                 example: StrongPass123!
 *     responses:
 *       200:
 *         description: Login successful. Returns user data and sets HttpOnly cookie.
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out current user
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Get all users (Admin)
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/auth/users/{id}/role:
 *   patch:
 *     summary: Update user role (Admin)
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [Viewer, Analyst, Admin]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/auth/users/{id}/status:
 *   patch:
 *     summary: Update user active status (Admin)
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */

authRouter.post('/register', validate(registerSchema), registerUser);
authRouter.post('/login', validate(loginSchema), loginUser);
authRouter.post('/logout', authmiddleware, logoutUser);
authRouter.get('/me', authmiddleware, (req, res) => {
    return res.status(200).json({ success: true, user: req.user });
});
authRouter.get('/users', authmiddleware, requireRole(['Admin']), getUsers);
authRouter.patch('/users/:id/role', authmiddleware, requireRole(['Admin']), validate(updateUserRoleSchema), updateUserRole);
authRouter.patch('/users/:id/status', authmiddleware, requireRole(['Admin']), validate(updateUserStatusSchema), updateUserStatus);
module.exports=authRouter;