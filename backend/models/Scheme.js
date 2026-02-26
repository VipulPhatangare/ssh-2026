const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide scheme name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please provide scheme description']
  },
  department: {
    type: String,
    required: [true, 'Please provide department name'],
    enum: [
      'Social Welfare', 'Education', 'Health', 'Agriculture', 
      'Women & Child Development', 'Labour', 'Revenue', 
      'Rural Development', 'Urban Development', 'Finance'
    ]
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
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'All']
    }],
    gender: [{
      type: String,
      enum: ['Male', 'Female', 'Other', 'All']
    }],
    occupations: [{
      type: String,
      enum: ['Student', 'Farmer', 'Business', 'Job', 'Unemployed', 'Self-Employed', 'Retired', 'Other', 'All']
    }]
  },
  requiredDocuments: [{
    type: String,
    enum: [
      'Aadhaar Card', 'Income Certificate', 'Caste Certificate', 
      'Domicile Certificate', 'Age Proof', 'Educational Certificate', 
      'Bank Passbook', 'Ration Card', 'Voter ID', 'Pan Card',
      'Samagra ID', 'Land Documents', 'Disability Certificate',
      'BPL Card', 'Death Certificate', 'Birth Certificate'
    ]
  }],
  lifeEvents: [{
    type: String,
    enum: ['Student', 'Farmer', 'Senior Citizen', 'Medical Emergency', 'Marriage', 'New Child', 'General']
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
