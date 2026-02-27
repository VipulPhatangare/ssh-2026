import React, { useState, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Profile.css';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateProfile } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showGovDetails, setShowGovDetails] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    casteCategory: '',
    annualIncome: '',
    occupation: '',
    district: '',
    samagraId: '',
    // Government identity fields
    aadhaarNumber: '',
    panNumber: '',
    passportNumber: '',
    drivingLicenseNumber: '',
    voterIdNumber: '',
    rationCardNumber: '',
    governmentEmployeeId: ''
  });
  
  // Per-document upload loading state
  const [docUploadState, setDocUploadState] = useState({
    incomeCertificate: null,   // null | 'uploading' | 'done' | 'error'
    domicileCertificate: null,
    casteCertificate: null
  });

  // Hidden file input refs for replace/upload buttons
  const fileInputRefs = {
    incomeCertificate: useRef(null),
    domicileCertificate: useRef(null),
    casteCertificate: useRef(null)
  };

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        age: user.age || '',
        gender: user.gender || '',
        casteCategory: user.casteCategory || '',
        annualIncome: user.annualIncome || '',
        occupation: user.occupation || '',
        district: user.district || '',
        samagraId: user.samagraId || '',
        aadhaarNumber: user.aadhaarNumber || '',
        panNumber: user.panNumber || '',
        passportNumber: user.passportNumber || '',
        drivingLicenseNumber: user.drivingLicenseNumber || '',
        voterIdNumber: user.voterIdNumber || '',
        rationCardNumber: user.rationCardNumber || '',
        governmentEmployeeId: user.governmentEmployeeId || ''
      });
    }
  }, [user]);

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

  // Open a document in a new tab by streaming it through the auth-protected endpoint
  const handleViewDocument = async (fileId) => {
    try {
      const response = await api.get(`/auth/download-document/${fileId}`, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(response.data);
      window.open(url, '_blank');
      // Release the blob URL after the tab has had time to load it
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      setMessage(t('failedOpenDoc'));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Download a document by saving it to disk with the original filename
  const handleDownloadDocument = async (fileId, label) => {
    try {
      const response = await api.get(`/auth/download-document/${fileId}`, {
        responseType: 'blob'
      });
      // Try to get the original filename from Content-Disposition header
      const disposition = response.headers?.['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"\s]+)"?/);
      const filename = match ? match[1] : `${label.replace(/\s+/g, '_')}.pdf`;

      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      setMessage(t('failedDownloadDoc'));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Upload or replace a single document immediately on file selection
  const handleDocumentUpload = async (docType, file) => {
    if (!file) return;
    setDocUploadState(prev => ({ ...prev, [docType]: 'uploading' }));
    const formData = new FormData();
    formData.append(docType, file);
    const result = await updateProfile(formData);
    if (result.success) {
      setDocUploadState(prev => ({ ...prev, [docType]: 'done' }));
      setMessage(t('docUploaded'));
    } else {
      setDocUploadState(prev => ({ ...prev, [docType]: 'error' }));
      setMessage(result.message || t('failedOpenDoc'));
    }
    setTimeout(() => {
      setMessage('');
      setDocUploadState(prev => ({ ...prev, [docType]: null }));
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    // Create FormData for file uploads
    const submitData = new FormData();
    
    // Add text fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });

    const result = await updateProfile(submitData);
    setIsLoading(false);
    
    if (result.success) {
      setMessage(t('profileUpdated'));
    } else {
      setMessage(result.message || t('failedOpenDoc'));
    }

    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1>{t('myProfile')}</h1>

        {message && (
          <div className={`alert ${message.includes('✓') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div className="card profile-card">
          <form onSubmit={handleSubmit} className="profile-form-wrapper">
            {/* BASIC INFORMATION SECTION */}
            <div className="form-section">
              <h2 className="section-heading">{t('basicInformation')}</h2>
              
              <div className="form-grid">
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
                  <label>{t('emailLabel')}</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="disabled-input"
                  />
                  <small>{t('emailCannotChange')}</small>
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

                <div className="form-group">
                  <label>{t('genderLabel')}</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">{t('selectGender')}</option>
                    <option value="Male">{t('male')}</option>
                    <option value="Female">{t('female')}</option>
                    <option value="Other">{t('other')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('casteCategoryLabel')}</label>
                  <select name="casteCategory" value={formData.casteCategory} onChange={handleChange} required>
                    <option value="">{t('selectCategory')}</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('annualIncomeLabel')}</label>
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
                  <select name="occupation" value={formData.occupation} onChange={handleChange} required>
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

                <div className="form-group">
                  <label>{t('districtLabel')}</label>
                  <select name="district" value={formData.district} onChange={handleChange} required>
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

                {user?.role && (
                  <div className="form-group">
                    <label>{t('accountRole')}</label>
                    <div className="readonly-field">
                      <span className="badge badge-info">{user.role}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GOVERNMENT IDENTITY SECTION */}
            <div className="form-section">
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

                  <h3 className="subsection-heading">{t('govIdNumbers')}</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('aadhaarLabel')}</label>
                      <input
                        type="text"
                        name="aadhaarNumber"
                        value={formData.aadhaarNumber}
                        onChange={handleChange}
                        placeholder={t('aadhaarPlaceholder')}
                        pattern="[0-9]{12}"
                        maxLength="12"
                      />
                      <small>{t('aadhaarHelper')}</small>
                    </div>

                    <div className="form-group">
                      <label>{t('panLabel')}</label>
                      <input
                        type="text"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleChange}
                        placeholder="ABCDE1234F"
                        pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                        maxLength="10"
                        style={{ textTransform: 'uppercase' }}
                      />
                      <small>Format: ABCDE1234F</small>
                    </div>

                    <div className="form-group">
                      <label>{t('passportLabel')}</label>
                      <input
                        type="text"
                        name="passportNumber"
                        value={formData.passportNumber}
                        onChange={handleChange}
                        placeholder={t('passportPlaceholder')}
                      />
                    </div>

                    <div className="form-group">
                      <label>{t('drivingLicenseLabel')}</label>
                      <input
                        type="text"
                        name="drivingLicenseNumber"
                        value={formData.drivingLicenseNumber}
                        onChange={handleChange}
                        placeholder={t('drivingLicensePlaceholder')}
                      />
                    </div>

                    <div className="form-group">
                      <label>{t('voterIdLabel')}</label>
                      <input
                        type="text"
                        name="voterIdNumber"
                        value={formData.voterIdNumber}
                        onChange={handleChange}
                        placeholder={t('voterIdPlaceholder')}
                      />
                    </div>

                    <div className="form-group">
                      <label>{t('rationCardLabel')}</label>
                      <input
                        type="text"
                        name="rationCardNumber"
                        value={formData.rationCardNumber}
                        onChange={handleChange}
                        placeholder={t('rationCardPlaceholder')}
                      />
                    </div>

                    <div className="form-group">
                      <label>{t('govEmployeeIdLabel')}</label>
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

            {/* DOCUMENTS SECTION */}
            <div className="form-section">
              <h2 className="section-heading">{t('myDocuments')}</h2>
              <p className="helper-text">{t('uploadHelper')}</p>

              <div className="documents-grid">
                {[
                  { key: 'incomeCertificate',   labelKey: 'incomeCertificate' },
                  { key: 'domicileCertificate', labelKey: 'domicileCertificate' },
                  { key: 'casteCertificate',    labelKey: 'casteCertificate' }
                ].map(({ key, labelKey }) => {
                  const label = t(labelKey);
                  const fileId   = user?.[key]?.toString();
                  const state    = docUploadState[key];
                  const isUploading = state === 'uploading';

                  return (
                    <div className="document-card" key={key}>
                      {/* Hidden file input — triggered programmatically */}
                      <input
                        type="file"
                        ref={fileInputRefs[key]}
                        style={{ display: 'none' }}
                        accept=".pdf"
                        onChange={(e) => handleDocumentUpload(key, e.target.files[0])}
                      />

                      <div className="document-card-header">
                        <span className="doc-icon">📄</span>
                        <span className="doc-label">{label}</span>
                      </div>

                      {fileId ? (
                        // Document already uploaded
                        <div className="doc-uploaded">
                          <span className="uploaded-badge">{t('uploaded')}</span>
                          <div className="doc-btn-row">
                            <button
                              type="button"
                              className="doc-btn doc-btn-view"
                              onClick={() => handleViewDocument(fileId)}
                              disabled={isUploading}
                            >
                              {t('view')}
                            </button>
                            <button
                              type="button"
                              className="doc-btn doc-btn-download"
                              onClick={() => handleDownloadDocument(fileId, label)}
                              disabled={isUploading}
                            >
                              {t('download')}
                            </button>
                            <button
                              type="button"
                              className="doc-btn doc-btn-replace"
                              onClick={() => fileInputRefs[key].current.click()}
                              disabled={isUploading}
                            >
                              {isUploading ? t('uploading') : t('replace')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        // No document yet
                        <div className="doc-empty">
                          <button
                            type="button"
                            className="doc-btn doc-btn-upload"
                            onClick={() => fileInputRefs[key].current.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? t('uploading') : t('uploadPdf')}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={isLoading}
              >
                {isLoading ? t('saving') : t('saveChanges')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
