const Ride = require('../models/Ride');
const Vehicle = require('../models/Vehicle');
const DriverProfile = require('../models/DriverProfile');
const User = require('../models/User');
const { computeMatchScore } = require('../services/matchingService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { getTodayDateString, isRideExpired } = require('../utils/dateUtils');


// @route   POST /api/rides
const offerRide = async (req, res, next) => {
  try {
    const {
      source,
      destination,
      date,
      departureTime,
      availableSeats,
      contribution,
      vehicleId,
      registrationNumber,
      vehicleNumber,
      vehicleModel,
      notes,
      pickupPoints,
      isRecurring,
      recurringDays,
      isGirlsOnly,
    } = req.body;

    const plateNumber = (registrationNumber || vehicleNumber || '').trim();
    const carModelName = (vehicleModel || '').trim();

    if (!source || !source.trim()) {
      return errorResponse(res, 400, 'Pickup location is required to publish a ride.');
    }
    if (!destination || !destination.trim()) {
      return errorResponse(res, 400, 'Drop-off destination is required to publish a ride.');
    }
    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      return errorResponse(res, 400, 'Pickup and drop-off locations cannot be the same.');
    }
    if (!date || !date.trim()) {
      return errorResponse(res, 400, 'Ride date is required to publish a ride.');
    }
    if (!departureTime || !departureTime.trim()) {
      return errorResponse(res, 400, 'Departure time is required to publish a ride.');
    }
    if (!availableSeats || Number(availableSeats) < 1 || Number(availableSeats) > 6) {
      return errorResponse(res, 400, 'Please enter available seats (between 1 and 6).');
    }
    if (contribution === undefined || contribution === null || contribution === '') {
      return errorResponse(res, 400, 'Contribution per seat is required (enter 0 for free ride).');
    }
    if (!plateNumber) {
      return errorResponse(res, 400, 'Vehicle registration plate number is required.');
    }
    if (!carModelName) {
      return errorResponse(res, 400, 'Vehicle car model name is required.');
    }

    if (isRideExpired(date, departureTime)) {
      return errorResponse(res, 400, 'Departure date and time must be in the future. Cannot offer a ride for a past scheduled time.');
    }

    // Verify user driver eligibility
    const user = await User.findById(req.user._id);
    if (user && user.verificationStatus !== 'verified') {
      return errorResponse(res, 403, 'Student verification required before offering rides');
    }

    let veh;
    if (vehicleId) {
      veh = await Vehicle.findById(vehicleId);
      if (veh && (plateNumber || carModelName)) {
        if (plateNumber) veh.registrationNumber = plateNumber.toUpperCase();
        if (carModelName) veh.model = carModelName;
        await veh.save();
      }
    } else {
      veh = await Vehicle.findOne({ ownerId: req.user._id });
      if (veh && (plateNumber || carModelName)) {
        if (plateNumber) veh.registrationNumber = plateNumber.toUpperCase();
        if (carModelName) veh.model = carModelName;
        await veh.save();
      }
    }

    if (!veh) {
      // Create new vehicle with driver's provided plate number and model
      veh = await Vehicle.create({
        ownerId: req.user._id,
        vehicleType: 'Car',
        model: carModelName || 'Student Car',
        registrationNumber: plateNumber ? plateNumber.toUpperCase() : ('PB-01-EXP-' + Math.floor(1000 + Math.random() * 9000)),
        capacity: Math.max(Number(availableSeats) + 1, 4),
      });
    }

    if (Number(availableSeats) > veh.capacity) {
      return errorResponse(res, 400, `Available seats (${availableSeats}) cannot exceed vehicle capacity (${veh.capacity})`);
    }

    const ride = await Ride.create({
      driverId: req.user._id,
      vehicleId: veh._id,
      source,
      destination,
      date,
      departureTime,
      totalSeats: Number(availableSeats),
      availableSeats: Number(availableSeats),
      contribution: Number(contribution),
      notes: notes || 'Student ride',
      pickupPoints: pickupPoints || [{ hubName: source }],
      isRecurring: !!isRecurring,
      recurringDays: recurringDays || [],
      isGirlsOnly: !!isGirlsOnly,
      status: 'scheduled',
    });

    // Increment driver's ridesOfferedCount
    await User.findByIdAndUpdate(req.user._id, { $inc: { ridesOfferedCount: 1, campusPoints: 20 } });

    // Create interactive Notification for Driver
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: req.user._id,
      type: 'RIDE_OFFERED',
      title: 'Ride Offered Successfully 🚗',
      message: `Your ride from ${source} ➔ ${destination} on ${date} at ${departureTime} is live and open for student requests!`,
      relatedEntity: { entityType: 'Ride', entityId: ride._id },
    });

    return successResponse(res, 201, 'Ride offered successfully!', ride);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/rides/search
