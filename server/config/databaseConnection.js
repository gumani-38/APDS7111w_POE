const mysql = require("mysql2");

const db = mysql
  .createPool({
    host: "gateway01.us-east-1.prod.aws.tidbcloud.com",
    port: 4000,
    user: "Tqqd4hzZVoNCHPy.root",
    password: "ujhM14XsdxRFCfK9",
    database: "test",

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    ssl: {
      rejectUnauthorized: false,
    },
  })
  .promise();

module.exports = db;
