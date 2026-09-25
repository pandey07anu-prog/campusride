const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const rideRoutes = require('./routes/rideRoutes');
const requestRoutes = require('./routes/requestRoutes');
const myRidesRoutes = require('./routes/myRidesRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const featureRoutes = require('./routes/featureRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusRide Full-Stack Backend API is active and healthy! 🚗',
    timestamp: new Date().toISOString(),
  });
});

// Utility endpoint to clear test seed data from database
app.get('/api/clear-db', async (req, res) => {
  try {
    const User = require('./models/User');
    const Vehicle = require('./models/Vehicle');
    const Ride = require('./models/Ride');
    const RideRequest = require('./models/RideRequest');
    const StudentVerification = require('./models/StudentVerification');
    const DriverProfile = require('./models/DriverProfile');
    const CommuteGroup = require('./models/CommuteGroup');
    const Feedback = require('./models/Feedback');

    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Ride.deleteMany({});
    await RideRequest.deleteMany({});
    await StudentVerification.deleteMany({});
    await DriverProfile.deleteMany({});
    await CommuteGroup.deleteMany({});
    await Feedback.deleteMany({});

    return res.status(200).json({ success: true, message: 'All database collections cleared successfully!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/my-rides', myRidesRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
