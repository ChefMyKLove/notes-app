const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please log in.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here_change_in_production');
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

module.exports = authMiddleware;
