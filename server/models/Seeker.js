const mongoose = require('mongoose');

const seekerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    type: String,
    trim: true
  },
  resumePath: {
    type: String,
    trim: true
  },
  resumeFileName: {
    type: String,
    trim: true
  },
  skills: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Seeker', seekerSchema);

