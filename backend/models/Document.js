const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    required: [true, 'Please specify document type'],
    enum: [
      'Aadhaar Card', 'Income Certificate', 'Caste Certificate', 
      'Domicile Certificate', 'Age Proof', 'Educational Certificate', 
      'Bank Passbook', 'Ration Card', 'Voter ID', 'Pan Card',
      'Samagra ID', 'Land Documents', 'Disability Certificate',
      'BPL Card', 'Death Certificate', 'Birth Certificate'
    ]
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String
  },
  expiryDate: {
    type: Date,
    default: null
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Document', documentSchema);
