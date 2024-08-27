const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();
const databasePath = process.env.DATABASE_PATH;

/**
 * @swagger
 * /createPayments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       201:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/createPayments', (req, res) => {
    const { order_id, amount, payment_date, payment_method, status, paystack_refnumber } = req.body;
  
    if (!order_id || !amount || !payment_date || !payment_method || !status) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    let db = new sqlite3.Database(databasePath);
    let sql = `INSERT INTO Payments (order_id, amount, payment_date, payment_method, status, paystack_refnumber) VALUES (?, ?, ?, ?, ?, ?)`;
  
    db.run(sql, [order_id, amount, payment_date, payment_method, status, paystack_refnumber], function (err) {
      if (err) {
        return res.status(500).json({ error: "Error creating payment" });
      }
      res.status(201).json({
        id: this.lastID,
        order_id,
        amount,
        payment_date,
        payment_method,
        status,
        paystack_refnumber
      });
    });
  
    db.close();
  });
  
  /**
   * @swagger
   * /getPayments:
   *   get:
   *     summary: Retrieve a list of payments
   *     tags: [Payments]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: The page number to retrieve
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *         description: The number of payments per page
   *     responses:
   *       200:
   *         description: A list of payments with pagination information
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Payment'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     currentPage:
   *                       type: integer
   *                     pageSize:
   *                       type: integer
   *                     totalPayments:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *                     nextUrl:
   *                       type: string
   *                       nullable: true
   *                     prevUrl:
   *                       type: string
   *                       nullable: true
   *       500:
   *         description: Server error
   */
  router.get('/getPayments', (req, res) => {
    const { page = 1, pageSize = 10 } = req.query;
  
    const limit = parseInt(pageSize);
    const currentPage = parseInt(page);
    const offset = (currentPage - 1) * limit;
  
    let db = new sqlite3.Database(databasePath);
    let querySql = `
      SELECT * FROM Payments
      ORDER BY payment_date DESC
      LIMIT ? OFFSET ?
    `;
    let countSql = `SELECT COUNT(*) AS count FROM Payments`; // Query to get the total count of payments
  
    db.get(countSql, [], (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: "Error fetching payments count" });
      }
  
      const totalPayments = countResult.count;
      const totalPages = Math.ceil(totalPayments / limit);
  
      db.all(querySql, [limit, offset], (err, rows) => {
        if (err) {
          return res.status(500).json({ error: "Error fetching payments" });
        }
  
        const nextPage = currentPage < totalPages ? currentPage + 1 : null;
        const prevPage = currentPage > 1 ? currentPage - 1 : null;
  
        const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
        const nextUrl = nextPage ? `${baseUrl}?page=${nextPage}&pageSize=${limit}` : null;
        const prevUrl = prevPage ? `${baseUrl}?page=${prevPage}&pageSize=${limit}` : null;
  
        res.status(200).json({
          data: rows,
          pagination: {
            currentPage,
            pageSize: limit,
            totalPayments,
            totalPages,
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
  });
  
  module.exports = router;
