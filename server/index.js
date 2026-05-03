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
  windowMs: 4 * 60 * 1000, // 4 minutes
  limit: 300, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  message: "Too many requests from this IP, please try again after 15 minutes",
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
