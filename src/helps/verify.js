const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  console.log("Entering verifyToken middleware");
  const token = req.cookies.accessToken;
  if (!token) {
    console.log("No token found in cookies");
    return res.status(401).json("You are not authenticated.");
  }

jwt.verify(token, process.env.SECRET_JWT, (error, user) => {
  if (error) {
    console.log("Token verification failed:", error.message);
    return res.status(403).json("Your token is invalid.");
  }
  console.log("Token verified successfully");
  req.channel = user;
  next();
});
};

module.exports = verifyToken;