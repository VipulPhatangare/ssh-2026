import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MessageCircle, Lightbulb } from 'lucide-react';

const HeroSection = ({ onAIChat, onExploreSchemes }) => {
  const { user } = useContext(AuthContext);

  return (
    <div className="relative overflow-hidden bg-gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center">
          {/* Welcome Text */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 animate-fade-in">
            Welcome back, {user?.fullName?.split(' ')[0]}! 👋
          </h1>

          <p className="text-lg md:text-xl text-blue-100 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Your AI-powered governance assistant is ready to help
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={onAIChat}
              className="flex items-center justify-center space-x-2 px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-blue-50 hover:shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <MessageCircle size={20} />
              <span>Talk to AI Assistant</span>
            </button>

            <button
              onClick={onExploreSchemes}
              className="flex items-center justify-center space-x-2 px-8 py-3 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-800 hover:shadow-md transition-all duration-200 border border-blue-300"
            >
              <Lightbulb size={20} />
              <span>Explore Schemes</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg px-4 py-3">
              <div className="text-2xl font-bold text-white">15+</div>
              <p className="text-blue-100 text-sm">Schemes Available</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg px-4 py-3">
              <div className="text-2xl font-bold text-white">24/7</div>
              <p className="text-blue-100 text-sm">AI Support</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg px-4 py-3 col-span-2 md:col-span-1">
              <div className="text-2xl font-bold text-white">3M+</div>
              <p className="text-blue-100 text-sm">Active Citizens</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
