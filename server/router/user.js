const router = require("express").Router();
const bcrypt = require("bcrypt");
const db = require("../config/databaseConnection");
const { generateAuthToken, AuthorizedUser } = require("../middleware/Auth");
const joi = require("joi");
const rateLimit = require("express-rate-limit");
// input sanitation and validation schema
const registrationSchema = joi.object({
  firstName: joi
    .string()
    .pattern(new RegExp("^[a-zA-Z]+$"))
    .min(2)
    .max(30)
    .required(),
  lastName: joi
    .string()
    .pattern(new RegExp("^[a-zA-Z]+$"))
    .min(2)
    .max(30)
    .required(),
  idNumber: joi.string().pattern(new RegExp("^[0-9]+$")).length(13).required(),
  accountNumber: joi
    .string()
    .pattern(new RegExp("^[0-9]+$"))
    .length(10)
    .required(),
  username: joi.string().email().required(),
  password: joi.string().min(8).max(100).required(),
});

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, idNumber, accountNumber, username, password } =
      req.body;
    // validate the input data against the schema
    const { error } = registrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    // validate if the user already exists and sql injection prevention
    const sqlValidate =
      "SELECT * FROM Customers WHERE username = ? OR accountNumber = ?";
    const [userFound] = await db.execute(sqlValidate, [
      username,
      accountNumber,
    ]);
    if (userFound.length > 0) {
      return res.status(400).json({ error: "User already exists" });
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
    const [result] = await db.execute(sqlInsert, values);
    res
      .status(200)
      .json({ result: result[0], message: "Customer successfully registered" });
  } catch (err) {
    console.log(" error while registering in", err);
    res.status(500).json({ error: err });
  }
});

// login validation schema
const loginSchema = joi.object({
  username: joi.string().email().required(),
  accountNumber: joi
    .string()
    .pattern(new RegExp("^[0-9]+$"))
    .length(10)
    .required(),
  password: joi.string().min(3).max(100).required(),
});
router.post("/login", async (req, res) => {
  try {
    const { username, accountNumber, password } = req.body;
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    // validate if the user exists and sql injection prevention
    const sql =
      "SELECT * FROM Customers WHERE username = ? AND accountNumber = ?";
    const [result] = await db.execute(sql, [username, accountNumber]);

    if (result.length === 0)
      return res
        .status(404)
        .json({ error: "Invalid username, account number or password" });

    const validPassword = await bcrypt.compare(password, result[0].password);
    if (!validPassword)
      return res
        .status(400)
        .json({ error: "Invalid username, account number or password" });

    const token = generateAuthToken({
      customerId: result[0].customerId,
      username: result[0].username,
      role: "customer",
    });
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JS from accessing the cookie (XSS protection)
      secure: true, // Use true for HTTPS in production
      sameSite: "none", // Protects against CSRF
      maxAge: 720000, // 12 minutes in milliseconds
    });

    res.status(200).json("Login successful");
  } catch (err) {
    console.log(" error while logging in", err);
    res.status(500).json({ error: err });
  }
});
// rate limiter for profile route to prevent brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 7, // 7 attempts per window
  message: "Too many login attempts. Please try again later .",
  standardHeaders: true,
  legacyHeaders: false,
});
router.get("/logout", loginLimiter, AuthorizedUser, async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json("Logout successful");
  } catch (err) {
    console.log(" error while logging out", err);
    res.status(500).json({ error: err });
  }
});

router.get("/profile", AuthorizedUser, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const sql =
      "SELECT firstName, lastName, accountNumber, username FROM Customers WHERE customerId = ?";
    const [result] = await db.execute(sql, [customerId]);

    res.status(200).json(result[0]);
  } catch (err) {
    console.log(" error while fetching user data", err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
