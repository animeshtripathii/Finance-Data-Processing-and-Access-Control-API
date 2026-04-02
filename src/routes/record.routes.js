const express=require('express');
const recordRouter=express.Router();
const { authmiddleware,requireRole}=require('../middlewares/auth.middleware');
const validate=require('../middlewares/validate.middleware');
const { recordSchema,updateRecordSchema } = require('../validations/record.validation');
const { createRecord, getRecords, updateRecord, deleteRecord } = require('../controllers/record.controller');

/**
 * @swagger
 * /api/records/getRecord:
 *   get:
 *     summary: Get all records
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Records fetched successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/records/addRecord:
 *   post:
 *     summary: Add a new financial record (Admin)
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - category
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 2500
 *               type:
 *                 type: string
 *                 enum: [Income, Expense]
 *                 example: Income
 *               category:
 *                 type: string
 *                 example: Salary
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-04-02T00:00:00.000Z
 *               notes:
 *                 type: string
 *                 example: April salary credited
 *           example:
 *             amount: 2500
 *             type: Income
 *             category: Salary
 *             date: 2026-04-02T00:00:00.000Z
 *             notes: April salary credited
 *     responses:
 *       201:
 *         description: Record created
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/records/updateRecord/{id}:
 *   put:
 *     summary: Update a financial record by id (Admin)
 *     tags: [Records]
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
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 2800
 *               type:
 *                 type: string
 *                 enum: [Income, Expense]
 *                 example: Income
 *               category:
 *                 type: string
 *                 example: Salary
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-04-03T00:00:00.000Z
 *               notes:
 *                 type: string
 *                 example: Updated salary entry
 *           example:
 *             amount: 2800
 *             notes: Updated salary entry
 *     responses:
 *       200:
 *         description: Record updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 */

/**
 * @swagger
 * /api/records/deleteRecord/{id}:
 *   delete:
 *     summary: Delete a financial record by id (Admin)
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 */

recordRouter.use(authmiddleware); 
recordRouter.get('/getRecord', requireRole(['Admin', 'Analyst']), getRecords);
recordRouter.post('/addRecord', requireRole(['Admin']), validate(recordSchema), 
  createRecord
);
recordRouter.put(
  '/updateRecord/:id', 
  requireRole(['Admin']), 
  validate(updateRecordSchema), 
  updateRecord
);
recordRouter.delete(
  '/deleteRecord/:id', 
  requireRole(['Admin']), 
  deleteRecord
);

module.exports = recordRouter;