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

module.exports = mongoose.model('User', userSchema);
