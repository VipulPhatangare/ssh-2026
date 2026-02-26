import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Home.css';

const Home = () => {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  // Define quick links with translations
  const QUICK_LINKS = [
    {
      icon: '🤖',
      titleKey: 'aiAssistant',
      descKey: 'aiAssistantDesc',
      to: '/assistant',
      color: '#818cf8',
      g1: '#4f46e5',
      g2: '#818cf8',
    },
    {
      icon: '🛡️',
      titleKey: 'grievances',
      descKey: 'grievancesDesc',
      to: '/grievances',
      color: '#f87171',
      g1: '#dc2626',
      g2: '#f87171',
    },
    {
      icon: '🎯',
      titleKey: 'schemes',
      descKey: 'schemesDesc',
      to: '/schemes',
      color: '#38bdf8',
      g1: '#0284c7',
      g2: '#38bdf8',
    },
    {
      icon: '📊',
      titleKey: 'dashboard',
      descKey: 'dashboardDesc',
      to: '/dashboard',
      color: '#4ade80',
      g1: '#16a34a',
      g2: '#4ade80',
    },
    {
      icon: '⚙️',
      titleKey: 'services',
      descKey: 'servicesDesc',
      to: '/services',
      color: '#fbbf24',
      g1: '#d97706',
      g2: '#fbbf24',
      comingSoon: true,
    },
  ];

  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('/images/farmer_landingpage.png')`
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero" style={heroStyle}>
        <div className="hero-content">
          <div className="container">
            <h1>{t('welcome')}</h1>
            <p className="hero-subtitle">
              {t('heroSubtitle')}
            </p>
            <p className="hero-description">
              {t('heroDescription')}
            </p>
            
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="ql-section">
        {/* Decorative blobs */}
        <div className="ql-blob ql-blob-1"></div>
        <div className="ql-blob ql-blob-2"></div>
        <div className="ql-blob ql-blob-3"></div>

        <div className="ql-inner">
          {/* Header */}
          <div className="ql-header">
            <span className="ql-eyebrow">{t('quickLinksEyebrow')}</span>
            <h2 className="ql-title">{t('commandCentre')} <span className="ql-title-accent">{t('commandCentreAccent')}</span></h2>
            <p className="ql-subtitle">{t('quickLinksSubtitle')}</p>
          </div>

          {/* Cards */}
          <div className="ql-grid">
            {QUICK_LINKS.map((link, idx) => (
              link.comingSoon ? (
                <div
                  key={link.titleKey}
                  className="ql-card ql-card-soon"
                  style={{'--c': link.color, '--g1': link.g1, '--g2': link.g2}}
                >
                  <div className="ql-card-glow"></div>
                  <div className="ql-card-number">0{idx + 1}</div>
                  <div className="ql-card-icon">{link.icon}</div>
                  <h3 className="ql-card-title">{t(link.titleKey)}</h3>
                  <p className="ql-card-desc">{t(link.descKey)}</p>
                  <div className="ql-card-footer">
                    <span className="ql-soon-badge">{t('comingSoon')}</span>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.titleKey}
                  to={isLoggedIn ? link.to : '/login'}
                  className="ql-card"
                  style={{'--c': link.color, '--g1': link.g1, '--g2': link.g2}}
                >
                  <div className="ql-card-glow"></div>
                  <div className="ql-card-shine"></div>
                  <div className="ql-card-number">0{idx + 1}</div>
                  <div className="ql-card-icon">{link.icon}</div>
                  <h3 className="ql-card-title">{t(link.titleKey)}</h3>
                  <p className="ql-card-desc">{t(link.descKey)}</p>
                  <div className="ql-card-footer">
                    <span className="ql-card-cta">{t('open')} {t(link.titleKey)}</span>
                    <span className="ql-card-arrow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </div>
                </Link>
              )
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta">
        <div className="container">
          <h2>{t('ctaTitle')}</h2>
          <p>{t('ctaSubtitle')}</p>
          {!isLoggedIn && (
            <Link to="/register" className="btn btn-primary btn-lg">
              {t('createAccount')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
