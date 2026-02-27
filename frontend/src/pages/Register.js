import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        <h2>{t('registerTitle')}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>{t('fullNameLabel')}</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('emailLabel')} *</label>
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
              <label>{t('passwordLabel')} *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('ageLabel')}</label>
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
              <label>{t('genderLabel')}</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">{t('selectGender')}</option>
                <option value="Male">{t('male')}</option>
                <option value="Female">{t('female')}</option>
                <option value="Other">{t('other')}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('casteCategoryLabel')}</label>
              <select
                name="casteCategory"
                value={formData.casteCategory}
                onChange={handleChange}
                required
              >
                <option value="">{t('selectCategory')}</option>
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
              <label>{t('annualIncomeRs')}</label>
              <input
                type="number"
                name="annualIncome"
                value={formData.annualIncome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('occupationLabel')}</label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                required
              >
                <option value="">{t('selectOccupation')}</option>
                <option value="Student">{t('occupationStudent')}</option>
                <option value="Farmer">{t('occupationFarmer')}</option>
                <option value="Business">{t('occupationBusiness')}</option>
                <option value="Job">{t('occupationJob')}</option>
                <option value="Unemployed">{t('occupationUnemployed')}</option>
                <option value="Self-Employed">{t('occupationSelfEmployed')}</option>
                <option value="Retired">{t('occupationRetired')}</option>
                <option value="Other">{t('other')}</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('districtLabel')}</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
              >
                <option value="">{t('selectDistrict')}</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t('samagraIdLabel')}</label>
              <input
                type="text"
                name="samagraId"
                value={formData.samagraId}
                onChange={handleChange}
                placeholder={t('samagraIdPlaceholder')}
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
              {t('govDetails')}
            </button>

            {showGovDetails && (
              <div className="gov-details-container">
                <p className="helper-text">
                  {t('govDetailsHelper')}
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('aadhaarOptional')}</label>
                    <input
                      type="text"
                      name="aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={handleChange}
                      placeholder={t('aadhaarPlaceholder')}
                      pattern="[0-9]{12}"
                    />
                    <small>{t('aadhaarHelperShort')}</small>
                  </div>

                  <div className="form-group">
                    <label>{t('panOptional')}</label>
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
                    <label>{t('passportOptional')}</label>
                    <input
                      type="text"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleChange}
                      placeholder={t('passportPlaceholder')}
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('drivingLicenseOptional')}</label>
                    <input
                      type="text"
                      name="drivingLicenseNumber"
                      value={formData.drivingLicenseNumber}
                      onChange={handleChange}
                      placeholder={t('drivingLicensePlaceholder')}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('voterIdOptional')}</label>
                    <input
                      type="text"
                      name="voterIdNumber"
                      value={formData.voterIdNumber}
                      onChange={handleChange}
                      placeholder={t('voterIdPlaceholder')}
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('rationCardOptional')}</label>
                    <input
                      type="text"
                      name="rationCardNumber"
                      value={formData.rationCardNumber}
                      onChange={handleChange}
                      placeholder={t('rationCardPlaceholder')}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('govEmployeeIdOptional')}</label>
                    <input
                      type="text"
                      name="governmentEmployeeId"
                      value={formData.governmentEmployeeId}
                      onChange={handleChange}
                      placeholder={t('govEmployeeIdPlaceholder')}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            {t('register')}
          </button>
        </form>

        <p className="auth-link">
          {t('alreadyAccount')} <a href="/login">{t('loginHere')}</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
