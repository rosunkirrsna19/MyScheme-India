const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  schemeType: {
    type: String,
    enum: ['Government', 'Private'],
    required: true,
    default: 'Government',
  },
  officialLink: {
    type: String,
    trim: true,
  },
  // --- NEW FIELD: SCHEME ASSIGNMENT ---
  // Stores the ID of the Coordinator assigned to this scheme
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model
    default: null,
  },
  // --- END NEW FIELD ---
  eligibility: {
    ageMin: Number,
    ageMax: Number,
    state: String,
    gender: String,
    annualIncomeMax: {
      type: Number 
    },
    casteCategory: {
      type: String
    },
    occupation: {
      type: String
    },
    requiresDisability: {
      type: Boolean,
      default: false,
    },
    requiresBPL: {
      type: Boolean,
      default: false,
    },
    educationLevelMin: {
      type: Number,
      default: 0,
    },
  },
  formFields: [
    {
      label: { type: String, required: true },
      fieldType: { type: String, enum: ['text', 'number', 'select', 'file'], required: true },
      options: [String],
      required: { type: Boolean, default: true },
    }
  ],
  benefits: [String],
  howToApply: String,
  documentsRequired: [String],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Scheme = mongoose.model('Scheme', schemeSchema);
module.exports = Scheme;