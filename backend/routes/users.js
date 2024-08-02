const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const databasePath = process.env.DATABASE_PATH;

router.post('/', (req, res) => {
    const { email, address, phone_number, name } = req.body;
    if (!email || !name) {
        return res.status(400).json({ error: 'Email and name are required.' });
    }

    let db = new sqlite3.Database(databasePath);
    let checkSql = `SELECT id FROM User WHERE email = ?`;
    db.get(checkSql, [email], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (row) {
            return res.status(409).json({ error: 'User with this email already exists.' });
        }

        let insertSql = `INSERT INTO User (email, address, phone_number, name) VALUES (?, ?, ?, ?)`;
        db.run(insertSql, [email, address, phone_number, name], function(err) {
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
    let sql = `SELECT * FROM User`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(200).json({ users: rows });
    });
    db.close((err) => {
        if (err) {
            console.error('Error closing database connection:', err.message);
        }
    });
});

module.exports = router;
