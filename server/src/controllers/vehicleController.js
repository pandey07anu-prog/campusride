const Vehicle = require('../models/Vehicle');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @route   POST /api/vehicles
const addVehicle = async (req, res, next) => {
  try {
    const { vehicleType, model, registrationNumber, capacity, color, vehicleImage } = req.body;

    if (!vehicleType || !model || !registrationNumber || !capacity) {
      return errorResponse(res, 400, 'Vehicle type, model, registration number, and capacity are required');
    }

    const vehicle = await Vehicle.create({
      ownerId: req.user._id,
      vehicleType,
      model,
      registrationNumber,
      capacity,
      color: color || 'Black',
      vehicleImage: vehicleImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400',
      verificationStatus: 'verified',
    });

    return successResponse(res, 201, 'Vehicle added successfully', vehicle);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/vehicles
const getMyVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ ownerId: req.user._id });
    return successResponse(res, 200, 'Vehicles retrieved', vehicles);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addVehicle,
  getMyVehicles,
};
