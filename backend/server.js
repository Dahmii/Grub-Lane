const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const initializeDatabase = require('./initializeDatabase');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const reservationRoutes = require('./routes/reservations');

initializeDatabase();

app.use('/users', userRoutes);
app.use('/orders', orderRoutes);
app.use('/reservations', reservationRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
