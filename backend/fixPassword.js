const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Usha@0506', salt);
  await User.updateOne(
    { email: 'usharaniusharani687532@gmail.com' },
    { $set: { password: hash } }
  );
  console.log('Password updated successfully');
  process.exit(0);
});
