import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    age: user?.age || '',
    gender: user?.gender || '',
    casteCategory: user?.casteCategory || '',
    annualIncome: user?.annualIncome || '',
    occupation: user?.occupation || '',
    district: user?.district || '',
    samagraId: user?.samagraId || ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    
    if (result.success) {
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } else {
      setMessage(result.message);
    }

    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1>My Profile</h1>

        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div className="card profile-card">
          {!isEditing ? (
            <div className="profile-view">
              <div className="profile-info">
                <div className="info-item">
                  <label>Full Name:</label>
                  <span>{user?.fullName}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{user?.email}</span>
                </div>
                <div className="info-item">
                  <label>Age:</label>
                  <span>{user?.age}</span>
                </div>
                <div className="info-item">
                  <label>Gender:</label>
                  <span>{user?.gender}</span>
                </div>
                <div className="info-item">
                  <label>Caste Category:</label>
                  <span>{user?.casteCategory}</span>
                </div>
                <div className="info-item">
                  <label>Annual Income:</label>
                  <span>₹{user?.annualIncome?.toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <label>Occupation:</label>
                  <span>{user?.occupation}</span>
                </div>
                <div className="info-item">
                  <label>District:</label>
                  <span>{user?.district}</span>
                </div>
                {user?.samagraId && (
                  <div className="info-item">
                    <label>Samagra ID:</label>
                    <span>{user?.samagraId}</span>
                  </div>
                )}
                <div className="info-item">
                  <label>Role:</label>
                  <span className="badge badge-info">{user?.role}</span>
                </div>
              </div>
              <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Caste Category</label>
                <select name="casteCategory" value={formData.casteCategory} onChange={handleChange} required>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              <div className="form-group">
                <label>Annual Income (₹)</label>
                <input
                  type="number"
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Occupation</label>
                <select name="occupation" value={formData.occupation} onChange={handleChange} required>
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
                <label>Samagra ID (Optional)</label>
                <input
                  type="text"
                  name="samagraId"
                  value={formData.samagraId}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
