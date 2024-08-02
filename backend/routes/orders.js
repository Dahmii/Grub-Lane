const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const databasePath = process.env.DATABASE_PATH;

router.post('/', (req, res) => {
    const { user_id, amount_paid, order_number, date, paystack_reference, order_details } = req.body;
    if (!user_id || !amount_paid || !order_number || !date) {
        return res.status(400).json({ error: 'User ID, amount paid, order number, and date are required.' });
    }

    let db = new sqlite3.Database(databasePath);
    let checkSql = `SELECT id FROM Orders WHERE order_number = ?`;
    db.get(checkSql, [order_number], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (row) {
            return res.status(409).json({ error: 'Order with this order number already exists.' });
        }

        let insertSql = `INSERT INTO Orders (user_id, amount_paid, order_number, date, paystack_reference, order_details) VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(insertSql, [user_id, amount_paid, order_number, date, paystack_reference, order_details], function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID });
        });
        db.close((err) => {
            if (err) {
                console.error('Error closing database connection:', err.message);
            }
        });
    });
});

router.get('/', (req, res) => {
    let db = new sqlite3.Database(databasePath);
    let sql = `SELECT * FROM Orders`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(200).json({ orders: rows });
    });
    db.close((err) => {
        if (err) {
            console.error('Error closing database connection:', err.message);
        }
    });
});

module.exports = router;
