const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Generate JWT (now includes role)
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Helper to normalize legacy roles to student
const normalizeRole = (role) => {
  if (role === 'teacher') return 'teacher';
  return 'student'; // everything else including missing/undefined/admin/user becomes student
};

// @desc    Register a new user (ALWAYS a teacher)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please add all fields' });
    }

    // Force role to teacher
    const role = 'teacher';

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Teacher registered successfully',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
          token: generateToken(user._id, user.role),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    
    // Normalize email to prevent trailing space/case issues
    if (email) email = email.trim().toLowerCase();

    console.log(`[LOGIN ATTEMPT] Email: "${email}", Password: "${password}"`);

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`[LOGIN FAILED] User not found for email: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account' });
    }
    
    if (user.isActive === false) {
      console.log(`[LOGIN FAILED] User is inactive: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account' });
    }

    const isMatch = await user.matchPassword(password);
    console.log(`[LOGIN MATCH] Password match result: ${isMatch}`);

    if (isMatch) {
      const finalRole = normalizeRole(user.role);
      res.json({
        success: true,
        message: 'User logged in successfully',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: finalRole,
          mustChangePassword: user.mustChangePassword,
          token: generateToken(user._id, finalRole),
        },
      });
    } else {
      console.log(`[LOGIN FAILED] Incorrect password for email: ${email}`);
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.log(`[LOGIN ERROR] ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const finalRole = normalizeRole(req.user.role);
    res.status(200).json({
      success: true,
      message: 'User data fetched successfully',
      data: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: finalRole,
        mustChangePassword: req.user.mustChangePassword
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  changePassword
};
