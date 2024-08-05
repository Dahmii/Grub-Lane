const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

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
      servers: ["http://localhost:3000"],
    },
  },
  apis: ["./routes/users.js", "./routes/orders.js", "./routes/reservations.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/reservations", reservationRoutes);
app.use('/menu', menuRoutes);
app.use('/dish', dishRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
