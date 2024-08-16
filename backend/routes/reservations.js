const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();
const databasePath = process.env.DATABASE_PATH;

/**
 * @swagger
 * /reservations:
 *   post:
 *     description: Create a new reservation
 *     parameters:
 *       - name: name
 *         in: body
 *         required: true
 *         schema:
 *           type: string
 *       - name: date
 *         in: body
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - name: time
 *         in: body
 *         required: true
 *         schema:
 *           type: string
 *           format: time
 *       - name: phone_number
 *         in: body
 *         required: true
 *         schema:
 *           type: string
 *       - name: email
 *         in: body
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *       - name: number_of_guests
 *         in: body
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: Reservation already exists
 */
router.post("/", (req, res) => {
  const { name, date, time, phone_number, email, number_of_guests } = req.body;
  if (!name || !date || !time || !phone_number || !email || !number_of_guests) {
    return res.status(400).json({
      error:
        "Name, date, time, phone number, email, and number of guests are required.",
    });
  }

  let db = new sqlite3.Database(databasePath);
  let dateTime = `${date} ${time}`; // Combine date and time

  let checkSql = `SELECT id FROM Reservations WHERE email = ? AND date_time = ?`;
  db.get(checkSql, [email, dateTime], (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (row) {
      return res.status(409).json({
        error:
          "Reservation for this email at this date and time already exists.",
      });
    }

    let insertSql = `
      INSERT INTO Reservations (name, date_time, phone_number, email, number_of_guests)
      VALUES (?, ?, ?, ?, ?)`;

    db.run(
      insertSql,
      [name, dateTime, phone_number, email, number_of_guests],
      function (err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
      }
    );

    db.close((err) => {
      if (err) {
        console.error("Error closing database connection:", err.message);
      }
    });
  });
});

/**
 * @swagger
 * /reservations:
 *   get:
 *     description: Get all reservations
 *     responses:
 *       200:
 *         description: List of reservations
 *       400:
 *         description: Bad request
 */
router.get("/", (req, res) => {
  let db = new sqlite3.Database(databasePath);
  let sql = `SELECT * FROM Reservations`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(200).json({ reservations: rows });
  });
  db.close((err) => {
    if (err) {
      console.error("Error closing database connection:", err.message);
    }
  });
});

module.exports = router;
