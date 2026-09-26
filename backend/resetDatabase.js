const mongoose = require('mongoose');
require('dotenv').config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-quiz-maker');
    console.log('Connected to MongoDB');

    const User = require('./models/User');
    const Quiz = require('./models/Quiz');
    const QuizAttempt = require('./models/QuizAttempt');

    const deletedAttempts = await QuizAttempt.deleteMany({});
    console.log(`Deleted ${deletedAttempts.deletedCount} quiz attempts.`);

    const deletedQuizzes = await Quiz.deleteMany({});
    console.log(`Deleted ${deletedQuizzes.deletedCount} quizzes.`);

    const deletedStudents = await User.deleteMany({ role: 'student' });
    console.log(`Deleted ${deletedStudents.deletedCount} student accounts.`);

    console.log('Clean slate complete! Teacher accounts preserved.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();
