const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'University email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Mobile phone number is required'],
      trim: true,
    },
    emailOtp: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneOtp: {
      type: String,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    university: {
      type: String,
      required: [true, 'University/College name is required'],
      trim: true,
    },
    studentId: {
      type: String,
      required: [true, 'Student ID / Roll number is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'super_admin'],
      default: 'student',
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    gender: {
      type: String,
      enum: ['female', 'male', 'other', 'unspecified'],
      default: 'unspecified',
    },
    profileImage: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: 'Proud student exploring campus rides!',
    },
    department: {
      type: String,
      default: 'General',
    },
    batchYear: {
      type: String,
      default: '2026',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    ridesOfferedCount: {
      type: Number,
      default: 0,
    },
    ridesTakenCount: {
      type: Number,
      default: 0,
    },
    campusPoints: {
      type: Number,
      default: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    femaleReportsCount: {
      type: Number,
      default: 0,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    isVipPass: {
      type: Boolean,
      default: false,
    },
    vipPassExpiresAt: {
      type: Date,
    },
    emergencyContacts: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        relation: { type: String, default: 'Family' },
      },
    ],
    savedRoutes: [
      {
        title: { type: String, required: true },
        source: { type: String, required: true },
        destination: { type: String, required: true },
        sourceCoords: {
          lat: Number,
          lng: Number,
        },
        destCoords: {
          lat: Number,
          lng: Number,
        },
      },
    ],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isSuspended: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  // Check if passwordHash is already a bcrypt hash to prevent double-hashing
  if (this.passwordHash && (this.passwordHash.startsWith('$2a$') || this.passwordHash.startsWith('$2b$') || this.passwordHash.startsWith('$2y$'))) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
