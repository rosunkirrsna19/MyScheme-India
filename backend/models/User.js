const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); 

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Citizen', 'Admin', 'Coordinator'],
    default: 'Citizen',
  },
  profile: {
    firstName: String,
    lastName: String,
    age: Number,
    state: String,
    gender: String,
    occupation: {
      type: String,
      enum: ['', 'Student', 'Salaried', 'Self-Employed', 'Unemployed', 'Other'],
      default: '',
    },
    annualIncome: {
      type: Number,
      default: 0,
    },
    casteCategory: {
      type: String,
      enum: ['', 'General', 'OBC', 'SC', 'ST', 'Other'],
      default: '',
    },
    // --- NEW FIELDS ---
    isDisabed: {
      type: Boolean,
      default: false,
    },
    isBPL: {
      type: Boolean,
      default: false,
    },
    // We use a number for easy comparison (e.g., Graduate (3) >= 12th Pass (2))
    educationLevel: {
      type: Number,
      default: 0, // 0: N/A, 1: Below 10th, 2: 10th Pass, 3: 12th Pass, 4: Graduate, 5: Post-Graduate
    },
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method: Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;