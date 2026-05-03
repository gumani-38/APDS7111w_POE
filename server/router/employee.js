const router = require("express").Router();
const bcrypt = require("bcrypt");
const db = require("../config/databaseConnection");
const { generateAuthToken, AuthorizedEmployee } = require("../middleware/Auth");
const joi = require("joi");

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
router.post("/login", async (req, res) => {
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

    res.cookie("token", token, {
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

// GET /api/employee/pending-payments
router.get("/pending-payments", AuthorizedEmployee, async (req, res) => {
  try {
    const sql = `
      SELECT t.transactionId, t.amount, t.currency, t.provider, 
             t.payeeName, t.payeeAccountNumber, t.swiftCode, 
             t.status, t.createdAt,
             c.firstName, c.lastName, c.accountNumber AS customerAccountNumber
      FROM Transactions t
      JOIN Customers c ON t.customerId = c.customerId
      WHERE t.status = 'pending'
      ORDER BY t.createdAt ASC
    `;
    const [results] = await db.execute(sql);
    res.status(200).json(results);
  } catch (err) {
    console.log("error while fetching pending payments", err);
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
      [transactionId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    if (existing[0].status !== "pending") {
      return res.status(400).json({ error: `Transaction already ${existing[0].status}` });
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

module.exports = router;