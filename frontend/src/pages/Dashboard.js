import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useTranslation();
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
    return <div className="loading">{t('loadingDashboard')}</div>;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <h1>{t('welcomeUser', { name: user?.fullName })}</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats?.eligibleSchemes || 0}</h3>
            <p>{t('statEligibleSchemes')}</p>
          </div>
          <div className="stat-card highlight">
            <h3>{stats?.unclaimedSchemes || 0}</h3>
            <p>{t('unclaimedBenefits')}</p>
          </div>
          <div className="stat-card warning">
            <h3>{stats?.expiringDocuments || 0}</h3>
            <p>{t('expiringDocuments')}</p>
          </div>
        </div>

        {unclaimedSchemes.length > 0 && (
          <div className="section">
            <h2>{t('missedBenefitsTitle')}</h2>
            <div className="alert alert-info">
              {t('missedBenefitsAlert', { count: unclaimedSchemes.length })}
            </div>
            <div className="schemes-list">
              {unclaimedSchemes.slice(0, 3).map((item) => (
                <div key={item.scheme._id} className="card scheme-card">
                  <h3>{item.scheme.name}</h3>
                  <p className="scheme-dept">{item.scheme.department}</p>
                  <p>{item.scheme.description}</p>
                  <div className="scheme-match">
                    <span className="badge badge-success">{t('matchScore', { score: item.matchScore })}</span>
                  </div>
                  <a href={item.scheme.applyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    {t('applyNow')}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {documentAlerts?.expiringDocuments.length > 0 && (
          <div className="section">
            <h2>{t('docExpiryTitle')}</h2>
            <div className="alert alert-error">
              {t('docExpiryAlert', { count: documentAlerts.expiringDocuments.length })}
            </div>
            <div className="documents-list">
              {documentAlerts.expiringDocuments.map((doc) => (
                <div key={doc._id} className="card">
                  <strong>{doc.documentType}</strong>
                  <p>{t('expiresOn', { date: new Date(doc.expiryDate).toLocaleDateString() })}</p>
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
