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
 *       - name: user_id
 *         in: body
 *         required: true
 *         schema:
 *           type: string
 *       - name: table_number
 *         in: body
 *         required: true
 *         schema:
 *           type: number
 *       - name: number_of_guests
 *         in: body
 *         required: true
 *         schema:
 *           type: number
 *       - name: date_time
 *         in: body
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: Reservation already exists
 */
router.post("/", (req, res) => {
  const { user_id, table_number, number_of_guests, date_time } = req.body;
  if (!user_id || !table_number || !number_of_guests || !date_time) {
    return res
      .status(400)
      .json({
        error:
          "User ID, table number, number of guests, and date-time are required.",
      });
  }

  let db = new sqlite3.Database(databasePath);
  let checkSql = `SELECT id FROM Reservations WHERE user_id = ? AND date_time = ?`;
  db.get(checkSql, [user_id, date_time], (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (row) {
      return res
        .status(409)
        .json({
          error:
            "Reservation for this user at this date and time already exists.",
        });
    }

    let insertSql = `INSERT INTO Reservations (user_id, table_number, number_of_guests, date_time) VALUES (?, ?, ?, ?)`;
    db.run(
      insertSql,
      [user_id, table_number, number_of_guests, date_time],
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
