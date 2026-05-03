const express = require("express");
const helmet = require("helmet");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
const userRoute = require("./router/user");
const transactionRoute = require("./router/transaction");
const employeeRoute = require("./router/employee");
require("./config/databaseConnection");
require("dotenv").config();

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "30mb" }));

app.use("/api/user", userRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/employee", employeeRoute);

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, "keys", "privatekey.pem")),
  cert: fs.readFileSync(path.join(__dirname, "keys", "certificate.pem")),
};

const port = process.env.PORT || 3000;
https.createServer(sslOptions, app).listen(port, () => {
  console.log(`Server is running securely on https://localhost:${port}`);
});