import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [eligibleSchemes, setEligibleSchemes] = useState([]);
  const [unclaimedSchemes, setUnclaimedSchemes] = useState([]);
  const [documentAlerts, setDocumentAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eligibleRes, unclaimedRes, alertsRes] = await Promise.all([
        api.get('/schemes/eligible/me'),
        api.get('/schemes/unclaimed/me'),
        api.get('/documents/expiry-alerts')
      ]);

      setEligibleSchemes(eligibleRes.data.eligible);
      setUnclaimedSchemes(unclaimedRes.data.data);
      setDocumentAlerts(alertsRes.data.data);

      setStats({
        eligibleSchemes: eligibleRes.data.eligibleCount,
        unclaimedSchemes: unclaimedRes.data.count,
        expiringDocuments: alertsRes.data.data.expiringDocuments.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="db-loading">
        <div className="db-loader"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="db-page">
      <div className="db-background-shapes">
        <div className="db-shape db-shape-1"></div>
        <div className="db-shape db-shape-2"></div>
        <div className="db-shape db-shape-3"></div>
      </div>
      
      <div className="db-container">
        {/* Hero Section */}
        <div className="db-hero">
          <div className="db-hero-content">
            <h1 className="db-title">
              <span className="db-wave">👋</span>
              Welcome back, {user?.fullName?.split(' ')[0]}!
            </h1>
            <p className="db-subtitle">Here's your personalized benefits overview</p>
          </div>
          <div className="db-hero-avatar">
            <div className="db-avatar">{user?.fullName?.charAt(0)}</div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="db-stats-grid">
          <div className="db-stat-card db-stat-blue">
            <div className="db-stat-icon">🎯</div>
            <div className="db-stat-content">
              <h3 className="db-stat-number">{stats?.eligibleSchemes || 0}</h3>
              <p className="db-stat-label">Eligible Schemes</p>
            </div>
            <div className="db-stat-glow"></div>
          </div>
          
          <div className="db-stat-card db-stat-green">
            <div className="db-stat-icon">💰</div>
            <div className="db-stat-content">
              <h3 className="db-stat-number">{stats?.unclaimedSchemes || 0}</h3>
              <p className="db-stat-label">Unclaimed Benefits</p>
            </div>
            <div className="db-stat-glow"></div>
          </div>
          
          <div className="db-stat-card db-stat-orange">
            <div className="db-stat-icon">📄</div>
            <div className="db-stat-content">
              <h3 className="db-stat-number">{stats?.expiringDocuments || 0}</h3>
              <p className="db-stat-label">Expiring Documents</p>
            </div>
            <div className="db-stat-glow"></div>
          </div>
        </div>

        {/* Unclaimed Benefits Section */}
        {unclaimedSchemes.length > 0 && (
          <div className="db-section">
            <div className="db-section-header">
              <h2 className="db-section-title">
                <span className="db-section-icon">🎯</span>
                Missed Benefits - Apply Now!
              </h2>
              <div className="db-badge db-badge-primary">
                {unclaimedSchemes.length} Available
              </div>
            </div>
            
            <div className="db-alert db-alert-info">
              <span className="db-alert-icon">💡</span>
              <p>You are eligible for <strong>{unclaimedSchemes.length} schemes</strong> that you haven't applied to yet!</p>
            </div>
            
            <div className="db-schemes-grid">
              {unclaimedSchemes.slice(0, 3).map((item) => (
                <div key={item.scheme._id} className="db-scheme-card">
                  <div className="db-scheme-header">
                    <div className="db-scheme-badge">
                      <span className="db-match-score">{item.matchScore}%</span>
                      <span className="db-match-label">Match</span>
                    </div>
                  </div>
                  
                  <div className="db-scheme-body">
                    <h3 className="db-scheme-name">{item.scheme.name}</h3>
                    <p className="db-scheme-dept">
                      <span className="db-dept-icon">🏛️</span>
                      {item.scheme.department}
                    </p>
                    <p className="db-scheme-desc">{item.scheme.description}</p>
                  </div>
                  
                  <div className="db-scheme-footer">
                    <a 
                      href={item.scheme.applyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="db-btn db-btn-primary"
                    >
                      <span>Apply Now</span>
                      <span className="db-btn-arrow">→</span>
                    </a>
                  </div>
                  <div className="db-scheme-glow"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Alerts Section */}
        {documentAlerts?.expiringDocuments.length > 0 && (
          <div className="db-section">
            <div className="db-section-header">
              <h2 className="db-section-title">
                <span className="db-section-icon">⚠️</span>
                Document Expiry Alerts
              </h2>
              <div className="db-badge db-badge-danger">
                {documentAlerts.expiringDocuments.length} Expiring
              </div>
            </div>
            
            <div className="db-alert db-alert-warning">
              <span className="db-alert-icon">⏰</span>
              <p><strong>{documentAlerts.expiringDocuments.length} documents</strong> are expiring soon. Update them to avoid issues!</p>
            </div>
            
            <div className="db-documents-grid">
              {documentAlerts.expiringDocuments.map((doc) => (
                <div key={doc._id} className="db-doc-card">
                  <div className="db-doc-icon">📄</div>
                  <div className="db-doc-content">
                    <strong className="db-doc-type">{doc.documentType}</strong>
                    <p className="db-doc-expiry">Expires: {new Date(doc.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div className="db-doc-status db-doc-urgent">Urgent</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
