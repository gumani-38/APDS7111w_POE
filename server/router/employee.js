const router = require("express").Router();
const bcrypt = require("bcrypt");
const db = require("../config/databaseConnection");
const { generateAuthToken, AuthorizedEmployee } = require("../middleware/Auth");
const joi = require("joi");
const rateLimit = require("express-rate-limit");
const { randomUUID } = require("crypto");
// employee login validation
const loginSchema = joi.object({
  username: joi
    .string()
    .pattern(new RegExp("^[a-zA-Z0-9@._-]+$"))
    .min(3)
    .max(50)
    .required(),
  password: joi.string().min(3).max(100).required(),
});

// POST /api/employee/login
// rate limiter for profile route to prevent brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 7,
  message: {
    error: "Too many login attempts. Please try again later after 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, password } = req.body;
    const sql = "SELECT * FROM Employees WHERE username = ?";
    const [result] = await db.execute(sql, [username]);

    if (result.length === 0)
      return res.status(404).json("Invalid username or password");

    const validPassword = await bcrypt.compare(password, result[0].password);
    if (!validPassword)
      return res.status(400).json("Invalid username or password");

    const token = generateAuthToken({
      employeeId: result[0].employeeId,
      username: result[0].username,
      role: "employee",
    });

    res.cookie("employeeToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 720000,
    });

    res.status(200).json("Login successful");
  } catch (err) {
    console.log("error while logging in employee", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// GET /api/employee/logout
router.get("/logout", AuthorizedEmployee, async (req, res) => {
  try {
    res.clearCookie("employeeToken");
    res.status(200).json("Logout successful");
  } catch (err) {
    console.log("error while logging out employee", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// GET /api/employee/pending-payments
router.get("/pending-payments", AuthorizedEmployee, async (req, res) => {
  try {
    // allow search by id, customer name or account number
    // filter by currency and status

    const { search, currency, status } = req.query;

    // default status = pending
    const paymentStatus = status || "pending";

    let sql = `
      SELECT 
        t.transactionId,
        t.amount,
        t.currency,
        t.provider,
        t.payeeName,
        t.payeeAccountNumber,
        t.swiftCode,
        t.status,
        t.createdAt,
        c.firstName,
        c.lastName,
        c.accountNumber AS customerAccountNumber
      FROM Transactions t
      JOIN Customers c 
        ON t.customerId = c.customerId
      WHERE t.status = ?
    `;

    const params = [paymentStatus];

    // Search filter
    if (search) {
      sql += `
        AND (
          t.transactionId LIKE ?
          OR c.firstName LIKE ?
          OR c.lastName LIKE ?
          OR c.accountNumber LIKE ?
        )
      `;

      const searchTerm = `%${search}%`;

      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Currency filter
    if (currency) {
      sql += ` AND t.currency = ?`;
      params.push(currency);
    }

    // Sort oldest first
    sql += ` ORDER BY t.createdAt ASC`;

    // Execute query
    const [results] = await db.execute(sql, params);

    res.status(200).json(results);
  } catch (err) {
    console.log("Error while fetching pending payments:", err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});
// GET /api/employee/profile
router.get("/profile", AuthorizedEmployee, async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const sql =
      "SELECT employeeId, fullName, username FROM Employees WHERE employeeId = ?";
    const [result] = await db.execute(sql, [employeeId]);
    if (result.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json(result[0]);
  } catch (err) {
    console.log("error while fetching employee profile", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/employee/verify-payment/:id
const verifySchema = joi.object({
  action: joi.string().valid("verify", "reject").required(),
});

router.patch("/verify-payment/:id", AuthorizedEmployee, async (req, res) => {
  try {
    const { error } = verifySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const transactionId = parseInt(req.params.id, 10);
    if (isNaN(transactionId) || transactionId <= 0) {
      return res.status(400).json({ error: "Invalid transaction ID" });
    }

    const { action } = req.body;
    const newStatus = action === "verify" ? "verified" : "rejected";
    const employeeId = req.user.employeeId;

    // Verifying transaction exists and is still pending
    const [existing] = await db.execute(
      "SELECT status FROM Transactions WHERE transactionId = ?",
      [transactionId],
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    if (existing[0].status !== "pending") {
      return res
        .status(400)
        .json({ error: `Transaction already ${existing[0].status}` });
    }

    const sql = `
      UPDATE Transactions 
      SET status = ?, verifiedBy = ?, verifiedAt = CURRENT_TIMESTAMP 
      WHERE transactionId = ?
    `;
    await db.execute(sql, [newStatus, employeeId, transactionId]);

    res.status(200).json({ message: `Transaction ${newStatus} successfully` });
  } catch (err) {
    console.log("error while verifying payment", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/submit-payment/:id", AuthorizedEmployee, async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id, 10);
    if (isNaN(transactionId) || transactionId <= 0) {
      return res.status(400).json({ error: "Invalid transaction ID" });
    }

    // Verify transaction exists
    const [existing] = await db.execute(
      "SELECT status FROM Transactions WHERE transactionId = ?",
      [transactionId],
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (existing[0].status !== "verified") {
      return res.status(400).json({
        error: "Only verified transactions can be submitted to SWIFT",
      });
    }

    const uetr = randomUUID();

    // ✅ Update status to submitted
    await db.execute(
      "UPDATE Transactions SET status = ?, uetr = ? WHERE transactionId = ?",
      ["submitted", uetr, transactionId],
    );

    return res.status(200).json({
      message: "Payment successfully submitted to SWIFT",
      transactionId,
      status: "submitted",
      uetr,
    });
  } catch (err) {
    console.log("error while submitting payment to SWIFT", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
