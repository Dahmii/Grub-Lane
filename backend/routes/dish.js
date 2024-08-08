const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const databasePath = process.env.DATABASE_PATH;

const db = new sqlite3.Database(databasePath);

/**
 * @swagger
 * /dish/getDishes:
 *   get:
 *     summary: Get dishes based on the take_out flag of the menu
 *     parameters:
 *       - in: query
 *         name: take_out
 *         schema:
 *           type: boolean
 *         required: true
 *         description: The take_out flag of the menu
 *     responses:
 *       200:
 *         description: List of dishes
 *       500:
 *         description: Server error
 */
router.get('/getDishes', (req, res) => {
    const take_out = req.query.take_out === 'true'; // Convert query string to boolean
    const query = `
        SELECT Dish.id, Dish.name, Dish.price, Dish.menu_id 
        FROM Dish
        INNER JOIN Menu ON Dish.menu_id = Menu.id
        WHERE Menu.take_out = ?
    `;

    db.all(query, [take_out], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ dishes: rows });
    });
});

module.exports = router;
