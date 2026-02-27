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

  // ── Prediction states (S0002 only) ────────────────────────────────────────
  const [showPredictor, setShowPredictor] = useState(false);
  const [predForm, setPredForm]           = useState(PRED_FORM_DEFAULTS);
  const [predResult, setPredResult]       = useState(null);
  const [predLoading, setPredLoading]     = useState(false);
  const [predError, setPredError]         = useState(null);

  // ── Document analysis states ──────────────────────────────────────────────
  const [activeTab, setActiveTab]         = useState('predict');
  const [docType, setDocType]             = useState('');
  const [docFile, setDocFile]             = useState(null);
  const [docAnalysis, setDocAnalysis]     = useState(null);
  const [docLoading, setDocLoading]       = useState(false);
  const [docError, setDocError]           = useState(null);

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
      const res = await api.post('/schemes/S0002/predict-approval', {
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

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!docFile || !docType) { setDocError('Please select a document type and upload a file.'); return; }
    setDocLoading(true);
    setDocAnalysis(null);
    setDocError(null);
    try {
      // Read file as base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(docFile);
      });
      const res = await api.post('/schemes/S0002/analyze-document', {
        documentType : docType,
        fileName     : docFile.name,
        fileBase64   : base64,
        mimeType     : docFile.type,
      });
      if (res.data.success) {
        setDocAnalysis(res.data.analysis);
      } else {
        setDocError(res.data.message || 'Analysis failed');
      }
    } catch (err) {
      setDocError(err.response?.data?.message || 'Document analysis service unavailable. Please try again.');
    } finally {
      setDocLoading(false);
    }
  };

  const handleDocReset = () => {
    setDocFile(null);
    setDocType('');
    setDocAnalysis(null);
    setDocError(null);
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
                <div className="scheme-meta-row">
                  <span className="scheme-id-badge">#{scheme.schemeId}</span>
                  <span className={`scheme-status-badge ${scheme.isActive !== false ? 'badge-active' : 'badge-inactive'}`}>
                    {scheme.isActive !== false ? `✓ ${t('sdActive')}` : t('sdInactive')}
                  </span>
                </div>
                <h1 className="scheme-title">{scheme.name}</h1>
                <p className="scheme-dept">🏙️ {scheme.department}</p>
              </div>
              {scheme.schemeId === 'S0002' && (
                <button
                  className="btn-predict btn-predict-header"
                  onClick={() => { setShowPredictor(true); handlePredReset(); handleDocReset(); setActiveTab('predict'); }}
                >
                  🤖 Check Approval Chances
                </button>
              )}
            </div>

            {/* ── Quick Facts Band ── */}
            <div className="scheme-quick-facts">
              <div className="fact-card">
                <span className="fact-icon">📅</span>
                <span className="fact-label">{t('sdAgeRange')}</span>
                <span className="fact-value">
                  {(scheme.eligibility?.ageMin > 0 || (scheme.eligibility?.ageMax && scheme.eligibility.ageMax < 120))
                    ? `${scheme.eligibility.ageMin ?? 0}–${scheme.eligibility.ageMax ?? '∞'} ${t('years')}`
                    : t('sdAnyAge')}
                </span>
              </div>
              <div className="fact-card">
                <span className="fact-icon">💰</span>
                <span className="fact-label">{t('sdIncomeCap')}</span>
                <span className="fact-value">
                  {scheme.eligibility?.incomeMax
                    ? `₹${scheme.eligibility.incomeMax.toLocaleString('en-IN')}`
                    : t('sdNoIncomeLimit')}
                </span>
              </div>
              <div className="fact-card">
                <span className="fact-icon">⚧️</span>
                <span className="fact-label">{t('sdGender')}</span>
                <span className="fact-value">
                  {scheme.eligibility?.gender?.length
                    ? scheme.eligibility.gender.join(', ')
                    : t('sdAllGenders')}
                </span>
              </div>
              <div className="fact-card">
                <span className="fact-icon">📄</span>
                <span className="fact-label">{t('requiredDocuments')}</span>
                <span className="fact-value">
                  {scheme.requiredDocuments?.length
                    ? `${scheme.requiredDocuments.length} ${t('sdDocuments')}`
                    : t('sdNotApplicable')}
                </span>
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

            {/* ── Life Events ── */}
            {scheme.lifeEvents && scheme.lifeEvents.length > 0 && (
              <div className="scheme-section">
                <h2 className="section-title">🌱 {t('sdLifeEvents')}</h2>
                <div className="life-events-tags">
                  {scheme.lifeEvents.map((ev, i) => (
                    <span key={i} className="life-event-tag">{ev}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ── How to Apply ── */}
            {scheme.applyUrl && (
              <div className="scheme-section">
                <h2 className="section-title">🚀 {t('sdHowToApply')}</h2>
                <div className="how-to-apply-steps">
                  <div className="apply-step"><span className="step-num">1</span><span>{t('sdStep1')}</span></div>
                  <div className="apply-step"><span className="step-num">2</span><span>{t('sdStep2')}</span></div>
                  <div className="apply-step"><span className="step-num">3</span><span>{t('sdStep3')}</span></div>
                </div>
                <a href={scheme.applyUrl} target="_blank" rel="noopener noreferrer" className="official-link-btn">
                  🌐 {t('sdOfficialWebsite')} ↗
                </a>
              </div>
            )}

            <div className="scheme-actions">
              <button onClick={handleApply} className="btn btn-primary btn-lg">
                {t('applyNow')}
              </button>
              <button onClick={handleBack} className="btn btn-secondary btn-lg">
                {t('backToSchemes')}
              </button>
              {scheme.createdAt && (
                <p className="scheme-added-on">
                  📅 {t('sdAddedOn')}: {new Date(scheme.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
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

      {/* ══ PREDICTION + DOCUMENT ANALYSIS MODAL (S0002 only) ══ */}
      {showPredictor && (
        <div className="pred-overlay" onClick={() => setShowPredictor(false)}>
          <div className="pred-modal" onClick={e => e.stopPropagation()}>

            {/* ── Header ── */}
            <div className="pred-modal-header">
              <div>
                <h2 className="pred-modal-title">🌾 Kisan Kalyan Yojana</h2>
                <p className="pred-modal-subtitle">AI-powered approval check &amp; document analysis</p>
              </div>
              <button className="pred-close-btn" onClick={() => setShowPredictor(false)}>✕</button>
            </div>

            {/* ── Tabs ── */}
            <div className="pred-tabs">
              <button
                className={`pred-tab ${activeTab === 'predict' ? 'pred-tab-active' : ''}`}
                onClick={() => setActiveTab('predict')}
              >🔍 Predict Approval</button>
              {/* <button
                className={`pred-tab ${activeTab === 'docs' ? 'pred-tab-active' : ''}`}
                onClick={() => setActiveTab('docs')}
              >📄 Analyze Document</button> */}
            </div>

            {/* ══ TAB 1 — PREDICT ══ */}
            {activeTab === 'predict' && (
              !predResult ? (
                <form onSubmit={handlePredSubmit} className="pred-form">

                  {/* Section 1 — Location */}
                  <div className="pred-section">
                    <div className="pred-section-header pred-sec-location">📍 Location &amp; Aadhaar</div>
                    <div className="pred-cards-grid">
                      {[
                        ['rural_flag',            '🏘️', 'Rural area resident'],
                        ['mobile_linked_aadhaar', '📱', 'Mobile linked to Aadhaar'],
                        ['bank_linked_aadhaar',   '🔗', 'Bank linked to Aadhaar'],
                      ].map(([field, icon, label]) => (
                        <label key={field} className={`pred-card ${predForm[field] ? 'pred-card-on' : ''}`}>
                          <span className="pred-card-icon">{icon}</span>
                          <span className="pred-card-label">{label}</span>
                          <span className={`pred-switch ${predForm[field] ? 'switch-on' : ''}`}>
                            <span className="pred-switch-thumb" />
                          </span>
                          <input type="checkbox" checked={predForm[field]}
                            onChange={e => handlePredFieldChange(field, e.target.checked)} />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Section 2 — Land */}
                  <div className="pred-section">
                    <div className="pred-section-header pred-sec-land">🌾 Land Details</div>
                    <div className="pred-cards-grid">
                      {[
                        ['land_registered',      '📋', 'Land registered in your name'],
                        ['land_record_verified',  '✅', 'Land records verified'],
                        ['land_dispute_flag',     '⚠️', 'Land under dispute'],
                      ].map(([field, icon, label]) => (
                        <label key={field} className={`pred-card ${predForm[field] ? 'pred-card-on' : ''} ${field === 'land_dispute_flag' ? 'pred-card-danger' : ''}`}>
                          <span className="pred-card-icon">{icon}</span>
                          <span className="pred-card-label">{label}</span>
                          <span className={`pred-switch ${predForm[field] ? 'switch-on' : ''}`}>
                            <span className="pred-switch-thumb" />
                          </span>
                          <input type="checkbox" checked={predForm[field]}
                            onChange={e => handlePredFieldChange(field, e.target.checked)} />
                        </label>
                      ))}
                    </div>
                    <div className="pred-number-row">
                      <div className="pred-number-field">
                        <label className="pred-number-label">🌐 Land area (hectares)</label>
                        <input type="number" step="0.01" min="0" placeholder="e.g. 1.5"
                          value={predForm.land_area_hectare}
                          onChange={e => handlePredFieldChange('land_area_hectare', e.target.value)}
                          className="pred-number-input" />
                      </div>
                    </div>
                  </div>

                  {/* Section 3 — PM-KISAN */}
                  <div className="pred-section">
                    <div className="pred-section-header pred-sec-kisan">🏛️ PM-KISAN Status</div>
                    <div className="pred-cards-grid">
                      {[
                        ['pm_kisan_registered',     '📝', 'Registered in PM-KISAN'],
                        ['pm_kisan_active',          '🟢', 'PM-KISAN account active'],
                        ['pm_kisan_rejected_flag',   '🚫', 'Previously rejected'],
                      ].map(([field, icon, label]) => (
                        <label key={field} className={`pred-card ${predForm[field] ? 'pred-card-on' : ''} ${field === 'pm_kisan_rejected_flag' ? 'pred-card-danger' : ''}`}>
                          <span className="pred-card-icon">{icon}</span>
                          <span className="pred-card-label">{label}</span>
                          <span className={`pred-switch ${predForm[field] ? 'switch-on' : ''}`}>
                            <span className="pred-switch-thumb" />
                          </span>
                          <input type="checkbox" checked={predForm[field]}
                            onChange={e => handlePredFieldChange(field, e.target.checked)} />
                        </label>
                      ))}
                    </div>
                    <div className="pred-number-row">
                      <div className="pred-number-field">
                        <label className="pred-number-label">💰 Installments received</label>
                        <input type="number" min="0" max="20" placeholder="0–20"
                          value={predForm.pm_kisan_installment_received}
                          onChange={e => handlePredFieldChange('pm_kisan_installment_received', e.target.value)}
                          className="pred-number-input" />
                      </div>
                    </div>
                  </div>

                  {/* Section 4 — Bank & DBT */}
                  <div className="pred-section">
                    <div className="pred-section-header pred-sec-bank">🏦 Bank &amp; DBT</div>
                    <div className="pred-cards-grid">
                      {[
                        ['bank_account_valid',   '🏦', 'Bank account valid & active'],
                        ['ifsc_valid',            '🔢', 'IFSC code valid'],
                        ['dbt_enabled',           '💸', 'DBT enabled on account'],
                        ['previous_dbt_failure',  '❌', 'Previous DBT failure'],
                      ].map(([field, icon, label]) => (
                        <label key={field} className={`pred-card ${predForm[field] ? 'pred-card-on' : ''} ${field === 'previous_dbt_failure' ? 'pred-card-danger' : ''}`}>
                          <span className="pred-card-icon">{icon}</span>
                          <span className="pred-card-label">{label}</span>
                          <span className={`pred-switch ${predForm[field] ? 'switch-on' : ''}`}>
                            <span className="pred-switch-thumb" />
                          </span>
                          <input type="checkbox" checked={predForm[field]}
                            onChange={e => handlePredFieldChange(field, e.target.checked)} />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Section 5 — Documents */}
                  <div className="pred-section">
                    <div className="pred-section-header pred-sec-docs">📄 Documents Uploaded</div>
                    <div className="pred-cards-grid">
                      {[
                        ['land_doc_uploaded',        '🗺️', 'Land ownership document'],
                        ['bank_passbook_uploaded',   '📔', 'Bank passbook / statement'],
                        ['pm_kisan_proof_uploaded',  '📜', 'PM-KISAN registration proof'],
                      ].map(([field, icon, label]) => (
                        <label key={field} className={`pred-card ${predForm[field] ? 'pred-card-on' : ''}`}>
                          <span className="pred-card-icon">{icon}</span>
                          <span className="pred-card-label">{label}</span>
                          <span className={`pred-switch ${predForm[field] ? 'switch-on' : ''}`}>
                            <span className="pred-switch-thumb" />
                          </span>
                          <input type="checkbox" checked={predForm[field]}
                            onChange={e => handlePredFieldChange(field, e.target.checked)} />
                        </label>
                      ))}
                    </div>
                  </div>

                  {predError && <p className="pred-error">⚠️ {predError}</p>}
                  <div className="pred-form-actions">
                    <button type="submit" className="btn-pred-submit" disabled={predLoading}>
                      {predLoading ? '⏳ Analyzing...' : '🔍 Predict Approval'}
                    </button>
                    <button type="button" className="btn-pred-reset" onClick={handlePredReset}>Reset</button>
                  </div>
                </form>
              ) : (
                /* ── Result Panel ── */
                <div className="pred-result">
                  <div className="pred-gauge-wrapper">
                    <svg viewBox="0 0 120 120" className="pred-gauge">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                      <circle cx="60" cy="60" r="50" fill="none"
                        stroke={predResult.probability >= 70 ? '#22c55e' : predResult.probability >= 40 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="10"
                        strokeDasharray={`${(predResult.probability / 100) * 314} 314`}
                        strokeLinecap="round" transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dasharray 1s ease' }} />
                      <text x="60" y="56" textAnchor="middle"
                        style={{ fontSize: '22px', fontWeight: 700, fill: '#1e293b' }}>
                        {predResult.probability}%
                      </text>
                      <text x="60" y="72" textAnchor="middle" style={{ fontSize: '9px', fill: '#64748b' }}>
                        Approval chance
                      </text>
                    </svg>
                  </div>
                  <div className={`pred-verdict ${predResult.approved ? 'verdict-yes' : 'verdict-no'}`}>
                    {predResult.approved ? '✅ Likely Approved' : '❌ May be Rejected'}
                  </div>
                  <div className="pred-confidence-row">
                    <span className="pred-confidence-label">Confidence:</span>
                    <span className={`pred-confidence-badge conf-${predResult.confidence?.toLowerCase().replace(/[^a-z]/g,'-')}`}>
                      {predResult.confidence}
                    </span>
                  </div>
                  <p className="pred-message">{predResult.message}</p>
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
                    <button className="btn-pred-submit" onClick={handlePredReset}>🔄 Try Again</button>
                    <button className="btn-pred-reset" onClick={() => setShowPredictor(false)}>Close</button>
                  </div>
                </div>
              )
            )}

            {/* TAB 2 — DOCUMENT ANALYSIS removed */}
            {false && activeTab === 'docs' && (
              !docAnalysis ? (
                <form onSubmit={handleDocSubmit} className="pred-form">
                  <div className="doc-upload-intro">
                    <div className="doc-upload-icon">🤖</div>
                    <p>Upload any scheme-related document. Our AI will check <strong>validity, expiry dates, missing fields</strong> and advise if it's acceptable.</p>
                  </div>

                  {/* Document type */}
                  <div className="pred-section">
                    <div className="pred-section-header pred-sec-docs">📋 Select Document Type</div>
                    <div className="doc-type-grid">
                      {[
                        ['aadhaar',       '🪪', 'Aadhaar Card'],
                        ['land_record',   '🗺️', 'Land Record / Khasra'],
                        ['bank_passbook', '📔', 'Bank Passbook'],
                        ['pm_kisan',      '🌾', 'PM-KISAN Certificate'],
                        ['domicile',      '🏠', 'Domicile Certificate'],
                        ['income',        '💰', 'Income Certificate'],
                      ].map(([val, icon, label]) => (
                        <label key={val} className={`doc-type-card ${docType === val ? 'doc-type-active' : ''}`}>
                          <input type="radio" name="docType" value={val}
                            checked={docType === val}
                            onChange={() => setDocType(val)} />
                          <span className="doc-type-icon">{icon}</span>
                          <span className="doc-type-label">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* File upload */}
                  <div className="pred-section">
                    <div className="pred-section-header pred-sec-location">📁 Upload File</div>
                    <label className={`doc-dropzone ${docFile ? 'doc-dropzone-filled' : ''}`}>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => setDocFile(e.target.files[0] || null)} />
                      {docFile ? (
                        <div className="doc-file-info">
                          <span className="doc-file-icon">📎</span>
                          <span className="doc-file-name">{docFile.name}</span>
                          <span className="doc-file-size">({(docFile.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ) : (
                        <div className="doc-dropzone-placeholder">
                          <span className="doc-drop-icon">⬆️</span>
                          <span>Click to upload PDF, JPG or PNG</span>
                          <span className="doc-drop-hint">Max 5 MB</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {docError && <p className="pred-error">⚠️ {docError}</p>}
                  <div className="pred-form-actions">
                    <button type="submit" className="btn-pred-submit"
                      disabled={docLoading || !docFile || !docType}>
                      {docLoading ? '⏳ Analyzing...' : '🔍 Analyze Document'}
                    </button>
                    <button type="button" className="btn-pred-reset" onClick={handleDocReset}>Reset</button>
                  </div>
                </form>
              ) : (
                /* ── Doc Analysis Result ── */
                <div className="pred-result doc-result">
                  <div className="doc-result-header">
                    <span className={`doc-result-badge ${docAnalysis.valid === false ? 'badge-invalid' : docAnalysis.valid ? 'badge-valid' : 'badge-warn'}`}>
                      {docAnalysis.valid === false ? '❌ Issues Found' : docAnalysis.valid ? '✅ Valid Document' : '⚠️ Review Needed'}
                    </span>
                    <span className="doc-result-type">{docType.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>

                  {docAnalysis.summary && (
                    <div className="doc-analysis-box doc-summary">
                      <p className="doc-box-title">📋 Summary</p>
                      <p className="doc-box-text">{docAnalysis.summary}</p>
                    </div>
                  )}

                  {docAnalysis.expiry && (
                    <div className="doc-analysis-box doc-expiry">
                      <p className="doc-box-title">📅 Expiry / Validity</p>
                      <p className="doc-box-text">{docAnalysis.expiry}</p>
                    </div>
                  )}

                  {docAnalysis.extracted_fields && Object.keys(docAnalysis.extracted_fields).length > 0 && (
                    <div className="doc-analysis-box doc-fields">
                      <p className="doc-box-title">🔍 Extracted Information</p>
                      <table className="doc-fields-table">
                        <tbody>
                          {Object.entries(docAnalysis.extracted_fields).map(([k, v]) => (
                            <tr key={k}>
                              <td className="doc-field-key">{k}</td>
                              <td className="doc-field-val">{String(v)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {docAnalysis.issues && docAnalysis.issues.length > 0 && (
                    <div className="doc-analysis-box doc-issues">
                      <p className="doc-box-title">⚠️ Issues</p>
                      <ul className="pred-tips-list">
                        {docAnalysis.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                      </ul>
                    </div>
                  )}

                  {docAnalysis.recommendation && (
                    <div className="doc-analysis-box doc-rec">
                      <p className="doc-box-title">💡 Recommendation</p>
                      <p className="doc-box-text">{docAnalysis.recommendation}</p>
                    </div>
                  )}

                  <div className="pred-form-actions">
                    <button className="btn-pred-submit" onClick={handleDocReset}>🔄 Analyze Another</button>
                    <button className="btn-pred-reset" onClick={() => setShowPredictor(false)}>Close</button>
                  </div>
                </div>
              )
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default SchemeDetails;
