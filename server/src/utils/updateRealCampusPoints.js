const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb+srv://campusride2026_db_user:THpiHVh1CNtxTZC9@cluster0.niatnmu.mongodb.net/campusride?retryWrites=true&w=majority';

async function updateRealCampusPoints() {
  try {
    await mongoose.connect(uri);
    const User = require('../models/User');
    const Ride = require('../models/Ride');
    const RideRequest = require('../models/RideRequest');
    const Rating = require('../models/Rating');

    const users = await User.find({});
    console.log(`Calculating real CampusPoints for ${users.length} users...`);

    for (const u of users) {
      const offeredCount = await Ride.countDocuments({ driverId: u._id });
      const takenCount = await RideRequest.countDocuments({ passengerId: u._id, status: 'accepted' });
      const ratingCount = await Rating.countDocuments({ reviewerId: u._id });
      const isVerified = u.verificationStatus === 'verified';

      // 50 pts per ride offered, 25 pts per ride taken, 15 pts per rating submitted, 20 pts for verification
      const realPoints = (offeredCount * 50) + (takenCount * 25) + (ratingCount * 15) + (isVerified ? 20 : 0);

      u.ridesOfferedCount = offeredCount;
      u.ridesTakenCount = takenCount;
      u.campusPoints = realPoints;
      await u.save();

      console.log(`User: ${u.fullName} (${u.email}) -> Offered: ${offeredCount}, Taken: ${takenCount}, Verified: ${isVerified} => Real CampusPoints: ${realPoints} pts`);
    }

    console.log('\nSuccessfully updated all users to real activity-based CampusPoints!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateRealCampusPoints();
