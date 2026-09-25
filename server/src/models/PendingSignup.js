const mongoose = require('mongoose');

const pendingSignupSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    university: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    // Email OTP Fields
    emailOtp: {
      type: String,
      default: null,
    },
    emailOtpExpiresAt: {
      type: Date,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailResendCount: {
      type: Number,
      default: 0,
    },
    lastEmailResendAt: {
      type: Date,
      default: null,
    },
    // WhatsApp OTP Fields
    whatsappOtp: {
      type: String,
      default: null,
    },
    whatsappOtpExpiresAt: {
      type: Date,
      default: null,
    },
    whatsappVerified: {
      type: Boolean,
      default: false,
    },
    whatsappResendCount: {
      type: Number,
      default: 0,
    },
    lastWhatsappResendAt: {
      type: Date,
      default: null,
    },
    // Mongo TTL Auto-Cleanup after 15 minutes
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 900, // 15 minutes in seconds
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PendingSignup', pendingSignupSchema);
