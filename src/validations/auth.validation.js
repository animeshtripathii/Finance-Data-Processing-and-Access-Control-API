const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long'),
    
  email: z
    .string()
    .email('Invalid email address'),
    
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

const updateUserRoleSchema = z.object({
  role: z.enum(['Viewer', 'Analyst', 'Admin']),
});

const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

module.exports = { registerSchema, loginSchema, updateUserRoleSchema, updateUserStatusSchema };