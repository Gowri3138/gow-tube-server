const jwt = require("jsonwebtoken");
const logger = require("../logger/logger");

const verifyToken = (req, res, next) => {
  logger.info('Headers:', req.headers);
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('No token found in Authorization header');
    return res.status(401).json("You are not authenticated.");
  }

  const token = authHeader.split(' ')[1];

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
