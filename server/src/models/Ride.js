const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: false,
    },
    source: {
      type: String,
      required: [true, 'Starting location is required'],
      trim: true,
    },
    sourceCoords: {
      lat: { type: Number, default: 30.7333 },
      lng: { type: Number, default: 76.7794 },
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    destinationCoords: {
      lat: { type: Number, default: 30.7688 },
      lng: { type: Number, default: 76.5754 },
    },
    pickupPoints: [
      {
        hubName: String,
        lat: Number,
        lng: Number,
      },
    ],
    date: {
      type: String, // Store YYYY-MM-DD for easy string comparison and display
      required: [true, 'Ride date is required'],
    },
    departureTime: {
      type: String, // Store HH:MM (24h)
      required: [true, 'Departure time is required'],
    },
    estimatedArrival: {
      type: String,
      default: '35 mins',
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats offered is required'],
      min: 1,
      max: [6, 'Maximum 6 seats allowed per ride'],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
      max: [6, 'Maximum 6 seats allowed per ride'],
    },
    contribution: {
      type: Number,
      required: [true, 'Contribution per passenger is required'],
      min: 0,
    },
    notes: {
      type: String,
      default: 'Non-smoking, friendly commute! Please be on time at pickup hub.',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringDays: [
      {
        type: String,
        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
    ],
    status: {
      type: String,
      enum: ['scheduled', 'requests_received', 'confirmed', 'started', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    privacyLevel: {
      type: String,
      enum: ['university_wide', 'department_only', 'trusted_circle'],
      default: 'university_wide',
    },
    isGirlsOnly: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

rideSchema.index({ source: 'text', destination: 'text' });
rideSchema.index({ date: 1, departureTime: 1 });

module.exports = mongoose.model('Ride', rideSchema);
