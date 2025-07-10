const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Techify.asia API',
      version: '1.0.0',
      description: 'API documentation for Techify.asia',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Đường dẫn tới các file route để swagger-jsdoc quét
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
