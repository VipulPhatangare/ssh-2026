const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schemeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scheme',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Documents Required'],
    default: 'Pending'
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  timeline: [{
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Documents Verified', 'Approved', 'Rejected', 'Documents Required']
    },
    description: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  submittedDocuments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  remarks: {
    type: String,
    default: ''
  },
  applicationNumber: {
    type: String,
    unique: true
  }
});

// Generate application number before saving
applicationSchema.pre('save', async function(next) {
  if (!this.applicationNumber) {
    const count = await mongoose.model('Application').countDocuments();
    this.applicationNumber = `MP${Date.now()}${count + 1}`;
  }
  next();
});

// Update lastUpdated on save
applicationSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
