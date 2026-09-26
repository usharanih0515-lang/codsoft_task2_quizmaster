const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  const email = 'usharaniusharani687532@gmail.com';
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    console.log('User not found');
  } else {
    console.log('User found:', user.email);
    console.log('isActive:', user.isActive);
    console.log('role:', user.role);
    const isMatch = await user.matchPassword('Usha@0506');
    console.log('Password match Usha@0506?', isMatch);
  }
  
  process.exit(0);
});
