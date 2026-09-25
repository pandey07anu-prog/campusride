const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Ride = require('../models/Ride');
const RideRequest = require('../models/RideRequest');
const StudentVerification = require('../models/StudentVerification');
const DriverProfile = require('../models/DriverProfile');
const CommuteGroup = require('../models/CommuteGroup');
const PendingSignup = require('../models/PendingSignup');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Report = require('../models/Report');

const clearDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://campusride2026_db_user:THpiHVh1CNtxTZC9@cluster0.niatnmu.mongodb.net/campusride?retryWrites=true&w=majority';
    console.log('[Clear DB] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`[Clear DB] Found ${collections.length} collections in database.`);
    
    for (let col of collections) {
      const res = await mongoose.connection.db.collection(col.name).deleteMany({});
      console.log(` ✅ Cleared collection "${col.name}": removed ${res.deletedCount} documents`);
    }

    console.log('====================================================');
    console.log(`✅ Successfully wiped ALL fake database data from MongoDB Atlas!`);
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Clear DB Error]', error.message);
    process.exit(1);
  }
};

clearDatabase();
