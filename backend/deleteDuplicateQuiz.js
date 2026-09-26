const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Quiz = require('./models/Quiz');

dotenv.config();

const deleteDuplicate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Delete any quiz where title is exactly "Javascript"
    const result = await Quiz.deleteMany({ title: 'Javascript' });
    console.log(`Deleted ${result.deletedCount} duplicate 'Javascript' quizzes.`);

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

deleteDuplicate();
