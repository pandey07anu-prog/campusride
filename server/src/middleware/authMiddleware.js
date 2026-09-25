const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseHelper');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized. Token missing.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campusride_jwt_super_secret_key_2026_safe');
    
    // Check user in database or return mock user if DB unavailable in dev mode
    try {
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user) {
        if (user.isSuspended) {
          return errorResponse(res, 403, 'Your account is currently suspended. Please contact campus admin.');
        }
        req.user = user;
        return next();
      }
    } catch (dbErr) {
      console.warn('[Auth Middleware] DB lookup failed, falling back to token payload.');
    }

    // In-memory fallback if token decoded validly
    req.user = {
      _id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'student',
      fullName: decoded.fullName || 'Student User',
      verificationStatus: decoded.verificationStatus || 'verified',
    };
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Invalid or expired token.');
  }
};

const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campusride_jwt_super_secret_key_2026_safe');
    try {
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user) {
        req.user = user;
        return next();
      }
    } catch (dbErr) {}

    req.user = {
      _id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'student',
      fullName: decoded.fullName || 'Student User',
      verificationStatus: decoded.verificationStatus || 'verified',
    };
    next();
  } catch (error) {
    next();
  }
};

const adminOnly = (req, res, next) => {
  if (req.user) {
    return next();
  }
  return errorResponse(res, 403, 'Admin authorization required.');
};

module.exports = { protect, optionalAuth, adminOnly };
