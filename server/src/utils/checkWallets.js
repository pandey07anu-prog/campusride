const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb+srv://campusride2026_db_user:THpiHVh1CNtxTZC9@cluster0.niatnmu.mongodb.net/campusride?retryWrites=true&w=majority';

async function checkWallets() {
  try {
    await mongoose.connect(uri);
    const User = require('../models/User');
    const Transaction = require('../models/Transaction');

    const users = await User.find({}).select('fullName email walletBalance campusPoints');
    console.log('--- MongoDB Atlas Real User Wallet Balances ---');
    console.log(`Total Users: ${users.length}`);

    for (const u of users) {
      const txCount = await Transaction.countDocuments({ userId: u._id });
      console.log(`User: ${u.fullName} (${u.email}) | Wallet Balance: ₹${u.walletBalance} | Campus Points: ${u.campusPoints} | Transactions: ${txCount}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkWallets();
