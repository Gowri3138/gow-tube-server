const jwt = require("jsonwebtoken");
const logger = require("../logger/logger");

const verifyToken = (req, res, next) => {
  logger.info('Cookies:', req.cookies);
  const token = req.cookies.accessToken;
  if (!token) {
    logger.warn('No token found');
    return res.status(401).json("You are not authenticated.");
  }

jwt.verify(token, process.env.SECRET_JWT, (error, user) => {
  if (error) {
    logger.error('Token verification failed:', error.message);
    return res.status(403).json("Your token is invalid.");
  }
  req.channel = user;
  logger.info('Token verified, user:', user);
  next();
});
};

module.exports = verifyToken;