const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Employer = require('../models/Employer');
const Seeker = require('../models/Seeker');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create new user
    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { userId: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: { userId: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user profile
router.put('/update-profile', async (req, res) => {
  try {
    const { userId, name, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { userId: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

