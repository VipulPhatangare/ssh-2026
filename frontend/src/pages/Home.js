import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const QUICK_LINKS = [
  {
    icon: '🤖',
    title: 'AI Assistant',
    description: 'Chat with our AI to find schemes, file complaints, and get instant help in Hindi or English.',
    to: '/assistant',
    color: '#818cf8',
    g1: '#4f46e5',
    g2: '#818cf8',
  },
  {
    icon: '🛡️',
    title: 'Grievances',
    description: 'Raise and track complaints with automated escalation for faster resolution.',
    to: '/grievances',
    color: '#f87171',
    g1: '#dc2626',
    g2: '#f87171',
  },
  {
    icon: '🎯',
    title: 'Schemes',
    description: 'Explore government schemes you are eligible for and apply in a few easy steps.',
    to: '/schemes',
    color: '#38bdf8',
    g1: '#0284c7',
    g2: '#38bdf8',
  },
  {
    icon: '📊',
    title: 'Dashboard',
    description: 'Track all your applications, documents, and benefits in one centralized place.',
    to: '/dashboard',
    color: '#4ade80',
    g1: '#16a34a',
    g2: '#4ade80',
  },
  {
    icon: '⚙️',
    title: 'Services',
    description: 'Access Health, Agriculture, Utility, Travel, and Emergency services — coming soon.',
    to: '/services',
    color: '#fbbf24',
    g1: '#d97706',
    g2: '#fbbf24',
    comingSoon: true,
  },
];

const Home = () => {
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

  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('/images/farmer_landingpage.png')`
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero" style={heroStyle}>
        <div className="hero-content">
          <div className="container">
            <h1>Welcome to Sahay AI</h1>
            <p className="hero-subtitle">
              AI-Powered Citizen Intelligence Platform for Madhya Pradesh
            </p>
            <p className="hero-description">
              Access all government schemes, track applications, and manage documents in one unified platform
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
            <span className="ql-eyebrow">⚡ Everything in one place</span>
            <h2 className="ql-title">Your <span className="ql-title-accent">Command Centre</span></h2>
            <p className="ql-subtitle">Jump straight to what you need — no menus, no confusion.</p>
          </div>

          {/* Cards */}
          <div className="ql-grid">
            {QUICK_LINKS.map((link, idx) => (
              link.comingSoon ? (
                <div
                  key={link.title}
                  className="ql-card ql-card-soon"
                  style={{'--c': link.color, '--g1': link.g1, '--g2': link.g2}}
                >
                  <div className="ql-card-glow"></div>
                  <div className="ql-card-number">0{idx + 1}</div>
                  <div className="ql-card-icon">{link.icon}</div>
                  <h3 className="ql-card-title">{link.title}</h3>
                  <p className="ql-card-desc">{link.description}</p>
                  <div className="ql-card-footer">
                    <span className="ql-soon-badge">Coming Soon</span>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.title}
                  to={isLoggedIn ? link.to : '/login'}
                  className="ql-card"
                  style={{'--c': link.color, '--g1': link.g1, '--g2': link.g2}}
                >
                  <div className="ql-card-glow"></div>
                  <div className="ql-card-shine"></div>
                  <div className="ql-card-number">0{idx + 1}</div>
                  <div className="ql-card-icon">{link.icon}</div>
                  <h3 className="ql-card-title">{link.title}</h3>
                  <p className="ql-card-desc">{link.description}</p>
                  <div className="ql-card-footer">
                    <span className="ql-card-cta">Open {link.title}</span>
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
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of citizens benefiting from government schemes</p>
          {!isLoggedIn && (
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Account Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
