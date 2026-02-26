import React, { useState } from 'react';
import { MessageCircle, Mic, Upload, Send } from 'lucide-react';

const AIAssistant = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);

  const quickPrompts = [
    { icon: '📋', text: 'File a complaint', action: 'file_complaint' },
    { icon: '🔍', text: 'Find schemes for me', action: 'find_schemes' },
    { icon: '📊', text: 'Track my application', action: 'track_application' },
    { icon: '💳', text: 'Check eligibility', action: 'check_eligibility' },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleQuickPrompt = (prompt) => {
    onSendMessage(prompt.text);
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Voice input implementation would go here
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Image upload implementation would go here
      onSendMessage(`[Image uploaded: ${file.name}]`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-medium p-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <MessageCircle className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Assistant</h2>
            <p className="text-gray-500 text-sm">Ask anything about schemes, complaints, or services</p>
          </div>
        </div>

        {/* Chat Input */}
        <div className="bg-gradient-card border border-primary-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything (e.g., file complaint, find schemes...)"
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 focus:ring-0"
            />
            <button
              onClick={toggleVoice}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600'
              }`}
              title="Voice Input"
            >
              <Mic size={20} />
            </button>

            <label className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600 transition-all cursor-pointer">
              <Upload size={20} />
              <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
            </label>

            <button
              onClick={handleSendMessage}
              className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200"
              title="Send Message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* Quick Prompts */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(prompt)}
                className="flex items-center space-x-3 p-4 bg-gradient-card border border-primary-200 rounded-lg hover:shadow-medium hover:border-primary-400 transition-all duration-200 text-left group"
              >
                <span className="text-2xl">{prompt.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600">{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Listening Indicator */}
        {isListening && (
          <div className="mt-6 flex items-center justify-center space-x-2 animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            <p className="text-sm text-gray-600 ml-2">Listening...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
