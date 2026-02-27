import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import './ApplicationTracker.css';

const ApplicationTracker = () => {
  const { t } = useTranslation();
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

  // Translate status values from English DB values to current language
  const translateStatus = (status) => {
    const map = {
      'Approved': t('statusApproved'),
      'Rejected': t('statusRejected'),
      'Pending': t('statusPending'),
      'Under Review': t('statusUnderReview')
    };
    return map[status] || status;
  };

  if (loading) {
    return <div className="loading">{t('loadingApplications')}</div>;
  }

  return (
    <div className="application-tracker">
      <div className="container">
        <h1>{t('myApplications')}</h1>

        {applications.length === 0 ? (
          <div className="alert alert-info">
            {t('noApplications')}
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
                  <p className="app-number">{t('applicationNo')}: {app.applicationNumber}</p>
                  <span className={`badge badge-${getStatusColor(app.status)}`}>
                    {translateStatus(app.status)}
                  </span>
                  <p className="app-date">
                    {t('submitted')}: {new Date(app.submissionDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            {selectedApp && (
              <div className="card application-details">
                <h2>{t('applicationDetails')}</h2>
                
                <div className="detail-section">
                  <h3>{t('schemeInformation')}</h3>
                  <p><strong>{t('schemeName')}:</strong> {selectedApp.schemeId?.name}</p>
                  <p><strong>{t('department')}:</strong> {selectedApp.schemeId?.department}</p>
                  <p><strong>{t('applicationNumber')}:</strong> {selectedApp.applicationNumber}</p>
                </div>

                <div className="detail-section">
                  <h3>{t('status')}</h3>
                  <span className={`badge badge-${getStatusColor(selectedApp.status)} badge-lg`}>
                    {translateStatus(selectedApp.status)}
                  </span>
                  {selectedApp.remarks && (
                    <p className="remarks"><strong>{t('remarks')}:</strong> {selectedApp.remarks}</p>
                  )}
                </div>

                <div className="detail-section">
                  <h3>{t('timeline')}</h3>
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
