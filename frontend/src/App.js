import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ModernDashboard from './pages/ModernDashboard';
import Profile from './pages/Profile';
import SchemeExplorer from './pages/SchemeExplorer';
import LifeEventPage from './pages/LifeEventPage';
import ApplicationTracker from './pages/ApplicationTracker';
import GrievancePage from './pages/GrievancePage';
import AdminPanel from './pages/AdminPanel';

function AppContent() {
  const location = useLocation();

  // Don't show old navbar on modern-dashboard (which has its own navbar)
  const showNavbar = location.pathname !== '/modern-dashboard';

  return (
    <div className="App">
      {showNavbar && <Navbar />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/modern-dashboard" 
              element={
                <PrivateRoute>
                  <ModernDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/schemes" 
              element={
                <PrivateRoute>
                  <SchemeExplorer />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/life-events" 
              element={
                <PrivateRoute>
                  <LifeEventPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/applications" 
              element={
                <PrivateRoute>
                  <ApplicationTracker />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/grievances" 
              element={
                <PrivateRoute>
                  <GrievancePage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute adminOnly>
                  <AdminPanel />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
      );
    }

    function App() {
      return (
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      );
    }

export default App;
