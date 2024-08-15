const express = require("express");
const multer = require("multer");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dishes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       menu_id:
 *                         type: integer
 *                       image_link:
 *                         type: string
 *                         description: The relative path to the dish's image
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
 */
router.get("/getDishes", (req, res) => {
  const take_out = req.query.take_out === "true"; 
  const query = `
        SELECT Dish.id, Dish.name, Dish.price, Dish.menu_id, Dish.image_link 
        FROM Dish
        INNER JOIN Menu ON Dish.menu_id = Menu.id
        WHERE Menu.take_out = ?
    `;

  db.all(query, [take_out], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const protocol = req.protocol;
    const host = 'grublanerestaurant.com';

    const dishes = rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      menu_id: row.menu_id,
      image_url: `${protocol}://${host}/images/${path.basename(row.image_link)}`
    }));

    res.json({ dishes });
  });
});


const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;

    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
});

/**
 * @swagger
 * /dish/createDish:
 *   post:
 *     summary: Create a new dish
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *         description: Name of the dish
 *       - in: formData
 *         name: price
 *         type: number
 *         required: true
 *         description: Price of the dish
 *       - in: formData
 *         name: menu_id
 *         type: integer
 *         required: true
 *         description: ID of the menu to which the dish belongs
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Image of the dish
 *     responses:
 *       201:
 *         description: Dish created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The dish ID
 *                 name:
 *                   type: string
 *                   description: The name of the dish
 *                 price:
 *                   type: number
 *                   description: The price of the dish
 *                 menu_id:
 *                   type: integer
 *                   description: The ID of the menu to which the dish belongs
 *                 image_url:
 *                   type: string
 *                   description: The full URL to access the dish's image
 *       400:
 *         description: Invalid input, object invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
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
 */

router.post("/createDish", upload.single("image"), (req, res) => {
  const { name, price, menu_id } = req.body;

  if (!name || !price || !menu_id || !req.file) {
    return res.status(400).json({
      error: "All fields (name, price, menu_id, image) are required.",
    });
  }
  if (isNaN(price) || isNaN(menu_id)) {
    return res
      .status(400)
      .json({ error: "Price and menu_id must be valid numbers." });
  }

  const image_filename = req.file.filename;
  const image_link = `/app/database/images/${image_filename}`;
  const host = 'grublanerestaurant.com';
  const protocol = req.protocol;
  const image_url = `${protocol}://${host}/images/${image_filename}`;

  const query = `
        INSERT INTO Dish (name, price, menu_id, image_link)
        VALUES (?, ?, ?, ?)
    `;

  db.run(query, [name, price, menu_id, image_link], function (err) {
    if (err) {
      if (err.message.includes("FOREIGN KEY")) {
        return res
          .status(400)
          .json({ error: "Invalid menu_id. Please provide a valid menu_id." });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      name,
      price,
      menu_id,
      image_url,
    });
  });
});

module.exports = router;
