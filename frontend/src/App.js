import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SchemeExplorer from './pages/SchemeExplorer';
import SchemeDetails from './pages/SchemeDetails';
import LifeEventPage from './pages/LifeEventPage';
import ApplicationTracker from './pages/ApplicationTracker';
import GrievancePage from './pages/GrievancePage';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
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
      </Router>
    </AuthProvider>
  );
}

export default App;
