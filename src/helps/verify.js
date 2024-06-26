const jwt = require("jsonwebtoken");
const logger = require("../logger/logger");
const Cookies = require('cookies');

const verifyToken = (req, res, next) => {
  logger.info('Headers:', req.headers);

  let token = null;

  // Check if the authorization header contains a Bearer token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    logger.info('Token found in Authorization header:', token);
  } else {
    // If no Authorization header, check cookies for accessToken
    const cookies = new Cookies(req, res);
    token = cookies.get('accessToken');
    if (token) {
      logger.info('Token found in cookies:', token);
    } else {
      logger.warn('No token found in Authorization header or cookies');
      return res.status(401).json("You are not authenticated.");
    }
  }

  // Decode the token to inspect its contents
  const decodedToken = jwt.decode(token);
  logger.info('Decoded token:', decodedToken);

  // Verify the token
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
