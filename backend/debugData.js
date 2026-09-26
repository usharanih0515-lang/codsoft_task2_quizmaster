const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  const Quiz = require('./models/Quiz');
  const QuizAttempt = require('./models/QuizAttempt');

  const teachers = await User.find({ role: 'teacher' }).select('email name');
  const students = await User.find({ role: 'student' }).select('email name teacherId');
  const quizzes = await Quiz.find({}).select('title createdBy assignedStudents');
  const attempts = await QuizAttempt.find({})
    .populate('user', 'name email')
    .populate('quiz', 'title createdBy');

  console.log('\n=== TEACHERS ===');
  teachers.forEach(t => console.log(`  ${t._id} | ${t.name} | ${t.email}`));

  console.log('\n=== STUDENTS ===');
  students.forEach(s => console.log(`  ${s._id} | ${s.name} | ${s.email} | teacherId=${s.teacherId}`));

  console.log('\n=== QUIZZES ===');
  quizzes.forEach(q => console.log(`  ${q._id} | "${q.title}" | createdBy=${q.createdBy} | assignedStudents=${JSON.stringify(q.assignedStudents)}`));

  console.log('\n=== ATTEMPTS (QuizAttempt) ===');
  if (attempts.length === 0) {
    console.log('  No attempts found in database!');
  } else {
    attempts.forEach(a => console.log(`  ${a._id} | user=${a.user?.name}(${a.user?.email}) | quiz="${a.quiz?.title}" | score=${a.score}/${a.totalQuestions} | pct=${a.percentage}%`));
  }

  process.exit(0);
});
