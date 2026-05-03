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
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:3001",
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

app.use("/api/user", userRoute);
app.use("/api/transaction", transactionRoute);
// app.use("/api/employee", employeeRoute);

// const sslOptions = {
//   key: fs.readFileSync(path.join(__dirname, "keys", "privatekey.pem")),
//   cert: fs.readFileSync(path.join(__dirname, "keys", "certificate.pem")),
// };

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
