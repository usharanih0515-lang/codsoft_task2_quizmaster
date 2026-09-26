const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  
  // Find all users and print them
  const users = await User.find({}).select('name email role');
  console.log('All users:');
  users.forEach(u => console.log(`  ${u.name} | ${u.email} | role: ${u.role}`));
  
  // Upgrade any user with role 'user' or 'student' to 'teacher'
  // We'll update based on name containing 'Usha' (case insensitive)
  const result = await User.updateMany(
    { name: { $regex: 'Usha', $options: 'i' } },
    { $set: { role: 'teacher' } }
  );
  console.log(`\nUpdated ${result.modifiedCount} user(s) to teacher role.`);

  const updated = await User.find({}).select('name email role');
  console.log('\nUpdated users:');
  updated.forEach(u => console.log(`  ${u.name} | ${u.email} | role: ${u.role}`));

  await mongoose.disconnect();
};

run().catch(console.error);
