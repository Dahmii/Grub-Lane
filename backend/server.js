const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors"); 
const https = require("https");
const fs = require("fs");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Load SSL certificate and key
const sslOptions = {
  key: fs.readFileSync("/var/log/private.key"), // Ensure the path and filename are correct
  cert: fs.readFileSync("/var/log/certificate.crt"), // Ensure the path and filename are correct
  // If you have an intermediate certificate bundle, include it like this:
  // ca: fs.readFileSync("/var/log/ca_bundle.crt"),
};

app.use(bodyParser.json());
app.use(cors());

const initializeDatabase = require("./initializeDatabase");
const userRoutes = require("./routes/users");
const orderRoutes = require("./routes/orders");
const reservationRoutes = require("./routes/reservations");
const menuRoutes = require('./routes/menu');
const dishRoutes = require('./routes/dish');

initializeDatabase();

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "API Documentation",
      description: "API Information",
      version: "1.0.0",
      contact: {
        name: "API Support",
      },
      servers: ["https://0.0.0.0:3000"], // Change to https
    },
  },
  apis: ["./routes/users.js", "./routes/orders.js", "./routes/reservations.js", "./routes/dish.js", "./routes/menu.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/reservations", reservationRoutes);
app.use('/menu', menuRoutes);
app.use('/dish', dishRoutes);

// Use https.createServer to start the server with SSL options
https.createServer(sslOptions, app).listen(port, () => {
  console.log(`HTTPS Server is running on https://0.0.0.0:${port}`);
});
