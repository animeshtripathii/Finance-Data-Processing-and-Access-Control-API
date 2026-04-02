const swaggerJsdoc = require('swagger-jsdoc');

const SERVER_URL =
  process.env.API_BASE_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  `http://localhost:${process.env.PORT || 3000}`;

const options = {
  definition: {
    openapi: '3.0.0', 
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description: 'API documentation for the Finance Data Processing Backend',
    },
    servers: [
      {
        url: SERVER_URL,
        description: 'Development server',
      },
    ],
    
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;