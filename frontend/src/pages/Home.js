import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

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
            <h1>Welcome to MP E-Governance Portal</h1>
            <p className="hero-subtitle">
              AI-Powered Citizen Intelligence Platform for Madhya Pradesh
            </p>
            <p className="hero-description">
              Access all government schemes, track applications, and manage documents in one unified platform
            </p>
            
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features">
        <div className="container">
          <h2>Key Features</h2>
          <div className="grid">
            <div className="card feature-card">
              <h3>🎯 Missed Benefit Detection</h3>
              <p>Automatically discover government schemes you're eligible for but haven't applied to yet.</p>
            </div>
            <div className="card feature-card">
              <h3>🎊 Life-Event Based Services</h3>
              <p>Get personalized scheme recommendations based on major life events like marriage, childbirth, or retirement.</p>
            </div>
            <div className="card feature-card">
              <h3>📊 Unified Dashboard</h3>
              <p>Track all your applications, documents, and benefits in one centralized location.</p>
            </div>
            <div className="card feature-card">
              <h3>📁 Document Vault</h3>
              <p>Securely store and manage all your important documents with expiry alerts.</p>
            </div>
            <div className="card feature-card">
              <h3>📝 Application Tracking</h3>
              <p>Monitor the status of your applications with detailed timeline updates.</p>
            </div>
            <div className="card feature-card">
              <h3>🛡️ Grievance System</h3>
              <p>Raise and track grievances with automated escalation for faster resolution.</p>
            </div>
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
