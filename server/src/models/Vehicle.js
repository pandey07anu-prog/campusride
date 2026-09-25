const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike', 'Scooter'],
      required: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
    },
    registrationNumber: {
      type: String,
      required: [true, 'Vehicle registration/plate number is required'],
      uppercase: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Passenger capacity is required'],
      min: [1, 'Capacity must be at least 1 passenger'],
      max: [7, 'Capacity cannot exceed 7 passengers'],
    },
    color: {
      type: String,
      default: 'Silver',
    },
    vehicleImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'verified',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
