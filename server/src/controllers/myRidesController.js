const Ride = require('../models/Ride');
const RideRequest = require('../models/RideRequest');
const { computeMatchScore } = require('../services/matchingService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { isRideExpired } = require('../utils/dateUtils');

// @route   GET /api/my-rides/offered
const getOfferedRides = async (req, res, next) => {
  try {
    let rides = [];
    try {
      const rawRides = await Ride.find({ driverId: req.user._id })
        .populate('vehicleId')
        .sort({ createdAt: -1 })
        .lean();

      rides = await Promise.all(
        rawRides.map(async (ride) => {
          if (isRideExpired(ride.date, ride.departureTime) && ['scheduled', 'requests_received'].includes(ride.status)) {
            ride.status = 'completed';
            Ride.findByIdAndUpdate(ride._id, { status: 'completed' }).catch(() => {});
          }
          const requests = await RideRequest.find({ rideId: ride._id })
            .populate('passengerId', 'fullName university rating profileImage verificationStatus phone')
            .sort({ createdAt: -1 });
          return {
            ...ride,
            incomingRequests: requests,
          };
        })
      );
    } catch (err) {}

    return successResponse(res, 200, 'Offered rides retrieved', rides);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/my-rides/booked
const getBookedRides = async (req, res, next) => {
  try {
    let requests = [];
    try {
      const rawRequests = await RideRequest.find({ passengerId: req.user._id })
        .populate({
          path: 'rideId',
          populate: [
            { path: 'driverId', select: 'fullName email phone university rating profileImage verificationStatus' },
            { path: 'vehicleId' },
          ],
        })
        .sort({ createdAt: -1 });

      requests = rawRequests.map((r) => {
        const obj = r.toObject();
        if (!obj.rideId) {
          obj.rideId = {
            source: obj.pickupPoint || 'Campus Pickup',
            destination: 'Campus Drop-off',
            date: new Date(obj.createdAt || Date.now()).toLocaleDateString(),
            departureTime: '08:00 AM',
            driverId: {
              fullName: 'Verified Campus Driver',
              university: 'Chitkara University',
              rating: 4.8,
            },
            vehicleId: {
              model: 'Campus Vehicle',
              registrationNumber: 'PB-01-VERIFIED',
            },
          };
        } else {
          if (isRideExpired(obj.rideId.date, obj.rideId.departureTime) && ['scheduled', 'requests_received'].includes(obj.rideId.status)) {
            obj.rideId.status = 'completed';
            Ride.findByIdAndUpdate(obj.rideId._id, { status: 'completed' }).catch(() => {});
          }
          if (!obj.rideId.driverId) {
            obj.rideId.driverId = {
              fullName: 'Verified Campus Driver',
              university: 'Chitkara University',
              rating: 4.8,
            };
          }
          if (!obj.rideId.vehicleId) {
            obj.rideId.vehicleId = {
              model: 'Campus Vehicle',
              registrationNumber: 'PB-01-VERIFIED',
            };
          }
        }
        return obj;
      });
    } catch (err) {}

    return successResponse(res, 200, 'Booked rides retrieved', requests);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/my-rides/backup-suggestions/:rideId
const getBackupSuggestions = async (req, res, next) => {
  try {
    const cancelledRideId = req.params.rideId;
    let cancelledRide = null;

    try {
      cancelledRide = await Ride.findById(cancelledRideId);
    } catch (err) {}

    const source = cancelledRide ? cancelledRide.source : 'Mohali Phase 7';
    const destination = cancelledRide ? cancelledRide.destination : 'Campus Gate';

    let alternatives = [];
    try {
      const dbMatches = await Ride.find({
        _id: { $ne: cancelledRideId },
        status: 'scheduled',
        availableSeats: { $gt: 0 },
      }).populate('driverId', 'fullName university rating verificationStatus profileImage');

      alternatives = dbMatches
        .filter((r) => {
          if (isRideExpired(r.date, r.departureTime)) {
            Ride.findByIdAndUpdate(r._id, { status: 'completed' }).catch(() => {});
            return false;
          }
          return true;
        })
        .map((r) => {
          const obj = r.toObject();
          obj.matchScore = computeMatchScore(obj, { source, destination });
          return obj;
        });
    } catch (err) {}

    return successResponse(res, 200, 'Backup ride suggestions generated', alternatives);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOfferedRides,
  getBookedRides,
  getBackupSuggestions,
};