const searchRides = async (req, res, next) => {
  try {
    const { source, destination, date, time, seats, minPrice, maxPrice, verifiedOnly, isGirlsOnly } = req.query;

    let dbRides = [];
    try {
      const todayStr = getTodayDateString();
      const queryObj = { status: { $in: ['scheduled', 'requests_received'] }, availableSeats: { $gt: 0 } };
      if (date) {
        queryObj.date = { $gte: date };
      } else {
        queryObj.date = { $gte: todayStr };
      }
      if (isGirlsOnly === 'true') queryObj.isGirlsOnly = true;
      const rawRides = await Ride.find(queryObj)
        .populate('driverId', 'fullName university rating ratingCount verificationStatus profileImage')
        .populate('vehicleId');

      dbRides = [];
      for (const r of rawRides) {
        if (isRideExpired(r.date, r.departureTime)) {
          Ride.findByIdAndUpdate(r._id, { status: 'completed' }).catch(() => {});
        } else {
          dbRides.push(r);
        }
      }
    } catch (err) {
      dbRides = [];
    }

    // Filter and attach match score only when user actually searched
    const hasSearchQuery = (source && source.trim()) || (destination && destination.trim());
    let results = dbRides.map((r) => {
      const rideObj = r.toObject ? r.toObject() : { ...r };
      if (hasSearchQuery) {
        const score = computeMatchScore(rideObj, {
          source,
          destination,
          departureTime: time,
          seats,
        });
        rideObj.matchScore = score;
      }
      return rideObj;
    });

    if (source && source.trim()) {
      const cleanSource = source.trim().toLowerCase();
      results = results.filter((r) => {
        const sourceMatch = r.source && r.source.toLowerCase().includes(cleanSource);
        const pickupMatch = Array.isArray(r.pickupPoints) && r.pickupPoints.some((p) => p.hubName && p.hubName.toLowerCase().includes(cleanSource));
        return sourceMatch || pickupMatch;
      });
    }

    if (destination && destination.trim()) {
      const cleanDest = destination.trim().toLowerCase();
      results = results.filter((r) => {
        return r.destination && r.destination.toLowerCase().includes(cleanDest);
      });
    }
    if (minPrice) {
      results = results.filter((r) => r.contribution >= Number(minPrice));
    }
    if (maxPrice) {
      results = results.filter((r) => r.contribution <= Number(maxPrice));
    }
    if (verifiedOnly === 'true') {
      results = results.filter((r) => r.driverId?.verificationStatus === 'verified');
    }
    if (isGirlsOnly === 'true') {
      results = results.filter((r) => r.isGirlsOnly === true);
    }

    // Sort by Match Score descending
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return successResponse(res, 200, `Found ${results.length} matching rides`, results);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/rides/going-now
const getGoingNowRides = async (req, res, next) => {
  try {
    let rides = [];
    try {
      const rawRides = await Ride.find({ status: 'scheduled', availableSeats: { $gt: 0 } })
        .populate('driverId', 'fullName rating verificationStatus profileImage')
        .sort({ date: 1, departureTime: 1 });

      const activeRides = [];
      for (const r of rawRides) {
        if (isRideExpired(r.date, r.departureTime)) {
          Ride.findByIdAndUpdate(r._id, { status: 'completed' }).catch(() => {});
        } else {
          activeRides.push(r);
        }
      }
      rides = activeRides.slice(0, 5);
    } catch (err) {
      rides = [];
    }

    return successResponse(res, 200, 'Active immediate rides fetched', rides);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/rides/:id
const getRideById = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driverId', 'fullName email phone university rating ratingCount verificationStatus profileImage emergencyContacts')
      .populate('vehicleId');

    if (!ride) {
      return errorResponse(res, 404, 'Ride not found');
    }

    if (isRideExpired(ride.date, ride.departureTime) && ['scheduled', 'requests_received'].includes(ride.status)) {
      ride.status = 'completed';
      await Ride.findByIdAndUpdate(ride._id, { status: 'completed' });
    }

    return successResponse(res, 200, 'Ride details fetched', ride);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/rides/:id/start
const startRide = async (req, res, next) => {
  try {
    await Ride.findByIdAndUpdate(req.params.id, { status: 'started' });
    return successResponse(res, 200, 'Ride status updated to STARTED');
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/rides/:id/complete
const completeRide = async (req, res, next) => {
  try {
    await Ride.findByIdAndUpdate(req.params.id, { status: 'completed' });
    return successResponse(res, 200, 'Ride status updated to COMPLETED');
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/rides/:id/cancel
const cancelRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return errorResponse(res, 404, 'Ride not found');

    if (ride.driverId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Unauthorized to cancel this ride');
    }

    await Ride.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    const RideRequest = require('../models/RideRequest');
    await RideRequest.updateMany({ rideId: req.params.id }, { status: 'cancelled' });

    return successResponse(res, 200, 'Ride cancelled successfully');
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/rides/:id
const deleteRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return errorResponse(res, 404, 'Ride not found');

    if (ride.driverId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Unauthorized to delete this ride');
    }

    await Ride.findByIdAndDelete(req.params.id);
    const RideRequest = require('../models/RideRequest');
    const Notification = require('../models/Notification');

    const requests = await RideRequest.find({ rideId: req.params.id });
    for (const r of requests) {
      if (r.passengerId) {
        await Notification.create({
          userId: r.passengerId,
          type: 'RIDE_CANCELLED',
          title: 'Ride Cancelled by Driver ⚠️',
          message: `Your upcoming ride from ${ride.source} ➔ ${ride.destination} was cancelled by the driver. Check backup rides on CampusRide.`,
        });
      }
    }

    await RideRequest.updateMany({ rideId: req.params.id }, { status: 'cancelled' });

    // Decrement driver's ridesOfferedCount
    await User.findByIdAndUpdate(req.user._id, { $inc: { ridesOfferedCount: -1 } });

    // Notification for Driver
    await Notification.create({
      userId: req.user._id,
      type: 'RIDE_CANCELLED',
      title: 'Ride Offer Deleted 🗑️',
      message: `Your offered ride from ${ride.source} ➔ ${ride.destination} has been cancelled and removed.`,
    });

    return successResponse(res, 200, 'Ride offer deleted successfully!');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  offerRide,
  searchRides,
  getGoingNowRides,
  getRideById,
  startRide,
  completeRide,
  cancelRide,
  deleteRide,
};
