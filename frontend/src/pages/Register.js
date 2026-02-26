import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    casteCategory: '',
    annualIncome: '',
    occupation: '',
    district: '',
    samagraId: '',
    // Optional government identity fields
    aadhaarNumber: '',
    panNumber: '',
    passportNumber: '',
    drivingLicenseNumber: '',
    voterIdNumber: '',
    rationCardNumber: '',
    governmentEmployeeId: ''
  });
  const [showGovDetails, setShowGovDetails] = useState(false);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const districts = [
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
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await register(formData);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h2>Create Your Account</h2>
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Age *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Caste Category *</label>
              <select
                name="casteCategory"
                value={formData.casteCategory}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Annual Income (Rs.) *</label>
              <input
                type="number"
                name="annualIncome"
                value={formData.annualIncome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Occupation *</label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                required
              >
                <option value="">Select Occupation</option>
                <option value="Student">Student</option>
                <option value="Farmer">Farmer</option>
                <option value="Business">Business</option>
                <option value="Job">Job</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Retired">Retired</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>District *</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
              >
                <option value="">Select District</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Samagra ID (Optional)</label>
              <input
                type="text"
                name="samagraId"
                value={formData.samagraId}
                onChange={handleChange}
                placeholder="9-digit Samagra ID"
              />
            </div>
          </div>

          {/* OPTIONAL GOVERNMENT DETAILS SECTION */}
          <div className="optional-section">
            <button
              type="button"
              className="toggle-button"
              onClick={() => setShowGovDetails(!showGovDetails)}
            >
              <span className="toggle-icon">{showGovDetails ? '▼' : '▶'}</span>
              Additional Government Details (Optional)
            </button>

            {showGovDetails && (
              <div className="gov-details-container">
                <p className="helper-text">
                  Providing these details helps in eligibility matching but is not mandatory.
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <label>Aadhaar Number (Optional)</label>
                    <input
                      type="text"
                      name="aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={handleChange}
                      placeholder="12-digit Aadhaar number"
                      pattern="[0-9]{12}"
                    />
                    <small>12 digits only</small>
                  </div>

                  <div className="form-group">
                    <label>PAN Number (Optional)</label>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      placeholder="ABCDE1234F"
                      pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                    />
                    <small>Format: ABCDE1234F</small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Passport Number (Optional)</label>
                    <input
                      type="text"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleChange}
                      placeholder="Passport number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Driving License Number (Optional)</label>
                    <input
                      type="text"
                      name="drivingLicenseNumber"
                      value={formData.drivingLicenseNumber}
                      onChange={handleChange}
                      placeholder="Driving license number"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Voter ID Number (Optional)</label>
                    <input
                      type="text"
                      name="voterIdNumber"
                      value={formData.voterIdNumber}
                      onChange={handleChange}
                      placeholder="Voter ID number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Ration Card Number (Optional)</label>
                    <input
                      type="text"
                      name="rationCardNumber"
                      value={formData.rationCardNumber}
                      onChange={handleChange}
                      placeholder="Ration card number"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Government Employee ID (Optional)</label>
                    <input
                      type="text"
                      name="governmentEmployeeId"
                      value={formData.governmentEmployeeId}
                      onChange={handleChange}
                      placeholder="Government employee ID"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Register
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
