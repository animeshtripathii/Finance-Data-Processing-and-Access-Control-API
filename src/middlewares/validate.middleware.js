const { ZodError } = require('zod');
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body); 
      next(); 
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || error.errors || [];
        const errorMessages = issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages,
        });
      }
      next(error);
    }
  };
};

module.exports = validate;