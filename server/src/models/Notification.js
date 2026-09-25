const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true, // e.g. RIDE_REQUEST, REQUEST_ACCEPTED, REQUEST_REJECTED, RIDE_CANCELLED, VERIFICATION_UPDATE, NEW_MESSAGE
    },
    title: {
      type: String,
      default: 'CampusRide Alert',
    },
    message: {
      type: String,
      required: true,
    },
    relatedEntity: {
      entityType: { type: String }, // Ride, RideRequest, User, DriverProfile
      entityId: { type: mongoose.Schema.Types.ObjectId },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
