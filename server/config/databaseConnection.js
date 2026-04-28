const mysql = require("mysql2");

const db = mysql
  .createPool({
    host: "localhost",
    user: "root",
    password: "rootuser",
    database: "apds7111w_poe",
  })
  .promise();

module.exports = db;
