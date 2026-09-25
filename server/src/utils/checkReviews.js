const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb+srv://campusride2026_db_user:THpiHVh1CNtxTZC9@cluster0.niatnmu.mongodb.net/campusride?retryWrites=true&w=majority';

async function checkReviews() {
  try {
    await mongoose.connect(uri);
    const Feedback = require('../models/Feedback');
    const reviews = await Feedback.find().sort({ createdAt: -1 });

    console.log('--- MongoDB Atlas Saved Feedback Reviews ---');
    console.log(`Total Saved Reviews: ${reviews.length}`);
    reviews.forEach((r, i) => {
      console.log(`\n[Review ${i + 1}]`);
      console.log(`ID: ${r._id}`);
      console.log(`Name: ${r.name}`);
      console.log(`University: ${r.university}`);
      console.log(`Rating: ${r.rating} stars`);
      console.log(`Message: "${r.message}"`);
      console.log(`Date: ${r.createdAt}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkReviews();
