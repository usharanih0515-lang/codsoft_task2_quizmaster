const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  
  // Set password to 'password123' for ALL accounts to make testing easy
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  const result = await User.updateMany(
    {}, // empty filter matches all documents
    { $set: { password: hashedPassword } }
  );
  console.log(`Updated passwords for ALL ${result.modifiedCount} user(s) to 'password123'.`);

  // Print all users so we can see who is what
  const users = await User.find({}).select('name email role');
  console.log('\n--- ALL ACCOUNTS IN DATABASE ---');
  users.forEach(u => console.log(`Email: ${u.email} | Role: ${u.role} | Name: ${u.name}`));

  await mongoose.disconnect();
};

run().catch(console.error);
