import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './ApplicationTracker.css';

const ApplicationTracker = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      setApplications(response.data.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      case 'Pending': return 'warning';
      case 'Under Review': return 'info';
      default: return 'info';
    }
  };

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="application-tracker">
      <div className="container">
        <h1>My Applications</h1>

        {applications.length === 0 ? (
          <div className="alert alert-info">
            You haven't submitted any applications yet.
          </div>
        ) : (
          <div className="applications-layout">
            <div className="applications-list">
              {applications.map((app) => (
                <div 
                  key={app._id} 
                  className={`card application-item ${selectedApp?._id === app._id ? 'active' : ''}`}
                  onClick={() => setSelectedApp(app)}
                >
                  <h3>{app.schemeId?.name}</h3>
                  <p className="app-number">Application No: {app.applicationNumber}</p>
                  <span className={`badge badge-${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                  <p className="app-date">
                    Submitted: {new Date(app.submissionDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            {selectedApp && (
              <div className="card application-details">
                <h2>Application Details</h2>
                
                <div className="detail-section">
                  <h3>Scheme Information</h3>
                  <p><strong>Scheme Name:</strong> {selectedApp.schemeId?.name}</p>
                  <p><strong>Department:</strong> {selectedApp.schemeId?.department}</p>
                  <p><strong>Application Number:</strong> {selectedApp.applicationNumber}</p>
                </div>

                <div className="detail-section">
                  <h3>Status</h3>
                  <span className={`badge badge-${getStatusColor(selectedApp.status)} badge-lg`}>
                    {selectedApp.status}
                  </span>
                  {selectedApp.remarks && (
                    <p className="remarks"><strong>Remarks:</strong> {selectedApp.remarks}</p>
                  )}
                </div>

                <div className="detail-section">
                  <h3>Timeline</h3>
                  <div className="timeline">
                    {selectedApp.timeline.map((item, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <strong>{item.status}</strong>
                          <p>{item.description}</p>
                          <span className="timeline-date">
                            {new Date(item.date).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationTracker;
