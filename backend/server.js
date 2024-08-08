const fs = require('fs');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const httpsPort = process.env.HTTPS_PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

const initializeDatabase = require('./initializeDatabase');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const reservationRoutes = require('./routes/reservations');
const menuRoutes = require('./routes/menu');
const dishRoutes = require('./routes/dish');

initializeDatabase();

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'API Documentation',
      description: 'API Information',
      version: '1.0.0',
      contact: {
        name: 'API Support',
      },
      servers: ['http://localhost:3000', 'https://localhost:3001'],
    },
  },
  apis: ['./routes/users.js', './routes/orders.js', './routes/reservations.js', './routes/dish.js', './routes/menu.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/users', userRoutes);
app.use('/orders', orderRoutes);
app.use('/reservations', reservationRoutes);
app.use('/menu', menuRoutes);
app.use('/dish', dishRoutes);

const options = {
  key: fs.readFileSync('ssl/server.key'),
  cert: fs.readFileSync('ssl/server.cert')
};

https.createServer(options, app).listen(httpsPort, () => {
  console.log(`HTTPS Server is running on https://0.0.0.0:${httpsPort}`);
});

const http = require('http');
http.createServer((req, res) => {
  res.writeHead(301, { "Location": `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(port, () => {
  console.log(`HTTP Server is running on http://0.0.0.0:${port} and redirecting to https`);
});
