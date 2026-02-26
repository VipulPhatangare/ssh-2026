import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            MP E-Governance Portal
          </Link>
          
          <div className="navbar-links">
            {user && <Link to="/" className="nav-link home-link">Home</Link>}
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/schemes" className="nav-link">Schemes</Link>
                <Link to="/life-events" className="nav-link">Life Events</Link>
                <Link to="/applications" className="nav-link">Applications</Link>
                <Link to="/grievances" className="nav-link">Grievances</Link>
                <Link to="/assistant" className="nav-link ai-nav-link">
                  🤖 AI Assistant
                  <span className="ai-new-badge">NEW</span>
                </Link>
                {user.role === 'Admin' && (
                  <Link to="/admin" className="nav-link">Admin Panel</Link>
                )}
                <Link to="/profile" className="nav-link">Profile</Link>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary">Login</Link>
                <Link to="/register" className="btn btn-secondary">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
