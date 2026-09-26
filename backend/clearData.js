// One-time script to clear all data from the database
require('dotenv').config();
const mongoose = require('mongoose');

const clearAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-quiz-maker');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      await db.collection(col.name).deleteMany({});
      console.log(`  Cleared "${col.name}" — ${count} documents deleted`);
    }

    console.log('\n✅ All data cleared! Fresh app ready.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

clearAll();
