const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const operationLogger = require("../loggers/loggerMiddleware/operationLogger");
const router = express.Router();
const databasePath = process.env.DATABASE_PATH;

/**
 * @swagger
 * /createAdmin:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/createAdmin', operationLogger('Created a new admin'), (req, res) => {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }

    let db = new sqlite3.Database(databasePath);
    let sql = `INSERT INTO Admin (username, password, email, role) VALUES (?, ?, ?, ?)`;

    db.run(sql, [username, password, email, role], function (err) {
        if (err) {
            return res.status(500).json({ error: "Error creating admin" });
        }
        res.status(201).json({ id: this.lastID, username, email, role });
    });

    db.close();
});

/**
 * @swagger
 * /updateAdmin/{id}:
 *   put:
 *     summary: Update an admin
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             password:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.put('/updateAdmin/:id', operationLogger('Updated an admin'), (req, res) => {
    const { id } = req.params;
    const { username, password, email, role } = req.body;

    if (!username || !email || !role) {
        return res.status(400).json({ error: "Username, email, and role are required" });
    }

    let db = new sqlite3.Database(databasePath);
    let sql = `UPDATE Admin SET username = ?, email = ?, role = ? WHERE id = ?`;

    const params = [username, email, role, id];
    if (password) {
        sql = `UPDATE Admin SET username = ?, password = ?, email = ?, role = ? WHERE id = ?`;
        params.splice(1, 0, password);
    }

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: "Error updating admin" });
        }
        res.status(200).json({ message: "Admin updated successfully" });
    });

    db.close();
});

/**
 * @swagger
 * /deleteAdmin/{id}:
 *   delete:
 *     summary: Delete an admin
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       500:
 *         description: Server error
 */
router.delete('/deleteAdmin/:id', operationLogger('Deleted an admin'), (req, res) => {
    const { id } = req.params;

    let db = new sqlite3.Database(databasePath);
    let sql = `DELETE FROM Admin WHERE id = ?`;

    db.run(sql, id, function (err) {
        if (err) {
            return res.status(500).json({ error: "Error deleting admin" });
        }
        res.status(200).json({ message: "Admin deleted successfully" });
    });

    db.close();
});

/**
 * @swagger
 * /adminActivityLogs:
 *   get:
 *     summary: Retrieve logs of admin activities
 *     tags: [Admin]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A list of admin activities
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The auto-generated ID of the log entry
 *               admin_id:
 *                 type: integer
 *               activity:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 */
router.get('/adminActivityLogs', (req, res) => {
    let db = new sqlite3.Database(databasePath);
    let sql = `SELECT * FROM ActivityLog ORDER BY timestamp DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Error fetching activity logs" });
        }
        res.status(200).json({ data: rows });
    });

    db.close();
});

module.exports = router;
