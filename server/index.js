const express = require("express");
const helmet = require("helmet");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
const userRoute = require("./router/user");
const transactionRoute = require("./router/transaction");
const employeeRoute = require("./router/employee");
const rateLimit = require("express-rate-limit");
require("./config/databaseConnection");
require("dotenv").config();

const app = express();
const cors = require("cors");

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
// add and rate limiters, cors, and other security middlewares as needed

app.use(
  helmet({
    frameguard: { action: "deny" }, // sets X-Frame-Options: DENY
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        frameAncestors: ["'none'"], // prevents embedding in iframes
      },
    },
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "30mb" }));
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 200, // limit each IP to 200 requests per 2 minutes
  standardHeaders: true, // send combined RateLimit header
  legacyHeaders: false, // disable X-RateLimit-* headers
  message: "Too many requests from this IP, please try again later.",
});
// Apply the rate limiting middleware to all requests.
app.use(limiter);
app.use("/api/user", userRoute);
app.use("/api/transaction", transactionRoute);
// app.use("/api/employee", employeeRoute);

// const sslOptions = {
//   key: fs.readFileSync(path.join(__dirname, "keys", "privatekey.pem")),
//   cert: fs.readFileSync(path.join(__dirname, "keys", "certificate.pem")),
// };

const port = process.env.PORT || 3500;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
