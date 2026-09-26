const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  answers: [
    {
      questionId: String,
      questionText: String,
      selectedAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean,
    },
  ],
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'expired'],
    default: 'in_progress',
  },
  startedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
  submittedAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
