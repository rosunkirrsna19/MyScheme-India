const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scheme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scheme',
    required: true,
  },
  // --- UPDATED: 'formData' is now a flexible object ---
  // This will store the answers from the dynamic form, e.g., { "annualIncome": 50000, "proofOfResidence": "..." }
  formData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  documents: [
    {
      type: String, 
    },
  ],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'More Info Required'],
    default: 'Pending',
    required: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    default: null,
  },
  coordinatorNotes: {
    type: String,
    trim: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
  },
});

// Set reviewedAt date when status changes to Approved/Rejected
applicationSchema.pre('save', function (next) {
  if (this.isModified('status') && (this.status === 'Approved' || this.status === 'Rejected')) {
    this.reviewedAt = Date.now();
  }
  next();
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;