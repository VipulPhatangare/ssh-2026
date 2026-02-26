const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  age: {
    type: Number,
    required: [true, 'Please provide your age'],
    min: [1, 'Age must be at least 1'],
    max: [120, 'Age must be less than 120']
  },
  gender: {
    type: String,
    required: [true, 'Please provide your gender'],
    enum: ['Male', 'Female', 'Other']
  },
  casteCategory: {
    type: String,
    required: [true, 'Please provide your caste category'],
    enum: ['General', 'OBC', 'SC', 'ST', 'EWS']
  },
  annualIncome: {
    type: Number,
    required: [true, 'Please provide your annual income'],
    min: [0, 'Income cannot be negative']
  },
  occupation: {
    type: String,
    required: [true, 'Please provide your occupation'],
    enum: ['Student', 'Farmer', 'Business', 'Job', 'Unemployed', 'Self-Employed', 'Retired', 'Other']
  },
  district: {
    type: String,
    required: [true, 'Please provide your district'],
    enum: [
      'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 
      'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 
      'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas', 
      'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 
      'Hoshangabad', 'Indore', 'Jabalpur', 'Jhabua', 'Katni', 
      'Khandwa', 'Khargone', 'Mandla', 'Mandsaur', 'Morena', 
      'Narsinghpur', 'Neemuch', 'Niwari', 'Panna', 'Raisen', 
      'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 
      'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 
      'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 
      'Umaria', 'Vidisha'
    ]
  },
  samagraId: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^\d{9}$/.test(v);
      },
      message: 'Samagra ID must be 9 digits'
    }
  },
  // ===== OPTIONAL GOVERNMENT IDENTITY FIELDS =====
  // Note: These fields are optional and prepared for future encryption
  aadhaarNumber: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true;
        // 12 digit Aadhaar validation
        return /^\d{12}$/.test(v);
      },
      message: 'Aadhaar number must be 12 digits'
    }
    // TODO: Add encryption before storing in production
  },
  panNumber: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true;
        // PAN format: ABCDE1234F (5 letters, 4 numbers, 1 letter)
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
      },
      message: 'PAN must be in format: ABCDE1234F'
    }
    // TODO: Add encryption before storing in production
  },
  passportNumber: {
    type: String,
    default: null
    // TODO: Add validation and encryption
  },
  drivingLicenseNumber: {
    type: String,
    default: null
    // TODO: Add validation and encryption
  },
  voterIdNumber: {
    type: String,
    default: null
    // TODO: Add encryption before storing in production
  },
  rationCardNumber: {
    type: String,
    default: null
    // TODO: Add encryption before storing in production
  },
  governmentEmployeeId: {
    type: String,
    default: null
  },
  // ===== DOCUMENT UPLOADS (GridFS File IDs) =====
  // Store GridFS file IDs instead of file paths
  incomeCertificate: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'uploads.files'
  },
  domicileCertificate: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'uploads.files'
  },
  casteCertificate: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'uploads.files'
  },
  role: {
    type: String,
    enum: ['Citizen', 'Admin'],
    default: 'Citizen'
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// Exclude sensitive fields from responses
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  // Note: DO NOT expose sensitive IDs in API responses
  // Remove or mask sensitive fields before sending to client
  delete user.password;
  // Optional: Mask sensitive IDs for security
  // if (user.aadhaarNumber) user.aadhaarNumber = 'XXXX-XXXX-' + user.aadhaarNumber.slice(-4);
  // if (user.panNumber) user.panNumber = user.panNumber.slice(0, 5) + '****' + user.panNumber.slice(-1);
  return user;
};
module.exports = mongoose.model('User', userSchema);
