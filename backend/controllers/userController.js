const User = require('../models/User');
const bcrypt = require('bcrypt');

// @desc    Get all students for logged-in teacher
// @route   GET /api/users/students
// @access  Private (Teacher)
const getStudents = async (req, res) => {
  try {
    const students = await User.find({
      teacherId: req.user.id,
      role: 'student',
      isActive: true
    }).select('-password');
    
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new student
// @route   POST /api/users/students
// @access  Private (Teacher)
const createStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and temporary password' });
    }

    const userExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const student = await User.create({
      name,
      email: email.trim().toLowerCase(),
      password,
      role: 'student',
      teacherId: req.user.id,
      mustChangePassword: true,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Student account created successfully',
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Soft delete a student
// @route   DELETE /api/users/students/:id
// @access  Private (Teacher)
const deleteStudent = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, teacherId: req.user.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found or unauthorized' });
    }

    student.isActive = false;
    await student.save();

    res.status(200).json({ success: true, message: 'Student removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset student password
// @route   PUT /api/users/students/:id/reset-password
// @access  Private (Teacher)
const resetStudentPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Please provide a new temporary password' });
    }

    const student = await User.findOne({ _id: req.params.id, teacherId: req.user.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found or unauthorized' });
    }

    student.password = password;
    student.mustChangePassword = true;
    await student.save();

    res.status(200).json({ success: true, message: 'Student password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudents,
  createStudent,
  deleteStudent,
  resetStudentPassword
};
