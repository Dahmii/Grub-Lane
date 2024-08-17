const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();
const databasePath = process.env.DATABASE_PATH;

router.post("/", (req, res) => {
  const { user_id, number_of_guests, date_time } = req.body;

  // Adding a placeholder for table_number
  const table_number = 0; // Use a placeholder value

  if (!user_id || !number_of_guests || !date_time) {
    return res.status(400).json({
      error: "User ID, number of guests, and date-time are required.",
    });
  }

  let db = new sqlite3.Database(databasePath);

  let checkSql = `SELECT id FROM Reservations WHERE user_id = ? AND date_time = ?`;
  db.get(checkSql, [user_id, date_time], (err, row) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Internal server error." });
    }
    if (row) {
      return res.status(409).json({
        error:
          "Reservation for this user at this date and time already exists.",
      });
    }

    // Insert the new reservation with placeholder table_number
    let insertSql = `INSERT INTO Reservations (user_id, table_number, number_of_guests, date_time) VALUES (?, ?, ?, ?)`;
    db.run(
      insertSql,
      [user_id, table_number, number_of_guests, date_time],
      function (err) {
        if (err) {
          console.error("Error inserting reservation:", err.message);
          return res
            .status(500)
            .json({ error: "Failed to create reservation." });
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

module.exports = router;
