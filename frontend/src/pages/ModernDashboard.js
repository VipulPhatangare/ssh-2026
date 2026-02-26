import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
// import api from '../utils/api'; // Ready for backend integration
import ModernNavbar from '../components/ModernNavbar';
import HeroSection from '../components/HeroSection';
import AIAssistant from '../components/AIAssistant';
import QuickServices from '../components/QuickServices';
import PersonalizedInsights from '../components/PersonalizedInsights';
import ComplaintWidget from '../components/ComplaintWidget';
import Footer from '../components/Footer';

const ModernDashboard = () => {
  useContext(AuthContext); // Keep context for auto-logout on token expiry
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleAIChat = (message) => {
    // Add message to chat
    setChatMessages([...chatMessages, { type: 'user', text: message }]);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'I can help you find schemes that match your profile. Let me search our database...',
        'I found 3 schemes you might be eligible for. Would you like more details?',
        'Your complaint has been registered with ID #MP123456. You can track it anytime.',
        'Based on your information, you might be eligible for the skill development program.',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages((prev) => [...prev, { type: 'ai', text: randomResponse }]);
    }, 1000);

    showToast('Message sent to AI Assistant');
  };

  const handleServiceClick = (service) => {
    showToast(`Opening ${service.name} services...`);
    // Navigate to service details page
  };

  const handleViewMore = (insight) => {
    showToast(`View more details about ${insight.title}`);
    // Navigate to detailed page
  };

  const handleReportIssue = () => {
    showToast('Issue report submitted successfully! Reference ID: #MP123456');
  };

  const handleExploreSchemes = () => {
    showToast('Redirecting to schemes explorer...');
    // Navigate to schemes page
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <ModernNavbar />

      {/* Hero Section */}
      <HeroSection onAIChat={() => handleAIChat('')} onExploreSchemes={handleExploreSchemes} />

      {/* AI Assistant */}
      <AIAssistant onSendMessage={handleAIChat} />

      {/* Quick Services */}
      <QuickServices onServiceClick={handleServiceClick} />

      {/* Personalized Insights */}
      <PersonalizedInsights onViewMore={handleViewMore} />

      {/* Complaint Widget */}
      <ComplaintWidget onReportIssue={handleReportIssue} />

      {/* Footer */}
      <Footer />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDashboard;
