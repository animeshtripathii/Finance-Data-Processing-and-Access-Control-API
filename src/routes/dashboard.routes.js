const express = require('express');
const { authmiddleware, requireRole } = require('../middlewares/auth.middleware');
const { getDashboardSummary } = require('../controllers/dashboard.controller');

const dashboardRouter = express.Router();

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary totals and category breakdown
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary fetched
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */


dashboardRouter.use(authmiddleware); // All routes in this file require authentication


dashboardRouter.get('/summary', requireRole(['Admin', 'Analyst']), getDashboardSummary);

module.exports = dashboardRouter;