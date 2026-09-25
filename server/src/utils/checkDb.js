const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb+srv://campusride2026_db_user:THpiHVh1CNtxTZC9@cluster0.niatnmu.mongodb.net/campusride?retryWrites=true&w=majority';

async function checkDb() {
  try {
    await mongoose.connect(uri);
    console.log('SUCCESS: Connected to MongoDB Atlas Cluster!');
    console.log('Host:', mongoose.connection.host);
    console.log('Database Name:', mongoose.connection.name);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n--- Active Collections & Document Counts ---');
    if (collections.length === 0) {
      console.log('Database is clean & ready for production usage.');
    } else {
      for (let c of collections) {
        const count = await mongoose.connection.db.collection(c.name).countDocuments();
        console.log(`• Collection "${c.name}": ${count} records`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
}

checkDb();
