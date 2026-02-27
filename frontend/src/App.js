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
import AIAssistantPage from './pages/AIAssistantPage';
import Profile from './pages/Profile';
import SchemeExplorer from './pages/SchemeExplorer';
import SchemeDetails from './pages/SchemeDetails';
import GrievancePage from './pages/GrievancePage';
import AdminPanel from './pages/AdminPanel';

function AppContent() {
  const location = useLocation();

  // Hide old navbar only on modern-dashboard (which has its own navbar)
  // AI Assistant page keeps the existing navbar
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
              path="/assistant"
              element={
                <PrivateRoute>
                  <AIAssistantPage />
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
              path="/schemes/:id" 
              element={
                <PrivateRoute>
                  <SchemeDetails />
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
