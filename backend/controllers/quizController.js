const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');

// @desc    Get quizzes (For students: only assigned quizzes)
// @route   GET /api/quizzes
// @access  Private
const getQuizzes = async (req, res) => {
  try {
    const { search, category, difficulty } = req.query;

    const query = { isPublished: true };

    if (req.user.role === 'student') {
      query.assignedStudents = req.user.id;
    } else if (req.user.role === 'teacher') {
      query.createdBy = req.user.id; // Teachers only see their own on this generic route too
    }

    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = { $regex: category, $options: 'i' };
    if (difficulty) query.difficulty = difficulty;

    const quizzes = await Quiz.find(query)
      .select('-questions.correctAnswer')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Quizzes fetched successfully',
      data: quizzes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private
const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .select('-questions.correctAnswer')
      .populate('createdBy', 'name');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Access control
    if (req.user.role === 'student') {
      if (!quiz.assignedStudents.includes(req.user.id)) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this quiz' });
      }
    } else if (req.user.role === 'teacher') {
      if (quiz.createdBy._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this quiz' });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Quiz fetched successfully',
      data: quiz,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a quiz
// @route   POST /api/quizzes
// @access  Private (Teacher)
const createQuiz = async (req, res) => {
  try {
    const { title, description, category, difficulty, timeLimit, questions, isPublished, assignedStudents, availableFrom, availableUntil } = req.body;

    if (availableFrom && availableUntil && new Date(availableFrom) > new Date(availableUntil)) {
      return res.status(400).json({ success: false, message: 'Available Until must be after Available From' });
    }

    // Validate assignedStudents if provided
    if (assignedStudents && assignedStudents.length > 0) {
      const validStudents = await User.find({ _id: { $in: assignedStudents }, teacherId: req.user.id });
      if (validStudents.length !== assignedStudents.length) {
        return res.status(403).json({ success: false, message: 'Some assigned students do not belong to you' });
      }
    }

    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficulty,
      timeLimit,
      questions,
      isPublished,
      availableFrom: availableFrom ? new Date(availableFrom) : null,
      availableUntil: availableUntil ? new Date(availableUntil) : null,
      assignedStudents: assignedStudents || [],
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Teacher)
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to modify this quiz' });
    }

    const { assignedStudents } = req.body;
    if (assignedStudents && assignedStudents.length > 0) {
      const validStudents = await User.find({ _id: { $in: assignedStudents }, teacherId: req.user.id });
      if (validStudents.length !== assignedStudents.length) {
        return res.status(403).json({ success: false, message: 'Some assigned students do not belong to you' });
      }
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: updatedQuiz,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Teacher)
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to modify this quiz' });
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start a quiz attempt
// @route   POST /api/quizzes/:id/start
// @access  Private
const startQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const now = new Date();

    // Authorization & availability check
    if (req.user.role === 'student') {
      if (!quiz.assignedStudents.includes(req.user.id)) {
        return res.status(403).json({ success: false, message: 'Not authorized to start this quiz' });
      }
      if (quiz.availableFrom && now < new Date(quiz.availableFrom)) {
        return res.status(400).json({ success: false, message: 'Quiz is not available yet.' });
      }
      if (quiz.availableUntil && now > new Date(quiz.availableUntil)) {
        return res.status(400).json({ success: false, message: 'This quiz is no longer available.' });
      }
    } else if (req.user.role === 'teacher') {
      if (quiz.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Teachers can only test their own created quizzes' });
      }
    }

    // Check if an attempt exists
    let attempt = await QuizAttempt.findOne({
      user: req.user.id,
      quiz: quiz._id,
      status: 'in_progress'
    });

    if (attempt) {
      if (now > attempt.expiresAt) {
        attempt.status = 'expired';
        attempt.submittedAt = now;
        await attempt.save();
      }
      return res.status(200).json({
        success: true,
        data: attempt
      });
    }

    // Create new attempt
    const timeLimitMinutes = quiz.timeLimit || 10;
    const expiresAt = new Date(now.getTime() + timeLimitMinutes * 60000);

    attempt = await QuizAttempt.create({
      user: req.user.id,
      quiz: quiz._id,
      score: 0,
      totalQuestions: quiz.questions.length,
      percentage: 0,
      answers: [],
      status: 'in_progress',
      startedAt: now,
      expiresAt
    });

    res.status(201).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auto-save answers for active attempt
// @route   POST /api/quizzes/:id/save-answers
// @access  Private
const saveAnswers = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: req.user.id,
      quiz: quiz._id,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Active attempt not found' });
    }

    const now = new Date();
    if (now > attempt.expiresAt) {
      attempt.status = 'expired';
      attempt.submittedAt = now;
      await attempt.save();
      return res.status(400).json({ success: false, message: 'Attempt expired', data: attempt });
    }

    let answersArray = [];
    if (Array.isArray(answers)) {
      answersArray = answers;
    } else if (answers && typeof answers === 'object') {
      answersArray = Object.entries(answers).map(([qId, val]) => ({
        questionId: qId,
        selectedAnswer: val
      }));
    }

    attempt.answers = answersArray;
    await attempt.save();

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit a quiz
// @route   POST /api/quizzes/:id/submit
// @access  Private
const submitQuiz = async (req, res) => {
  try {
    const { answers, attemptId } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (req.user.role === 'student' && !quiz.assignedStudents.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit this quiz' });
    } else if (req.user.role === 'teacher' && quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit this quiz' });
    }

    const attempt = await QuizAttempt.findOne({
      _id: attemptId || (req.body.attemptId), // Fallback if needed, wait, better rely on attemptId
      user: req.user.id,
      quiz: quiz._id
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: `Attempt is already ${attempt.status}` });
    }

    const now = new Date();
    const gracePeriodMs = 15000; // 15 seconds
    let isExpired = false;

    if (now > new Date(attempt.expiresAt.getTime() + gracePeriodMs)) {
      isExpired = true;
    }

    const finalAnswers = isExpired ? [] : (answers || []);

    let correctCount = 0;
    const results = [];

    quiz.questions.forEach((q) => {
      const userAnswer = finalAnswers.find((a) => a.questionId === q._id.toString());
      const selectedAnswer = userAnswer ? userAnswer.selectedAnswer : null;
      const isCorrect = selectedAnswer === q.correctAnswer;

      if (isCorrect) correctCount++;

      results.push({
        questionId: q._id,
        questionText: q.questionText,
        selectedAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
      });
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    attempt.score = correctCount;
    attempt.totalQuestions = totalQuestions;
    attempt.percentage = percentage;
    attempt.answers = results;
    attempt.status = isExpired ? 'expired' : 'submitted';
    attempt.submittedAt = now;
    
    await attempt.save();

    res.status(200).json({
      success: true,
      message: isExpired ? 'Attempt expired' : 'Quiz submitted successfully',
      data: {
        score: correctCount,
        totalQuestions,
        percentage,
        incorrectAnswers: totalQuestions - correctCount,
        results,
        status: attempt.status
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in user's quiz attempts (Role-aware)
// @route   GET /api/quizzes/attempts/my
// @access  Private
const getMyAttempts = async (req, res) => {
  try {
    let attempts;
    if (req.user.role === 'teacher') {
      const myQuizzes = await Quiz.find({ createdBy: req.user.id }).select('_id');
      const quizIds = myQuizzes.map(q => q._id);
      attempts = await QuizAttempt.find({ quiz: { $in: quizIds } })
        .populate('quiz', 'title category difficulty')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    } else {
      attempts = await QuizAttempt.find({ user: req.user.id })
        .populate('quiz', 'title category difficulty')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      message: 'Attempts fetched successfully',
      data: attempts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's created quizzes
// @route   GET /api/quizzes/my
// @access  Private (Teacher)
const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'User quizzes fetched successfully',
      data: quizzes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get results for a specific quiz (Teacher only)
// @route   GET /api/quizzes/:id/results
// @access  Private (Teacher)
const getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view these results' });
    }

    const attempts = await QuizAttempt.find({ quiz: req.params.id })
      .populate('user', 'name email teacherId')
      .sort({ createdAt: -1 });

    // Filter attempts to ensure they are from students belonging to this teacher
    const filteredAttempts = attempts.filter(
      attempt => attempt.user && attempt.user.teacherId && attempt.user.teacherId.toString() === req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Quiz results fetched successfully',
      data: filteredAttempts,
      quiz: {
        title: quiz.title,
        questionsCount: quiz.questions.length,
        assignedStudents: quiz.assignedStudents
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get teacher analytics and quiz performance
// @route   GET /api/quizzes/teacher/analytics
// @access  Private (Teacher)
const getTeacherAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Teacher access required' });
    }

    const totalStudents = await User.countDocuments({ teacherId: req.user.id, role: 'student', isActive: true });
    const myQuizzes = await Quiz.find({ createdBy: req.user.id })
      .select('title category difficulty questions assignedStudents availableFrom availableUntil timeLimit isPublished createdAt');
    const quizIds = myQuizzes.map(q => q._id);
    
    const allAttempts = await QuizAttempt.find({ quiz: { $in: quizIds } });
    const totalAttempts = allAttempts.length;

    const completedAttempts = allAttempts.filter(a => a.status === 'submitted' || a.status === 'expired');
    const averageScore = completedAttempts.length > 0 
      ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / completedAttempts.length)
      : 0;

    const quizPerformance = myQuizzes.map(quiz => {
      const attemptsForQuiz = allAttempts.filter(a => a.quiz.toString() === quiz._id.toString());
      const assignedCount = quiz.assignedStudents ? quiz.assignedStudents.length : 0;
      const uniqueStudents = new Set(attemptsForQuiz.map(a => a.user.toString())).size;
      const completionRate = assignedCount > 0 
        ? Math.min(100, Math.round((uniqueStudents / assignedCount) * 100))
        : (uniqueStudents > 0 ? 100 : 0);
      
      const quizAvgScore = attemptsForQuiz.length > 0
        ? Math.round(attemptsForQuiz.reduce((sum, a) => sum + (a.percentage || 0), 0) / attemptsForQuiz.length)
        : 0;

      return {
        quizId: quiz._id,
        title: quiz.title,
        assignedStudents: assignedCount,
        studentsAttempted: uniqueStudents,
        completionRate,
        averageScore: quizAvgScore,
        totalAttempts: attemptsForQuiz.length,
        isPublished: quiz.isPublished
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalQuizzes: myQuizzes.length,
        totalAttempts,
        averageScore,
        quizPerformance,
        quizzes: myQuizzes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  startQuiz,
  saveAnswers,
  getMyAttempts,
  getMyQuizzes,
  getQuizResults,
  getTeacherAnalytics
};
