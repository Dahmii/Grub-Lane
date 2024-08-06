const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const databasePath = process.env.DATABASE_PATH;

/**
 * @swagger
 * /menu/create:
 *   post:
 *     description: Create a new menu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the menu
 *                 example: "Lunch Specials"
 *               take_out:
 *                 type: boolean
 *                 description: Whether the menu is for take-out
 *                 example: true
 *     responses:
 *       201:
 *         description: Menu created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/create', (req, res) => {
    const { name, take_out } = req.body;
    if (!name || take_out === undefined) {
        return res.status(400).json({ error: "Name and take_out flag are required." });
    }

    let db = new sqlite3.Database(databasePath);
    const query = 'INSERT INTO Menu (name, take_out) VALUES (?, ?)';

    db.run(query, [name, take_out], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });

    db.close((err) => {
        if (err) {
            console.error('Error closing database connection:', err.message);
        }
    });
});

module.exports = router;
