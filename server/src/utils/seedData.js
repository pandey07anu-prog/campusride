const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Ride = require('../models/Ride');
const StudentVerification = require('../models/StudentVerification');
const DriverProfile = require('../models/DriverProfile');
const RideRequest = require('../models/RideRequest');
const PendingSignup = require('../models/PendingSignup');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Report = require('../models/Report');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusride');
    console.log('[Seed] Connected to MongoDB...');

    // Clear all existing collections & fake data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Ride.deleteMany({});
    await RideRequest.deleteMany({});
    await StudentVerification.deleteMany({});
    await DriverProfile.deleteMany({});
    await PendingSignup.deleteMany({});
    await Transaction.deleteMany({});
    await Notification.deleteMany({});
    await Report.deleteMany({});

    console.log('[Seed] Cleaned all fake users, vehicles & rides.');

    // Create single Admin user for platform safety management
    const adminHash = await bcrypt.hash('Admin@123', 10);
    await User.create({
      fullName: 'Campus Safety Admin',
      email: 'admin@campusride.edu',
      phone: '+91 99999 00000',
      passwordHash: adminHash,
      university: 'State Tech University',
      studentId: 'ADM-001',
      role: 'admin',
      verificationStatus: 'verified',
      rating: 5.0,
      campusPoints: 500,
    });

    console.log('[Seed] Created Admin account (admin@campusride.edu / Admin@123)');

    // Create test student account
    const studentHash = await bcrypt.hash('Student@123', 10);
    await User.create({
      fullName: 'Test Student',
      email: 'student@chitkara.edu.in',
      phone: '+91 88888 11111',
      passwordHash: studentHash,
      university: 'Chitkara University',
      studentId: 'STU-2026-001',
      role: 'student',
      verificationStatus: 'verified',
      rating: 4.8,
      campusPoints: 250,
    });

    console.log('[Seed] Created Student account (student@chitkara.edu.in / Student@123)');
    console.log('[Seed] Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error.message);
    process.exit(1);
  }
};

seedData();
