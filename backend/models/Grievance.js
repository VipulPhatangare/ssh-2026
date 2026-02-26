const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  complaintText: {
    type: String,
    required: [true, 'Please provide complaint details'],
    minlength: [10, 'Complaint must be at least 10 characters']
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed', 'Escalated'],
    default: 'Open'
  },
  escalationLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  responses: [{
    respondent: {
      type: String,
      enum: ['Admin', 'Department', 'System']
    },
    message: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  grievanceNumber: {
    type: String,
    unique: true
  }
});

// Generate grievance number
grievanceSchema.pre('save', async function(next) {
  if (!this.grievanceNumber) {
    const count = await mongoose.model('Grievance').countDocuments();
    this.grievanceNumber = `GRV${Date.now()}${count + 1}`;
  }
  next();
});

// Update lastUpdated
grievanceSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Grievance', grievanceSchema);
