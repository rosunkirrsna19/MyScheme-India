const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes (check if user is logged in)
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ msg: 'No user found with this id' });
      }

      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

// Middleware to authorize roles (e.g., Admin, Coordinator)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'User not found, authorization failed' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};