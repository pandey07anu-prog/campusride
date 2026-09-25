const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb+srv://campusride2026_db_user:THpiHVh1CNtxTZC9@cluster0.niatnmu.mongodb.net/campusride?retryWrites=true&w=majority';

async function inspectUsers() {
  try {
    await mongoose.connect(uri);
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users in database:`);
    users.forEach((u, i) => {
      console.log(`${i + 1}. Name: "${u.fullName}", Email: "${u.email}", Role: "${u.role}", Created: ${u.createdAt}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspectUsers();
