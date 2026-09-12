const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Verifies the JWT and attaches the authenticated user to req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error('Not authorized, user not found or deactivated');
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, invalid or expired token');
  }
});

// Restricts a route to one or more roles, e.g. authorize('tpo'), authorize('student', 'company')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user ? req.user.role : 'unknown'}' is not permitted to access this resource`);
    }
    next();
  };
};

module.exports = { protect, authorize };
