const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb+srv://campusride2026_db_user:THpiHVh1CNtxTZC9@cluster0.niatnmu.mongodb.net/campusride?retryWrites=true&w=majority';

async function testPlatformStats() {
  try {
    await mongoose.connect(uri);
    const User = require('../models/User');
    const Ride = require('../models/Ride');

    const totalStudents = await User.countDocuments({});
    const totalRides = await Ride.countDocuments({});

    const rides = await Ride.find({});
    let totalFareVolume = 0;
    rides.forEach(r => {
      totalFareVolume += (r.pricePerSeat || 100) * (r.availableSeats || 3);
    });

    console.log('--- MongoDB Atlas Real Live Stats ---');
    console.log('Real Registered Students:', totalStudents);
    console.log('Real Campus Rides Posted:', totalRides);
    console.log('Real Fare Volume (INR):', totalFareVolume);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testPlatformStats();
