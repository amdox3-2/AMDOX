const express = require('express');
const router = express.Router();
const Employer = require('../models/Employer');
const User = require('../models/User');

// Get all employers with optional search
router.get('/', async (req, res) => {
  try {
    const { search, userId } = req.query;
    let query = {};

    // If userId is provided, find specific employer profile
    if (userId) {
      query.userId = userId;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const employers = await Employer.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: employers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single employer by ID
router.get('/:id', async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id)
      .populate('userId', 'name email');
    
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }

    res.json({ success: true, data: employer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create or update employer profile
router.post('/', async (req, res) => {
  try {
    const { userId, companyName, website, contactEmail, phone, address, description } = req.body;

    // Check if employer profile already exists
    let employer = await Employer.findOne({ userId });

    if (employer) {
      // Update existing profile
      employer.companyName = companyName || employer.companyName;
      employer.website = website || employer.website;
      employer.contactEmail = contactEmail || employer.contactEmail;
      employer.phone = phone || employer.phone;
      employer.address = address || employer.address;
      employer.description = description || employer.description;
      await employer.save();
    } else {
      // Create new profile
      employer = new Employer({
        userId,
        companyName,
        website,
        contactEmail,
        phone,
        address,
        description
      });
      await employer.save();
    }

    res.json({
      success: true,
      message: 'Employer profile saved successfully',
      data: employer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

