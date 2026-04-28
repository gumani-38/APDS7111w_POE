const router = require("express").Router();
const bcrypt = require("bcrypt");
const db = require("../config/databaseConnection");
const { generateAuthToken } = require("../middleware/Auth");

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, idNumber, accountNumber, username, password } =
      req.body;
    console.log("body", req.body);
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    // validate if the user already exists
    const sqlValidate = "SELECT * FROM Customers WHERE username = ?";
    const userFound = db.query(sqlValidate, [username]);
    if (userFound.length > 0) {
      return res.status(400).json("User already exists");
    }

    const sqlInsert =
      "INSERT INTO Customers (firstName, lastName, idNumber, accountNumber, username, password) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [
      firstName,
      lastName,
      idNumber,
      accountNumber,
      username,
      hashedPassword,
    ];
    const result = db.query(sqlInsert, values);
    res
      .status(200)
      .json({ result, message: "Customer successfully registered" });
  } catch (err) {
    console.log(" error while logging in", err);
    res.status(500).json(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ?";
    const result = db.query(sql, [username]);
    if (result.length === 0) {
      res.status(404).json("User not found");
    } else {
      const validPassword = await bcrypt.compare(password, result[0].password);
      if (!validPassword) {
        res.status(400).json("Wrong password");
      } else {
        const token = generateAuthToken(result[0]);
        res.cookie("token", token, {
          httpOnly: true, // Prevents client-side JS from accessing the cookie (XSS protection)
          secure: process.env.NODE_ENV === "production", // Use true for HTTPS in production
          sameSite: "strict", // Protects against CSRF
          maxAge: 720000, // 12 minutes in milliseconds
        });

        res.status(200).json("Login successful");
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
