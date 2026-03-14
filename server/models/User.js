const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false // Optional for social login users
  },
  role: {
    type: String,
    enum: ['seeker', 'employer'],
    default: 'seeker'
  },
  name: {
    type: String,
    required: true
  },
  authType: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  socialId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null/undefined values
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

