const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();
const databasePath = process.env.DATABASE_PATH;

router.post("/", (req, res) => {
  const { user_id, number_of_guests, date_time } = req.body;
  const table_number = 0;

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

router.get("/", (req, res) => {
  const { user_id, date_time, table_number, page = 1, pageSize = 10 } = req.query;

  const limit = parseInt(pageSize);
  const currentPage = parseInt(page);
  const offset = (currentPage - 1) * limit;

  let db = new sqlite3.Database(databasePath);
  let querySql = `
    SELECT 
      Reservations.*,
      User.name AS user_name,
      User.email AS user_email,
      User.phone AS user_phone
    FROM 
      Reservations
    JOIN 
      User
    ON 
      Reservations.user_id = User.id
    WHERE 
      1=1
  `;
  let params = [];

  if (user_id) {
    querySql += " AND Reservations.user_id = ?";
    params.push(user_id);
  }

  if (date_time) {
    querySql += " AND Reservations.date_time = ?";
    params.push(date_time);
  }

  if (table_number) {
    querySql += " AND Reservations.table_number = ?";
    params.push(table_number);
  }

  querySql += " LIMIT ? OFFSET ?";
  params.push(limit, offset);

  db.all(querySql, params, (err, rows) => {
    if (err) {
      console.error("Error fetching reservations:", err.message);
      return res.status(500).json({ error: "Internal server error." });
    }

    const nextPage = currentPage + 1;
    const prevPage = currentPage - 1 > 0 ? currentPage - 1 : null;

    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    const nextUrl = rows.length < limit ? null : `${baseUrl}?page=${nextPage}&pageSize=${limit}`;
    const prevUrl = prevPage ? `${baseUrl}?page=${prevPage}&pageSize=${limit}` : null;

    res.status(200).json({
      data: rows,
      pagination: {
        currentPage,
        pageSize: limit,
        nextUrl,
        prevUrl
      }
    });
  });

  db.close((err) => {
    if (err) {
      console.error("Error closing database connection:", err.message);
    }
  });
});



module.exports = router;
