const express = require('express');
const router = express.Router();
const { getMe } = require('../controllers/authController');
const { getMyQuizzes } = require('../controllers/quizController');
const { getStudents, createStudent, deleteStudent, resetStudentPassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/me', protect, getMe);
router.get('/me/quizzes', protect, getMyQuizzes);

// Teacher-managed students endpoints
router.post('/students', protect, requireRole('teacher'), createStudent);
router.get('/students', protect, requireRole('teacher'), getStudents);
router.delete('/students/:id', protect, requireRole('teacher'), deleteStudent);
router.put('/students/:id/reset-password', protect, requireRole('teacher'), resetStudentPassword);

module.exports = router;
