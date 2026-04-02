const express = require('express');
const { authmiddleware, requireRole } = require('../middlewares/auth.middleware');
const { getDashboardSummary, getRecentActivity, getMonthlyTrends } = require('../controllers/dashboard.controller');

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

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent financial activity
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Recent activity fetched
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/dashboard/monthly-trends:
 *   get:
 *     summary: Get monthly income and expense trends for a year
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: integer
 *           example: 2026
 *     responses:
 *       200:
 *         description: Monthly trends fetched
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */


dashboardRouter.use(authmiddleware); // All routes in this file require authentication


dashboardRouter.get('/summary', requireRole(['Viewer', 'Analyst', 'Admin']), getDashboardSummary);
dashboardRouter.get('/recent-activity', requireRole(['Viewer', 'Analyst', 'Admin']), getRecentActivity);
dashboardRouter.get('/monthly-trends', requireRole(['Viewer', 'Analyst', 'Admin']), getMonthlyTrends);

module.exports = dashboardRouter;