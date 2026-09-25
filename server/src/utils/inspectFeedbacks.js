const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb+srv://campusride2026_db_user:THpiHVh1CNtxTZC9@cluster0.niatnmu.mongodb.net/campusride?retryWrites=true&w=majority';

async function inspectFeedbacks() {
  try {
    await mongoose.connect(uri);
    const feedbacks = await mongoose.connection.db.collection('feedbacks').find({}).toArray();
    console.log(`Found ${feedbacks.length} feedback records in database:`);
    console.log(JSON.stringify(feedbacks, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspectFeedbacks();
