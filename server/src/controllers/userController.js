const User = require('../models/User');
const Ride = require('../models/Ride');
const RideRequest = require('../models/RideRequest');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @route   GET /api/users/me
const getUserProfile = async (req, res, next) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) user = req.user;

    const ridesOfferedCount = await Ride.countDocuments({ hostId: user._id });
    const ridesTakenCount = await RideRequest.countDocuments({ passengerId: user._id, status: 'accepted' });

    const userObj = user.toObject ? user.toObject() : { ...user };
    userObj.ridesOfferedCount = ridesOfferedCount;
    userObj.ridesTakenCount = ridesTakenCount;

    return successResponse(res, 200, 'User profile retrieved', userObj);
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/users/me
const updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, bio, department, batchYear, profileImage, gender } = req.body;
    let user = await User.findById(req.user._id);

    if (user) {
      if (fullName) user.fullName = fullName;
      if (bio !== undefined) user.bio = bio;
      if (department) user.department = department;
      if (batchYear) user.batchYear = batchYear;
      if (profileImage) user.profileImage = profileImage;
      if (gender) user.gender = gender;
      await user.save();
    }

    return successResponse(res, 200, 'Profile updated successfully', user || req.user);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/users/emergency-contacts
const addEmergencyContact = async (req, res, next) => {
  try {
    const { name, phone, relation } = req.body;
    if (!name || !phone) {
      return errorResponse(res, 400, 'Name and phone are required');
    }

    const user = await User.findById(req.user._id);
    if (user) {
      user.emergencyContacts.push({ name, phone, relation: relation || 'Family' });
      await user.save();
      return successResponse(res, 200, 'Emergency contact added', user.emergencyContacts);
    }

    return successResponse(res, 200, 'Emergency contact added', [{ name, phone, relation: relation || 'Family' }]);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/users/saved-routes
const saveRoute = async (req, res, next) => {
  try {
    const { title, source, destination } = req.body;
    if (!title || !source || !destination) {
      return errorResponse(res, 400, 'Title, source, and destination are required');
    }

    const user = await User.findById(req.user._id);
    if (user) {
      user.savedRoutes.push({ title, source, destination });
      await user.save();
      return successResponse(res, 200, 'Route saved successfully', user.savedRoutes);
    }

    return successResponse(res, 200, 'Route saved successfully', [{ title, source, destination }]);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/users/:id
const getUserPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('fullName university department batchYear verificationStatus rating ratingCount profileImage bio createdAt');

    if (user) {
      const ridesOfferedCount = await Ride.countDocuments({ hostId: user._id });
      const ridesTakenCount = await RideRequest.countDocuments({ passengerId: user._id, status: 'accepted' });

      const userObj = user.toObject();
      userObj.ridesOfferedCount = ridesOfferedCount;
      userObj.ridesTakenCount = ridesTakenCount;

      return successResponse(res, 200, 'Public profile fetched', userObj);
    }

    return errorResponse(res, 404, 'Student profile not found');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  addEmergencyContact,
  saveRoute,
  getUserPublicProfile,
};
