import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './SchemeDetails.css';

const SchemeDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSchemeDetails();
  }, [id]);

  // Fetch eligibility check
  useEffect(() => {
    if (id && user?.id) {
      fetchEligibility();
    }
  }, [id, user?.id]);

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
      setError(t('failedLoadScheme'));
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibility = async () => {
    try {
      const response = await api.get(`/schemes/check/${id}/${user?.id}`);
      setEligibility(response.data);
    } catch (err) {
      console.error('Error checking eligibility:', err);
      // Silently fail - eligibility check is optional
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

  // Determine eligibility banner state
  const getEligibilityBannerState = () => {
    if (!eligibility) return null;
    
    if (eligibility.eligible) {
      return {
        type: 'fully-eligible',
        title: t('fullyEligible') || 'You Meet All Requirements',
        description: t('fullyEligibleDesc') || 'You meet all eligibility criteria and have all required documents. You can apply for this scheme now.',
      };
    }
    
    if (eligibility.missingDocs && eligibility.missingDocs.length > 0 && 
        (!eligibility.failedConditions || eligibility.failedConditions.length === 0)) {
      return {
        type: 'missing-docs',
        title: t('missingDocuments') || 'Missing Documents',
        description: t('missingDocsDesc') || 'You meet the eligibility criteria, but you need to upload the following documents to proceed:',
        items: eligibility.missingDocs,
        itemType: 'document',
      };
    }
    
    if (eligibility.failedConditions && eligibility.failedConditions.length > 0) {
      return {
        type: 'not-eligible',
        title: t('notEligible') || 'Not Eligible',
        description: t('notEligibleDesc') || 'Unfortunately, you do not meet the following eligibility criteria:',
        items: eligibility.failedConditions,
        itemType: 'condition',
      };
    }
    
    return null;
  };

  const eligibilityBanner = getEligibilityBannerState();

  const handleSendMessage = async (e) => {
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
    const currentInput = chatInput;
    setChatInput('');
    setIsLoadingResponse(true);

    try {
      // Send request to backend API endpoint (which proxies to webhook)
      const response = await api.post(`/schemes/${id}/chat`, {
        chat: currentInput,
        scheme: scheme?.name || '',
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get response');
      }

      // Add bot response from webhook
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.output || 'Unable to process your question. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error processing your question. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  if (loading) {
    return (
      <div className="scheme-details-page">
        <div className="container">
          <div className="loading">{t('loading')}</div>
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="scheme-details-page">
        <div className="container">
          <div className="error-message">
            <p>{error || t('schemeNotFound')}</p>
            <button onClick={handleBack} className="btn btn-primary">
              {t('backToSchemes')}
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
          ← {t('backToSchemes')}
        </button>

        <div className="scheme-details-wrapper">
          {/* ELIGIBILITY BANNER SECTION */}
          {eligibilityBanner && (
            <div className={`eligibility-banner eligibility-${eligibilityBanner.type}`}>
              <div className="banner-header">
                {eligibilityBanner.type === 'fully-eligible' && (
                  <span className="banner-icon">✓</span>
                )}
                {eligibilityBanner.type === 'missing-docs' && (
                  <span className="banner-icon">⚠</span>
                )}
                {eligibilityBanner.type === 'not-eligible' && (
                  <span className="banner-icon">✗</span>
                )}
                <div className="banner-content">
                  <h3 className="banner-title">{eligibilityBanner.title}</h3>
                  <p className="banner-description">{eligibilityBanner.description}</p>
                </div>
              </div>

              {eligibilityBanner.items && eligibilityBanner.items.length > 0 && (
                <div className="banner-items">
                  <ul className="items-list">
                    {eligibilityBanner.items.map((item, index) => (
                      <li key={index} className={`item item-${eligibilityBanner.itemType}`}>
                        {eligibilityBanner.itemType === 'document' && (
                          <>
                            <span className="item-icon">📄</span>
                            <span className="item-text">{item}</span>
                          </>
                        )}
                        {eligibilityBanner.itemType === 'condition' && (
                          <>
                            <span className="item-icon">•</span>
                            <span className="item-text">{item}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>

                  {eligibilityBanner.type === 'missing-docs' && (
                    <div className="banner-cta">
                      <p className="cta-text">
                        {t('uploadDocsEncouragement') || 'Please upload or obtain these documents to complete your eligibility for this scheme.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* LEFT SECTION - SCHEME DETAILS (70%) */}
          <div className="scheme-details-card">
            <div className="scheme-header-section">
              <div>
                <h1 className="scheme-title">{scheme.name}</h1>
                <p className="scheme-dept">{scheme.department}</p>
              </div>
            </div>

            <div className="scheme-section">
              <h2 className="section-title">{t('description_label')}</h2>
              <p className="section-content">{scheme.description}</p>
            </div>

            {scheme.benefits && (
              <div className="scheme-section">
                <h2 className="section-title">{t('benefits')}</h2>
                <p className="section-content">{scheme.benefits}</p>
              </div>
            )}

            {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 && (
              <div className="scheme-section">
                <h2 className="section-title">{t('requiredDocuments')}</h2>
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
                <h2 className="section-title">{t('eligibilityCriteria')}</h2>
                <div className="eligibility-container">
                  {scheme.eligibility?.ageMin && (
                    <p className="eligibility-item">
                      <strong>{t('minimumAge')}:</strong> {scheme.eligibility.ageMin} {t('years')}
                    </p>
                  )}
                  {scheme.eligibility?.ageMax && (
                    <p className="eligibility-item">
                      <strong>{t('maximumAge')}:</strong> {scheme.eligibility.ageMax} {t('years')}
                    </p>
                  )}
                  {scheme.eligibility?.gender && (
                    <p className="eligibility-item">
                      <strong>{t('gender')}:</strong> {scheme.eligibility.gender}
                    </p>
                  )}
                  {scheme.eligibility?.incomeMax && (
                    <p className="eligibility-item">
                      <strong>{t('maximumIncome')}:</strong> ₹{scheme.eligibility.incomeMax}
                    </p>
                  )}
                  {scheme.eligibility?.casteCategories && scheme.eligibility.casteCategories.length > 0 && (
                    <div className="eligibility-item">
                      <strong>{t('casteCategories')}:</strong>
                      <ul className="eligibility-list">
                        {scheme.eligibility.casteCategories.map((caste, index) => (
                          <li key={index}>{caste}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {scheme.eligibility?.occupations && scheme.eligibility.occupations.length > 0 && (
                    <div className="eligibility-item">
                      <strong>{t('occupations')}:</strong>
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
                {t('applyNow')}
              </button>
              <button
                onClick={handleBack}
                className="btn btn-secondary btn-lg"
              >
                {t('backToSchemes')}
              </button>
            </div>
          </div>

          {/* RIGHT SECTION - CHAT INTERFACE (30%) */}
          <div className="chat-panel">
            <div className="chat-header">
              <h3 className="chat-title">{t('askAboutScheme')}</h3>
              <p className="chat-subtitle">{t('getInstantAnswers')}</p>
            </div>

            <div className="chat-messages">
              {chatMessages.length === 0 && (
                <div className="chat-empty">
                  <div className="empty-state">
                    <div className="empty-icon">💬</div>
                    <p>👋 {t('chatEmpty')} <strong>{scheme.name}</strong></p>
                  </div>
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

              {isLoadingResponse && (
                <div className="chat-message chat-message-bot">
                  <div className="message-bubble loading-bubble">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-form">
              <input
                type="text"
                placeholder={t('askYourQuestion')}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="chat-input"
                disabled={isLoadingResponse}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isLoadingResponse}
                className="chat-send-btn"
              >
                {isLoadingResponse ? (
                  <span className="btn-loading">...</span>
                ) : (
                  t('send')
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetails;
