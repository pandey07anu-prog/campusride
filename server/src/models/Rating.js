const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['driver_to_passenger', 'passenger_to_driver'],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
      default: '',
    },
    categories: {
      punctuality: { type: Number, min: 1, max: 5, default: 5 },
      behavior: { type: Number, min: 1, max: 5, default: 5 },
      driving: { type: Number, min: 1, max: 5, default: 5 },
    },
  },
  { timestamps: true }
);

ratingSchema.index({ rideId: 1, reviewerId: 1, reviewedUserId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
