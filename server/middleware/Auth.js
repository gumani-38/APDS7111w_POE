const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateAuthToken = (user) => {
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "12m", // expires in 12 mins
  });
  return token;
};

function AuthorizedUser(req, res, next) {
  const token = req.cookies.customerToken;
  if (!token) return res.status(401).send("Access Denied");
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    if (decoded.role !== "customer") {
      return res.status(403).json({ message: "Forbidden: customers only" });
    }
    req.user = decoded;
    next();
  });
}

function AuthorizedEmployee(req, res, next) {
  const token = req.cookies.employeeToken;
  if (!token) return res.status(401).send("Access Denied");
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    if (decoded.role !== "employee") {
      return res.status(403).json({ message: "Forbidden: employees only" });
    }
    req.user = decoded;
    next();
  });
}

module.exports = { AuthorizedUser, AuthorizedEmployee, generateAuthToken };
