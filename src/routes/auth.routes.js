const express=require('express');
const authRouter=express.Router();
const { authmiddleware }=require('../middlewares/auth.middleware');
const validate=require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');
const {registerUser,loginUser,logoutUser}=require('../controllers/auth.controller');

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
 *               role:
 *                 type: string
 *                 example: Viewer
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

authRouter.post('/register', validate(registerSchema), registerUser);
authRouter.post('/login', validate(loginSchema), loginUser);
authRouter.post('/logout', logoutUser);
authRouter.get('/me', authmiddleware, (req, res) => {
    return res.status(200).json({ success: true, user: req.user });
});
module.exports=authRouter;