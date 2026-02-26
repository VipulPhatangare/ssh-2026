const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide scheme name'],
    trim: true,
    unique: true
  },
  schemeId: {
    type: String,
    required: [true, 'Please provide scheme ID'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide scheme description']
  },
  department: {
    type: String,
    required: [true, 'Please provide department name']
  },
  eligibility: {
    ageMin: {
      type: Number,
      default: 0
    },
    ageMax: {
      type: Number,
      default: 120
    },
    incomeMax: {
      type: Number,
      default: null
    },
    casteCategories: [{
      type: String
    }],
    gender: [{
      type: String
    }],
    occupations: [{
      type: String
    }]
  },
  requiredDocuments: [{
    type: String
  }],
  lifeEvents: [{
    type: String
  }],
  benefits: {
    type: String,
    required: [true, 'Please provide scheme benefits']
  },
  applyUrl: {
    type: String,
    required: [true, 'Please provide application URL']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scheme', schemeSchema);
