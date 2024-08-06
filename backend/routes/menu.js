const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const databasePath = process.env.DATABASE_PATH;

const db = new sqlite3.Database(databasePath);

/**
 * @swagger
 * /menu/create:
 *   post:
 *     summary: Create a new menu
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the created menu
 *                   example: 1
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Could not create menu"
 */
router.post('/create', (req, res) => {
    const { name, take_out } = req.body;
    const query = 'INSERT INTO Menu (name, take_out) VALUES (?, ?)';

    db.run(query, [name, take_out], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

module.exports = router;
