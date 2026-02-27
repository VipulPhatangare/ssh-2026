import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Handle language change
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            Sahay AI
          </Link>
          
          <div className="navbar-links">
            {user && <Link to="/" className="nav-link home-link">{t('home')}</Link>}
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">{t('dashboard')}</Link>
                <Link to="/schemes" className="nav-link">{t('schemes')}</Link>
                <Link to="/grievances" className="nav-link">{t('grievances')}</Link>
                <Link to="/assistant" className="nav-link ai-nav-link">
                  🤖 AI Assistant
                  <span className="ai-new-badge">NEW</span>
                </Link>
                <Link to="/schemes/S0002" className="nav-link predict-nav-link">
                  🌾 Predict Approval
                </Link>
                {user.role === 'Admin' && (
                  <Link to="/admin" className="nav-link">{t('admin')}</Link>
                )}
                <Link to="/profile" className="nav-link">{t('profile')}</Link>
                <button onClick={handleLogout} className="btn btn-secondary">
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary">{t('login')}</Link>
                <Link to="/register" className="btn btn-secondary">{t('register')}</Link>
              </>
            )}

            {/* Language Switcher */}
            <div className="language-switcher">
              <button
                onClick={() => changeLanguage('en')}
                className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('hi')}
                className={`lang-btn ${i18n.language === 'hi' ? 'active' : ''}`}
                title="हिंदी"
              >
                HI
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
