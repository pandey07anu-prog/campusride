const { errorResponse } = require('../utils/responseHelper');

const adminOnly = (req, res, next) => {
  if (req.user) {
    return next();
  }
  return errorResponse(res, 403, 'Access denied. Please log in to access moderation center.');
};

module.exports = { adminOnly };
