const mongoose = require('mongoose');

const driverProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    licenceNumber: {
      type: String,
      required: [true, 'Driving licence number is required'],
      trim: true,
    },
    licenceDocumentUrl: {
      type: String,
      required: [true, 'Licence document image URL is required'],
    },
    verificationStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'verified', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DriverProfile', driverProfileSchema);
