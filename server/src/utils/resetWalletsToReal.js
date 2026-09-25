const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb+srv://campusride2026_db_user:THpiHVh1CNtxTZC9@cluster0.niatnmu.mongodb.net/campusride?retryWrites=true&w=majority';

async function resetWalletsToReal() {
  try {
    await mongoose.connect(uri);
    const User = require('../models/User');
    const Transaction = require('../models/Transaction');

    const users = await User.find({});
    let updatedCount = 0;

    for (const u of users) {
      const transactions = await Transaction.find({ userId: u._id, status: { $in: ['paid', 'completed'] } });
      let realBalance = 0;
      transactions.forEach(t => {
        if (t.type === 'wallet_topup' || t.type === 'driver_payout') {
          realBalance += t.amount || 0;
        } else if (t.type === 'ride_payment' && t.paymentGateway === 'campus_wallet') {
          realBalance -= t.amount || 0;
        }
      });

      realBalance = Math.max(0, realBalance);
      u.walletBalance = realBalance;
      await u.save();
      updatedCount++;
      console.log(`Updated User: ${u.fullName} (${u.email}) -> Real Wallet Balance: ₹${realBalance}`);
    }

    console.log(`\nSuccessfully updated ${updatedCount} users to real transaction-backed wallet balance!`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetWalletsToReal();
