const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  
  // Set password to 'password123' for Usharani accounts
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  const result = await User.updateMany(
    { name: { $regex: 'Usha', $options: 'i' } },
    { $set: { password: hashedPassword } }
  );
  console.log(`Updated passwords for ${result.modifiedCount} user(s) to 'password123'.`);

  await mongoose.disconnect();
};

run().catch(console.error);
