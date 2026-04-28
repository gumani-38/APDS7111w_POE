const express = require("express");
const helmet = require("helmet");
const app = express();
const cookieParser = require("cookie-parser");
const userRoute = require("./router/user");
const db = require("./config/databaseConnection");
require("dotenv").config();
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "30mb" }));
app.use("/api/user", userRoute);

const port = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
