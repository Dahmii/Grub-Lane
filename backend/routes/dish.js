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
 *       500:
 *         description: Server error
 */
router.get("/getDishes", (req, res) => {
  const take_out = req.query.take_out === "true"; // Convert query string to boolean
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
    res.json({ dishes: rows });
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/app/grublane_project/database");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
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

  const image_link = `/app/grublane_project/database/${req.file.filename}`;

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
    res.status(201).json({ id: this.lastID, name, price, menu_id, image_link });
  });
});
module.exports = router;
