import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './GrievancePage.css';

const GrievancePage = () => {
  const [grievances, setGrievances] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    applicationId: '',
    complaintText: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [grievancesRes, applicationsRes] = await Promise.all([
        api.get('/grievances/my-grievances'),
        api.get('/applications/my-applications')
      ]);
      setGrievances(grievancesRes.data.data);
      setApplications(applicationsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/grievances', formData);
      setMessage('Grievance submitted successfully!');
      setShowForm(false);
      setFormData({ applicationId: '', complaintText: '' });
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to submit grievance');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Resolved': return 'success';
      case 'Open': return 'warning';
      case 'Escalated': return 'danger';
      default: return 'info';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="grievance-page">
      <div className="container">
        <div className="page-header">
          <h1>Grievances</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : 'Raise New Grievance'}
          </button>
        </div>

        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {showForm && (
          <div className="card">
            <h2>Submit New Grievance</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Application</label>
                <select
                  value={formData.applicationId}
                  onChange={(e) => setFormData({...formData, applicationId: e.target.value})}
                  required
                >
                  <option value="">-- Select Application --</option>
                  {applications.map((app) => (
                    <option key={app._id} value={app._id}>
                      {app.schemeId?.name} - {app.applicationNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Complaint Details</label>
                <textarea
                  rows="5"
                  value={formData.complaintText}
                  onChange={(e) => setFormData({...formData, complaintText: e.target.value})}
                  placeholder="Describe your issue in detail..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary">Submit Grievance</button>
            </form>
          </div>
        )}

        <div className="grievances-list">
          {grievances.length === 0 ? (
            <div className="alert alert-info">
              You haven't raised any grievances yet.
            </div>
          ) : (
            grievances.map((grievance) => (
              <div key={grievance._id} className="card grievance-card">
                <div className="grievance-header">
                  <div>
                    <h3>{grievance.applicationId?.schemeId?.name}</h3>
                    <p className="grievance-number">Grievance No: {grievance.grievanceNumber}</p>
                  </div>
                  <span className={`badge badge-${getStatusColor(grievance.status)}`}>
                    {grievance.status}
                  </span>
                </div>

                <p className="complaint-text">{grievance.complaintText}</p>

                <div className="grievance-meta">
                  <span>Escalation Level: {grievance.escalationLevel}</span>
                  <span>Created: {new Date(grievance.createdAt).toLocaleDateString()}</span>
                </div>

                {grievance.responses.length > 0 && (
                  <div className="responses-section">
                    <h4>Responses:</h4>
                    {grievance.responses.map((response, index) => (
                      <div key={index} className="response-item">
                        <strong>{response.respondent}</strong>
                        <p>{response.message}</p>
                        <span className="response-date">
                          {new Date(response.date).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GrievancePage;
