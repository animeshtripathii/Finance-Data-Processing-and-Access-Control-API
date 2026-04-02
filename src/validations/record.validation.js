const { z } = require('zod');
const recordSchema = z.object({
  amount: z.number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a number',
  }).positive('Amount must be a positive number'),
  
  type: z.enum(['Income', 'Expense'], {
    required_error: 'Type is required',
    invalid_type_error: "Type must be 'Income' or 'Expense'",
  }),
  
  category: z.string().min(1, 'Category is required'),
  
  date: z.string().datetime().optional(), 
  
  notes: z.string().optional(),
});
const updateRecordSchema = recordSchema.partial();

module.exports = { recordSchema, updateRecordSchema };