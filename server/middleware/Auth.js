const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateAuthToken = (user) => {
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "12m", // expires in 12 minutes
  });
  return token;
};

function AuthorizedUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).send("Access Denied");
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ message: "Unauthorized" });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = { AuthorizedUser, generateAuthToken };
