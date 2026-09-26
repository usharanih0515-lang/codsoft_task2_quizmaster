const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Quiz = require('./models/Quiz');
const User = require('./models/User');

dotenv.config();

const seedQuiz = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Find the first user to act as creator
    const user = await User.findOne();
    if (!user) {
      console.log('No user found to assign as creator.');
      process.exit(1);
    }

    const quizData = {
      title: 'JavaScript Basics',
      description: 'Test your knowledge of JavaScript fundamentals.',
      category: 'Programming',
      difficulty: 'Easy',
      isPublished: true,
      createdBy: user._id,
      questions: [
        {
          questionText: 'Which keyword is used to declare a variable whose value can be changed later?',
          options: [
            { text: 'const' },
            { text: 'let' },
            { text: 'fixed' },
            { text: 'static' }
          ],
          correctAnswer: 'let'
        },
        {
          questionText: 'Which of the following is a valid JavaScript array?',
          options: [
            { text: 'let colors = ("red", "blue", "green");' },
            { text: 'let colors = ["red", "blue", "green"];' },
            { text: 'let colors = {red, blue, green};' },
            { text: 'let colors = <red, blue, green>;' }
          ],
          correctAnswer: 'let colors = ["red", "blue", "green"];'
        },
        {
          questionText: 'What is the main purpose of a function in JavaScript?',
          options: [
            { text: 'To store multiple values' },
            { text: 'To create HTML elements only' },
            { text: 'To create a reusable block of code' },
            { text: 'To define CSS styles' }
          ],
          correctAnswer: 'To create a reusable block of code'
        },
        {
          questionText: 'Which method is commonly used to select an HTML element by its ID?',
          options: [
            { text: 'document.getElementById()' },
            { text: 'document.getElement()' },
            { text: 'document.selectId()' },
            { text: 'document.findId()' }
          ],
          correctAnswer: 'document.getElementById()'
        }
      ]
    };

    // Upsert the quiz based on title
    const existing = await Quiz.findOne({ title: 'JavaScript Basics' });
    if (existing) {
      await Quiz.findByIdAndUpdate(existing._id, quizData);
      console.log('Quiz updated successfully!');
    } else {
      await Quiz.create(quizData);
      console.log('Quiz created successfully!');
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedQuiz();
