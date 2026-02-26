import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './SchemeDetails.css';

const SchemeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSchemeDetails();
  }, [id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchSchemeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/schemes/${id}`);
      setScheme(response.data.data);
    } catch (err) {
      console.error('Error fetching scheme details:', err);
      setError('Failed to load scheme details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (scheme?.applyUrl) {
      window.open(scheme.applyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBack = () => {
    navigate('/schemes');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: chatInput,
      sender: 'user',
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Mock bot response (delayed for realism)
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: `Thanks for asking about ${scheme?.name}. This is a helpful resource for eligible citizens. You can find more information in the scheme details above, or feel free to ask me any other questions!`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  if (loading) {
    return (
      <div className="scheme-details-page">
        <div className="container">
          <div className="loading">Loading scheme details...</div>
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="scheme-details-page">
        <div className="container">
          <div className="error-message">
            <p>{error || 'Scheme not found.'}</p>
            <button onClick={handleBack} className="btn btn-primary">
              Back to Schemes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scheme-details-page">
      <div className="container">
        <button onClick={handleBack} className="btn-back">
          ← Back to Schemes
        </button>

        <div className="scheme-details-wrapper">
          {/* LEFT SECTION - SCHEME DETAILS (70%) */}
          <div className="scheme-details-card">
            <div className="scheme-header-section">
              <div>
                <h1 className="scheme-title">{scheme.name}</h1>
                <p className="scheme-dept">{scheme.department}</p>
              </div>
            </div>

            <div className="scheme-section">
              <h2 className="section-title">Description</h2>
              <p className="section-content">{scheme.description}</p>
            </div>

            {scheme.benefits && (
              <div className="scheme-section">
                <h2 className="section-title">Benefits</h2>
                <p className="section-content">{scheme.benefits}</p>
              </div>
            )}

            {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 && (
              <div className="scheme-section">
                <h2 className="section-title">Required Documents</h2>
                <ul className="documents-list">
                  {scheme.requiredDocuments.map((doc, index) => (
                    <li key={index} className="document-item">
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {scheme.eligibility && (
              <div className="scheme-section">
                <h2 className="section-title">Eligibility Criteria</h2>
                <div className="eligibility-container">
                  {scheme.eligibility?.ageMin && (
                    <p className="eligibility-item">
                      <strong>Minimum Age:</strong> {scheme.eligibility.ageMin} years
                    </p>
                  )}
                  {scheme.eligibility?.ageMax && (
                    <p className="eligibility-item">
                      <strong>Maximum Age:</strong> {scheme.eligibility.ageMax} years
                    </p>
                  )}
                  {scheme.eligibility?.gender && (
                    <p className="eligibility-item">
                      <strong>Gender:</strong> {scheme.eligibility.gender}
                    </p>
                  )}
                  {scheme.eligibility?.incomeMax && (
                    <p className="eligibility-item">
                      <strong>Maximum Income:</strong> ₹{scheme.eligibility.incomeMax}
                    </p>
                  )}
                  {scheme.eligibility?.casteCategories && scheme.eligibility.casteCategories.length > 0 && (
                    <div className="eligibility-item">
                      <strong>Caste Categories:</strong>
                      <ul className="eligibility-list">
                        {scheme.eligibility.casteCategories.map((caste, index) => (
                          <li key={index}>{caste}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {scheme.eligibility?.occupations && scheme.eligibility.occupations.length > 0 && (
                    <div className="eligibility-item">
                      <strong>Occupations:</strong>
                      <ul className="eligibility-list">
                        {scheme.eligibility.occupations.map((occupation, index) => (
                          <li key={index}>{occupation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="scheme-actions">
              <button
                onClick={handleApply}
                className="btn btn-primary btn-lg"
              >
                Apply Now
              </button>
              <button
                onClick={handleBack}
                className="btn btn-secondary btn-lg"
              >
                Back to Schemes
              </button>
            </div>
          </div>

          {/* RIGHT SECTION - CHAT INTERFACE (30%) */}
          <div className="chat-panel">
            <div className="chat-header">
              <h3 className="chat-title">Ask about this scheme</h3>
              <p className="chat-subtitle">Get instant answers</p>
            </div>

            <div className="chat-messages">
              {chatMessages.length === 0 && (
                <div className="chat-empty">
                  <p>👋 Hi! Ask me any questions about <strong>{scheme.name}</strong></p>
                </div>
              )}

              {chatMessages.map(message => (
                <div
                  key={message.id}
                  className={`chat-message chat-message-${message.sender}`}
                >
                  <div className="message-bubble">
                    {message.text}
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-form">
              <input
                type="text"
                placeholder="Ask your question..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="chat-input"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="chat-send-btn"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetails;
