const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reporterGender: {
      type: String,
      enum: ['female', 'male', 'other', 'unspecified'],
      default: 'unspecified',
    },
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
    },
    category: {
      type: String,
      enum: ['unsafe_driving', 'harassment', 'no_show', 'fraud', 'other'],
      default: 'other',
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
