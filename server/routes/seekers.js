const express = require('express');
const router = express.Router();
const Seeker = require('../models/Seeker');
const User = require('../models/User');

// Get all seekers with optional search
router.get('/', async (req, res) => {
  try {
    const { search, userId } = req.query;
    let query = {};

    // If userId is provided, find specific seeker profile
    if (userId) {
      query.userId = userId;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    const seekers = await Seeker.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: seekers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single seeker by ID
router.get('/:id', async (req, res) => {
  try {
    const seeker = await Seeker.findById(req.params.id)
      .populate('userId', 'name email');
    
    if (!seeker) {
      return res.status(404).json({ success: false, message: 'Seeker not found' });
    }

    res.json({ success: true, data: seeker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create or update seeker profile
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      fullName,
      email,
      phone,
      dateOfBirth,
      address,
      resumePath,
      resumeFileName,
      skills
    } = req.body;

    // Check if seeker profile already exists
    let seeker = await Seeker.findOne({ userId });

    if (seeker) {
      // Update existing profile
      seeker.fullName = fullName || seeker.fullName;
      seeker.email = email || seeker.email;
      seeker.phone = phone || seeker.phone;
      seeker.dateOfBirth = dateOfBirth || seeker.dateOfBirth;
      seeker.address = address || seeker.address;
      seeker.skills = skills || seeker.skills;
      if (resumePath) seeker.resumePath = resumePath;
      if (resumeFileName) seeker.resumeFileName = resumeFileName;
      await seeker.save();
    } else {
      // Create new profile
      seeker = new Seeker({
        userId,
        fullName,
        email,
        phone,
        dateOfBirth,
        address,
        resumePath,
        resumeFileName,
        skills
      });
      await seeker.save();
    }

    res.json({
      success: true,
      message: 'Seeker profile saved successfully',
      data: seeker
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

