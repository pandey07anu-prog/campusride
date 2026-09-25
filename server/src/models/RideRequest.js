const mongoose = require('mongoose');

const rideRequestSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
    },
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedSeats: {
      type: Number,
      default: 1,
      min: 1,
    },
    pickupPoint: {
      type: String,
      default: 'Main Campus Gate 1',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    boardingStatus: {
      type: String,
      enum: ['not_boarded', 'boarded'],
      default: 'not_boarded',
    },
    boardingOtp: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
  },
  { timestamps: true }
);

rideRequestSchema.index({ rideId: 1, passengerId: 1 }, { unique: true });

module.exports = mongoose.model('RideRequest', rideRequestSchema);
