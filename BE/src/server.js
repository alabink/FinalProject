const express = require('express');
const app = express();
const port = 3000;

require('dotenv').config();

const bodyParser = require('body-parser');
const cookiesParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

// Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Use environment variable for client URL if provided, otherwise default to local Vite dev server
app.use(cors({

  origin: ['http://techify.asia:5173', 'http://localhost:5173'],

  credentials: true

}));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Techify API Documentation',
      version: '1.0.0',
      description: 'Auto-generated Swagger docs for Techify backend',
    },
    servers: [
      {
        url: `https://techify.asia:${port}`,
        description: 'Development server',
      },
    ],
  },
  apis: [path.join(__dirname, 'routes', '**', '*.js')], // Scan all route files for swagger comments
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const connectDB = require('./config/ConnectDB');
const routes = require('./routes/index');
const { askQuestion } = require('./utils/Chatbot');

app.use(express.static(path.join(__dirname, '../src')));
app.use(cookiesParser());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

routes(app);

connectDB();

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Lỗi server',
  });
});

// Chatbot API route (now under /api for consistency with other endpoints)
app.post('/api/chat', async (req, res) => {
  const { question } = req.body;
  const data = await askQuestion(question);
  return res.status(200).json(data);
});

app.listen(port, () => {
  console.log(`Server listening on port : ${port}`);
  console.log(`Swagger available at port : ${port}/api-docs`);
});
