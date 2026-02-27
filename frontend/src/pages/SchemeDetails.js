import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import './SchemeDetails.css';

// ── Default prediction form values ───────────────────────────────────────────
const PRED_FORM_DEFAULTS = {
  rural_flag: false,
  mobile_linked_aadhaar: false,
  bank_linked_aadhaar: false,
  land_registered: false,
  land_area_hectare: '',
  land_record_verified: false,
  land_dispute_flag: false,
  pm_kisan_registered: false,
  pm_kisan_active: false,
  pm_kisan_installment_received: 0,
  pm_kisan_rejected_flag: false,
  bank_account_valid: false,
  ifsc_valid: false,
  dbt_enabled: false,
  previous_dbt_failure: false,
  land_doc_uploaded: false,
  bank_passbook_uploaded: false,
  pm_kisan_proof_uploaded: false,
};

const SchemeDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const messagesEndRef = useRef(null);

  // ── Prediction states (S0001 only) ────────────────────────────────────────
  const [showPredictor, setShowPredictor] = useState(false);
  const [predForm, setPredForm]           = useState(PRED_FORM_DEFAULTS);
  const [predResult, setPredResult]       = useState(null);
  const [predLoading, setPredLoading]     = useState(false);
  const [predError, setPredError]         = useState(null);

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
      setError(t('failedLoadScheme'));
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

  // ── Prediction handlers ───────────────────────────────────────────────────
  const handlePredFieldChange = (field, value) => {
    setPredForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePredSubmit = async (e) => {
    e.preventDefault();
    setPredLoading(true);
    setPredResult(null);
    setPredError(null);
    try {
      const res = await api.post('/schemes/S0001/predict-approval', {
        ...predForm,
        land_area_hectare: parseFloat(predForm.land_area_hectare) || 0,
        pm_kisan_installment_received: parseInt(predForm.pm_kisan_installment_received) || 0,
      });
      if (res.data.success) {
        setPredResult(res.data.prediction);
      } else {
        setPredError(res.data.message || 'Prediction failed');
      }
    } catch (err) {
      setPredError(
        err.response?.data?.message ||
        'Prediction service is unavailable. Make sure the ML server is running.'
      );
    } finally {
      setPredLoading(false);
    }
  };

  const handlePredReset = () => {
    setPredForm(PRED_FORM_DEFAULTS);
    setPredResult(null);
    setPredError(null);
  };

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
    <>
    <div className="scheme-details-page">
      <div className="container">
        <button onClick={handleBack} className="btn-back">
          ← {t('backToSchemes')}
        </button>

        <div className="scheme-details-wrapper">
          {/* LEFT SECTION - SCHEME DETAILS (70%) */}
          <div className="scheme-details-card">
            <div className="scheme-header-section">
              <div>
                <h1 className="scheme-title">{scheme.name}</h1>
                <p className="scheme-dept">{scheme.department}</p>
              </div>
              {scheme.schemeId === 'S0001' && (
                <button
                  className="btn-predict btn-predict-header"
                  onClick={() => { setShowPredictor(true); handlePredReset(); }}
                >
                  🤖 Check Approval Chances
                </button>
              )}
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

      {/* ══════════════════════════════════════════════════════════════════════
          PREDICTION MODAL  (S0001 only)
         ══════════════════════════════════════════════════════════════════════ */}
      {showPredictor && (
        <div className="pred-overlay" onClick={() => setShowPredictor(false)}>
          <div className="pred-modal" onClick={e => e.stopPropagation()}>
            <div className="pred-modal-header">
              <div>
                <h2 className="pred-modal-title">🤖 Approval Prediction</h2>
                <p className="pred-modal-subtitle">Kisan Kalyan Yojana (S0001) — Fill details below</p>
              </div>
              <button className="pred-close-btn" onClick={() => setShowPredictor(false)}>✕</button>
            </div>

            {!predResult ? (
              <form onSubmit={handlePredSubmit} className="pred-form">
                {/* ── Section 1: Location ── */}
                <div className="pred-section">
                  <h3 className="pred-section-title">📍 Location</h3>
                  <div className="pred-field-row">
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.rural_flag}
                        onChange={e => handlePredFieldChange('rural_flag', e.target.checked)} />
                      <span className="pred-toggle-label">Rural area resident</span>
                    </label>
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.mobile_linked_aadhaar}
                        onChange={e => handlePredFieldChange('mobile_linked_aadhaar', e.target.checked)} />
                      <span className="pred-toggle-label">Mobile linked to Aadhaar</span>
                    </label>
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.bank_linked_aadhaar}
                        onChange={e => handlePredFieldChange('bank_linked_aadhaar', e.target.checked)} />
                      <span className="pred-toggle-label">Bank account linked to Aadhaar</span>
                    </label>
                  </div>
                </div>

                {/* ── Section 2: Land ── */}
                <div className="pred-section">
                  <h3 className="pred-section-title">🌾 Land Details</h3>
                  <div className="pred-field-row">
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.land_registered}
                        onChange={e => handlePredFieldChange('land_registered', e.target.checked)} />
                      <span className="pred-toggle-label">Land registered in your name</span>
                    </label>
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.land_record_verified}
                        onChange={e => handlePredFieldChange('land_record_verified', e.target.checked)} />
                      <span className="pred-toggle-label">Land records verified</span>
                    </label>
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.land_dispute_flag}
                        onChange={e => handlePredFieldChange('land_dispute_flag', e.target.checked)} />
                      <span className="pred-toggle-label">Land under dispute</span>
                    </label>
                  </div>
                  <div className="pred-input-group">
                    <label className="pred-label">Land area (hectares)</label>
                    <input type="number" step="0.01" min="0" placeholder="e.g. 1.5"
                      value={predForm.land_area_hectare}
                      onChange={e => handlePredFieldChange('land_area_hectare', e.target.value)}
                      className="pred-input" />
                  </div>
                </div>

                {/* ── Section 3: PM Kisan ── */}
                <div className="pred-section">
                  <h3 className="pred-section-title">🏛️ PM-KISAN Status</h3>
                  <div className="pred-field-row">
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.pm_kisan_registered}
                        onChange={e => handlePredFieldChange('pm_kisan_registered', e.target.checked)} />
                      <span className="pred-toggle-label">Registered in PM-KISAN</span>
                    </label>
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.pm_kisan_active}
                        onChange={e => handlePredFieldChange('pm_kisan_active', e.target.checked)} />
                      <span className="pred-toggle-label">PM-KISAN account active</span>
                    </label>
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.pm_kisan_rejected_flag}
                        onChange={e => handlePredFieldChange('pm_kisan_rejected_flag', e.target.checked)} />
                      <span className="pred-toggle-label">Previously rejected in PM-KISAN</span>
                    </label>
                  </div>
                  <div className="pred-input-group">
                    <label className="pred-label">Installments received (0–20)</label>
                    <input type="number" min="0" max="20" placeholder="e.g. 6"
                      value={predForm.pm_kisan_installment_received}
                      onChange={e => handlePredFieldChange('pm_kisan_installment_received', e.target.value)}
                      className="pred-input" />
                  </div>
                </div>

                {/* ── Section 4: Bank & DBT ── */}
                <div className="pred-section">
                  <h3 className="pred-section-title">🏦 Bank &amp; DBT</h3>
                  <div className="pred-field-row">
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.bank_account_valid}
                        onChange={e => handlePredFieldChange('bank_account_valid', e.target.checked)} />
                      <span className="pred-toggle-label">Bank account valid &amp; active</span>
                    </label>
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.ifsc_valid}
                        onChange={e => handlePredFieldChange('ifsc_valid', e.target.checked)} />
                      <span className="pred-toggle-label">IFSC code valid</span>
                    </label>
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.dbt_enabled}
                        onChange={e => handlePredFieldChange('dbt_enabled', e.target.checked)} />
                      <span className="pred-toggle-label">DBT enabled on account</span>
                    </label>
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.previous_dbt_failure}
                        onChange={e => handlePredFieldChange('previous_dbt_failure', e.target.checked)} />
                      <span className="pred-toggle-label">Previous DBT transfer failure</span>
                    </label>
                  </div>
                </div>

                {/* ── Section 5: Documents ── */}
                <div className="pred-section">
                  <h3 className="pred-section-title">📄 Documents Uploaded</h3>
                  <div className="pred-field-row">
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.land_doc_uploaded}
                        onChange={e => handlePredFieldChange('land_doc_uploaded', e.target.checked)} />
                      <span className="pred-toggle-label">Land ownership document</span>
                    </label>
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.bank_passbook_uploaded}
                        onChange={e => handlePredFieldChange('bank_passbook_uploaded', e.target.checked)} />
                      <span className="pred-toggle-label">Bank passbook / statement</span>
                    </label>
                    <label className="pred-toggle">
                      <input type="checkbox" checked={predForm.pm_kisan_proof_uploaded}
                        onChange={e => handlePredFieldChange('pm_kisan_proof_uploaded', e.target.checked)} />
                      <span className="pred-toggle-label">PM-KISAN registration proof</span>
                    </label>
                  </div>
                </div>

                {predError && <p className="pred-error">⚠️ {predError}</p>}

                <div className="pred-form-actions">
                  <button type="submit" className="btn-pred-submit" disabled={predLoading}>
                    {predLoading ? '⏳ Analyzing...' : '🔍 Predict Approval'}
                  </button>
                  <button type="button" className="btn-pred-reset" onClick={handlePredReset}>
                    Reset
                  </button>
                </div>
              </form>
            ) : (
              /* ── Result Panel ── */
              <div className="pred-result">
                {/* Gauge circle */}
                <div className="pred-gauge-wrapper">
                  <svg viewBox="0 0 120 120" className="pred-gauge">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke={predResult.probability >= 70 ? '#22c55e' : predResult.probability >= 40 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="10"
                      strokeDasharray={`${(predResult.probability / 100) * 314} 314`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dasharray 1s ease' }}
                    />
                    <text x="60" y="56" textAnchor="middle" className="gauge-pct-text"
                      style={{ fontSize: '22px', fontWeight: 700, fill: '#1e293b' }}>
                      {predResult.probability}%
                    </text>
                    <text x="60" y="72" textAnchor="middle"
                      style={{ fontSize: '9px', fill: '#64748b' }}>
                      Approval chance
                    </text>
                  </svg>
                </div>

                {/* Verdict badge */}
                <div className={`pred-verdict ${predResult.approved ? 'verdict-yes' : 'verdict-no'}`}>
                  {predResult.approved ? '✅ Likely Approved' : '❌ May be Rejected'}
                </div>

                {/* Confidence */}
                <div className="pred-confidence-row">
                  <span className="pred-confidence-label">Confidence:</span>
                  <span className={`pred-confidence-badge conf-${predResult.confidence?.toLowerCase().replace(/[^a-z]/g,'-')}`}>
                    {predResult.confidence}
                  </span>
                </div>

                {/* Message */}
                <p className="pred-message">{predResult.message}</p>

                {/* Tips */}
                <div className="pred-tips">
                  <p className="pred-tips-title">💡 Quick Tips to Improve Chances</p>
                  <ul className="pred-tips-list">
                    {!predForm.land_doc_uploaded      && <li>Upload your land ownership document</li>}
                    {!predForm.bank_passbook_uploaded  && <li>Upload your bank passbook</li>}
                    {!predForm.dbt_enabled             && <li>Enable DBT on your bank account</li>}
                    {!predForm.mobile_linked_aadhaar   && <li>Link mobile number to Aadhaar</li>}
                    {predForm.land_dispute_flag        && <li>Resolve any land disputes before applying</li>}
                    {predForm.pm_kisan_rejected_flag   && <li>Address previous PM-KISAN rejection reason</li>}
                  </ul>
                </div>

                <div className="pred-form-actions">
                  <button className="btn-pred-submit" onClick={handlePredReset}>
                    🔄 Try Again
                  </button>
                  <button className="btn-pred-reset" onClick={() => setShowPredictor(false)}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SchemeDetails;
