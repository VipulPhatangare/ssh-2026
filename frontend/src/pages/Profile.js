import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Profile.css';

const Profile = () => {
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
      setMessage('Failed to open document. Please try again.');
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
      setMessage('Failed to download document. Please try again.');
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
      setMessage('✓ Document uploaded successfully!');
    } else {
      setDocUploadState(prev => ({ ...prev, [docType]: 'error' }));
      setMessage(result.message || 'Failed to upload document');
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
      setMessage('✓ Profile updated successfully!');
    } else {
      setMessage(result.message || 'Failed to update profile');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1>My Profile</h1>

        {message && (
          <div className={`alert ${message.includes('✓') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div className="card profile-card">
          <form onSubmit={handleSubmit} className="profile-form-wrapper">
            {/* BASIC INFORMATION SECTION */}
            <div className="form-section">
              <h2 className="section-heading">Basic Information</h2>
              
              <div className="form-grid">
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
                  <label>Email</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="disabled-input"
                  />
                  <small>Email cannot be changed</small>
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

                <div className="form-group">
                  <label>Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Caste Category *</label>
                  <select name="casteCategory" value={formData.casteCategory} onChange={handleChange} required>
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Annual Income (₹) *</label>
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
                  <select name="occupation" value={formData.occupation} onChange={handleChange} required>
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

                <div className="form-group">
                  <label>District *</label>
                  <select name="district" value={formData.district} onChange={handleChange} required>
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

                {user?.role && (
                  <div className="form-group">
                    <label>Account Role</label>
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
                Additional Government Details (Optional)
              </button>

              {showGovDetails && (
                <div className="gov-details-container">
                  <p className="helper-text">
                    Providing these details helps in eligibility matching but is not mandatory.
                  </p>

                  <h3 className="subsection-heading">Government ID Numbers</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Aadhaar Number</label>
                      <input
                        type="text"
                        name="aadhaarNumber"
                        value={formData.aadhaarNumber}
                        onChange={handleChange}
                        placeholder="12-digit Aadhaar"
                        pattern="[0-9]{12}"
                        maxLength="12"
                      />
                      <small>12 digits only • Securely stored</small>
                    </div>

                    <div className="form-group">
                      <label>PAN Number</label>
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
                      <label>Passport Number</label>
                      <input
                        type="text"
                        name="passportNumber"
                        value={formData.passportNumber}
                        onChange={handleChange}
                        placeholder="Passport number"
                      />
                    </div>

                    <div className="form-group">
                      <label>Driving License Number</label>
                      <input
                        type="text"
                        name="drivingLicenseNumber"
                        value={formData.drivingLicenseNumber}
                        onChange={handleChange}
                        placeholder="DL number"
                      />
                    </div>

                    <div className="form-group">
                      <label>Voter ID Number</label>
                      <input
                        type="text"
                        name="voterIdNumber"
                        value={formData.voterIdNumber}
                        onChange={handleChange}
                        placeholder="Voter ID"
                      />
                    </div>

                    <div className="form-group">
                      <label>Ration Card Number</label>
                      <input
                        type="text"
                        name="rationCardNumber"
                        value={formData.rationCardNumber}
                        onChange={handleChange}
                        placeholder="Ration card number"
                      />
                    </div>

                    <div className="form-group">
                      <label>Government Employee ID</label>
                      <input
                        type="text"
                        name="governmentEmployeeId"
                        value={formData.governmentEmployeeId}
                        onChange={handleChange}
                        placeholder="Employee ID"
                      />
                    </div>
                  </div>


                </div>
              )}
            </div>

            {/* DOCUMENTS SECTION */}
            <div className="form-section">
              <h2 className="section-heading">My Documents</h2>
              <p className="helper-text">Upload PDF documents up to 10MB each. Documents are securely stored and only visible to you.</p>

              <div className="documents-grid">
                {[
                  { key: 'incomeCertificate',   label: 'Income Certificate' },
                  { key: 'domicileCertificate', label: 'Domicile Certificate' },
                  { key: 'casteCertificate',    label: 'Caste Certificate' }
                ].map(({ key, label }) => {
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
                          <span className="uploaded-badge">✓ Uploaded</span>
                          <div className="doc-btn-row">
                            <button
                              type="button"
                              className="doc-btn doc-btn-view"
                              onClick={() => handleViewDocument(fileId)}
                              disabled={isUploading}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              className="doc-btn doc-btn-download"
                              onClick={() => handleDownloadDocument(fileId, label)}
                              disabled={isUploading}
                            >
                              Download
                            </button>
                            <button
                              type="button"
                              className="doc-btn doc-btn-replace"
                              onClick={() => fileInputRefs[key].current.click()}
                              disabled={isUploading}
                            >
                              {isUploading ? 'Uploading…' : 'Replace'}
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
                            {isUploading ? 'Uploading…' : '+ Upload PDF'}
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
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
