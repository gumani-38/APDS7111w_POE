const router = require("express").Router();
const db = require("../config/databaseConnection");
const { AuthorizedUser } = require("../middleware/Auth");
const joi = require("joi");

// input validation schema for creating a transaction
const transactionSchema = joi.object({
  amount: joi.number().positive().precision(2).required(),
  currency: joi.string().pattern(new RegExp("^[A-Z]{3}$")).required(),
  provider: joi.string().pattern(new RegExp("^[A-Z]+$")).max(50).required(),
  payeeName: joi
    .string()
    .pattern(new RegExp("^[a-zA-Z ]+$"))
    .min(2)
    .max(100)
    .required(),
  payeeAccountNumber: joi
    .string()
    .pattern(new RegExp("^[0-9]+$"))
    .min(6)
    .max(50)
    .required(),
  swiftCode: joi
    .string()
    .pattern(new RegExp("^[A-Z0-9]{8}$|^[A-Z0-9]{11}$"))
    .required(),
});

// POST /api/transaction/create — customer creates a new payment
router.post("/create", AuthorizedUser, async (req, res) => {
  try {
    const { error } = transactionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      amount,
      currency,
      provider,
      payeeName,
      payeeAccountNumber,
      swiftCode,
    } = req.body;
    const customerId = req.user.customerId;

    const sqlInsert =
      "INSERT INTO Transactions (customerId, amount, currency, provider, payeeName, payeeAccountNumber, swiftCode) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [
      customerId,
      amount,
      currency,
      provider,
      payeeName,
      payeeAccountNumber,
      swiftCode,
    ];
    const [result] = await db.execute(sqlInsert, values);

    res.status(200).json({
      transactionId: result.insertId,
      message: "Transaction successfully created and pending verification",
    });
  } catch (err) {
    console.log("error while creating transaction", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/transaction/my — customer views their own transactions
router.get("/my", AuthorizedUser, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const sql =
      "SELECT transactionId, amount, currency, provider, payeeName, payeeAccountNumber, swiftCode, status, rejectedReason,createdAt FROM Transactions WHERE customerId = ? ORDER BY createdAt DESC";
    const [results] = await db.execute(sql, [customerId]);

    res.status(200).json(results);
  } catch (err) {
    console.log("error while fetching transactions", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
