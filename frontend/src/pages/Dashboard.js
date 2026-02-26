import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [eligibleSchemes, setEligibleSchemes] = useState([]);
  const [unclaimedSchemes, setUnclaimedSchemes] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [documentAlerts, setDocumentAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eligibleRes, unclaimedRes, applicationsRes, alertsRes] = await Promise.all([
        api.get('/schemes/eligible/me'),
        api.get('/schemes/unclaimed/me'),
        api.get('/applications/my-applications'),
        api.get('/documents/expiry-alerts')
      ]);

      setEligibleSchemes(eligibleRes.data.eligible);
      setUnclaimedSchemes(unclaimedRes.data.data);
      setRecentApplications(applicationsRes.data.data.slice(0, 5));
      setDocumentAlerts(alertsRes.data.data);

      setStats({
        eligibleSchemes: eligibleRes.data.eligibleCount,
        unclaimedSchemes: unclaimedRes.data.count,
        totalApplications: applicationsRes.data.count,
        expiringDocuments: alertsRes.data.data.expiringDocuments.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Welcome, {user?.fullName}!</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats?.eligibleSchemes || 0}</h3>
            <p>Eligible Schemes</p>
          </div>
          <div className="stat-card highlight">
            <h3>{stats?.unclaimedSchemes || 0}</h3>
            <p>Unclaimed Benefits</p>
          </div>
          <div className="stat-card">
            <h3>{stats?.totalApplications || 0}</h3>
            <p>Total Applications</p>
          </div>
          <div className="stat-card warning">
            <h3>{stats?.expiringDocuments || 0}</h3>
            <p>Expiring Documents</p>
          </div>
        </div>

        {unclaimedSchemes.length > 0 && (
          <div className="section">
            <h2>🎯 Missed Benefits - Apply Now!</h2>
            <div className="alert alert-info">
              You are eligible for {unclaimedSchemes.length} schemes that you haven't applied to yet!
            </div>
            <div className="schemes-list">
              {unclaimedSchemes.slice(0, 3).map((item) => (
                <div key={item.scheme._id} className="card scheme-card">
                  <h3>{item.scheme.name}</h3>
                  <p className="scheme-dept">{item.scheme.department}</p>
                  <p>{item.scheme.description}</p>
                  <div className="scheme-match">
                    <span className="badge badge-success">Match Score: {item.matchScore}%</span>
                  </div>
                  <a href={item.scheme.applyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    Apply Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {documentAlerts?.expiringDocuments.length > 0 && (
          <div className="section">
            <h2>⚠️ Document Expiry Alerts</h2>
            <div className="alert alert-error">
              {documentAlerts.expiringDocuments.length} of your documents are expiring soon!
            </div>
            <div className="documents-list">
              {documentAlerts.expiringDocuments.map((doc) => (
                <div key={doc._id} className="card">
                  <strong>{doc.documentType}</strong>
                  <p>Expires on: {new Date(doc.expiryDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentApplications.length > 0 && (
          <div className="section">
            <h2>Recent Applications</h2>
            <div className="applications-list">
              {recentApplications.map((app) => (
                <div key={app._id} className="card application-card">
                  <h3>{app.schemeId?.name}</h3>
                  <p>Application No: {app.applicationNumber}</p>
                  <span className={`badge badge-${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                  <p className="app-date">
                    Submitted: {new Date(app.submissionDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch(status) {
    case 'Approved': return 'success';
    case 'Rejected': return 'danger';
    case 'Pending': return 'warning';
    default: return 'info';
  }
};

export default Dashboard;
