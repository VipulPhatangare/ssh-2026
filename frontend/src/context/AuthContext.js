import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';
import axios from 'axios';

export const AuthContext = createContext();

const ELIGIBLE_WEBHOOK = 'https://synthomind.cloud/webhook/eligible-for-me';

// Returns today as 'YYYY-MM-DD'
const todayStr = () => new Date().toISOString().slice(0, 10);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eligibleSchemes, setEligibleSchemes] = useState([]);

  // Fire webhook once per calendar day per user; cache result in localStorage
  const fetchEligibleSchemesForUser = async (userId) => {
    if (!userId) return;
    const dateKey   = `eligible_date_${userId}`;
    const cacheKey  = `eligible_schemes_${userId}`;
    const today     = todayStr();

    const storedDate   = localStorage.getItem(dateKey);
    const storedSchemes = localStorage.getItem(cacheKey);

    if (storedDate === today && storedSchemes) {
      // Already fetched today — just restore from cache
      try { setEligibleSchemes(JSON.parse(storedSchemes)); } catch (_) {}
      return;
    }

    // First visit today — call n8n
    try {
      const res = await axios.post(
        ELIGIBLE_WEBHOOK,
        { userId },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const raw = Array.isArray(res.data) ? res.data[0] : res.data;
      const schemes = raw?.recommended_schemes || [];
      setEligibleSchemes(schemes);
      localStorage.setItem(dateKey,  today);
      localStorage.setItem(cacheKey, JSON.stringify(schemes));
      console.log(`✅ Eligible schemes fetched (${schemes.length}) for user ${userId}`);
    } catch (err) {
      console.warn('⚠️  eligible-for-me webhook failed:', err.message);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/auth/me');
        const loggedUser = response.data.data;
        setUser(loggedUser);
        fetchEligibleSchemesForUser(loggedUser._id);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      const loggedUser = response.data.user;
      setUser(loggedUser);
      fetchEligibleSchemesForUser(loggedUser._id);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setEligibleSchemes([]);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      // Handle both FormData (with file uploads) and regular object
      const config = {};
      if (profileData instanceof FormData) {
        config.headers = { 'Content-Type': 'multipart/form-data' };
      }
      const response = await api.put('/auth/update-profile', profileData, config);
      setUser(response.data.data);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Re-fetch the current user from the server (useful after direct mutations)
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        eligibleSchemes,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
