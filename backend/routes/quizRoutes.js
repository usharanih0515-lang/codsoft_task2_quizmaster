const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  startQuiz,
  saveAnswers,
  submitQuiz,
  getMyAttempts,
  getMyQuizzes,
  getQuizResults,
  getTeacherAnalytics,
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Teacher analytics (must come before /:id to avoid conflict)
router.get('/teacher/analytics', protect, requireRole('teacher'), getTeacherAnalytics);

// My created quizzes (must come before /:id to avoid conflict) - TEACHER ONLY
router.get('/my', protect, requireRole('teacher'), getMyQuizzes);

// My quiz attempts history - STUDENTS & TEACHERS
router.get('/attempts/my', protect, getMyAttempts);

// Public listing & protected creation
router.route('/')
  .get(protect, getQuizzes)
  .post(protect, requireRole('teacher'), createQuiz);

// Single quiz
router.route('/:id')
  .get(protect, getQuiz)
  .put(protect, requireRole('teacher'), updateQuiz)
  .delete(protect, requireRole('teacher'), deleteQuiz);

// Start a quiz attempt
router.post('/:id/start', protect, startQuiz);

// Save answers during attempt
router.post('/:id/save-answers', protect, saveAnswers);

// Submit — protected so we can save the attempt against the user
router.post('/:id/submit', protect, submitQuiz);

// Quiz Results - Teacher Only
router.get('/:id/results', protect, requireRole('teacher'), getQuizResults);

module.exports = router;
