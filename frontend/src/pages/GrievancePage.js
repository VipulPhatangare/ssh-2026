import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import './GrievancePage.css';

const GrievancePage = () => {
  const { t } = useTranslation();
  const [grievances, setGrievances] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    applicationId: '',
    complaintText: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [grievancesRes, applicationsRes] = await Promise.all([
        api.get('/grievances/my-grievances'),
        api.get('/applications/my-applications')
      ]);
      setGrievances(grievancesRes.data.data);
      setApplications(applicationsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
<<<<<<< HEAD
      const payload = {
        name: formData.name,
        image_url: formData.image,
        description: formData.description || 'No description provided',
        location: formData.location
      };

      console.log('📤 Submitting grievance:', payload);

      // Call backend endpoint (which forwards to webhook)
      const response = await api.post('/grievances/submit-photo', payload);

      console.log('📨 Received response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to submit grievance');
      }

      // Store analysis result from webhook
      if (response.data.data?.analysis) {
        console.log('✅ Analysis received:', response.data.data.analysis);
        setAnalysisResult(response.data.data.analysis);
        setMessage({ 
          type: 'success', 
          text: 'Grievance analyzed successfully! See the AI analysis below.' 
        });
      } else {
        console.log('⚠️ No analysis in response. Full data:', response.data.data);
        // Show webhook configuration note if available
        const note = response.data.data?.webhookNote;
        setMessage({ 
          type: 'warning', 
          text: note || 'Grievance submitted successfully! (AI analysis not available - webhook may need configuration)' 
        });
      }

      // Reset form
      setFormData({
        name: user?.fullName || '',
        image: null,
        description: '',
        location: ''
      });
      setImagePreview(null);
      
=======
      await api.post('/grievances', formData);
      setMessage(t('grievanceSubmitted'));
      setShowForm(false);
      setFormData({ applicationId: '', complaintText: '' });
      fetchData();
      setTimeout(() => setMessage(''), 3000);
>>>>>>> 9c7f4c0f5b2d007e003e00220a45f8ad05bfb171
    } catch (error) {
      setMessage(error.response?.data?.message || t('grievanceFailed'));
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Resolved': return 'success';
      case 'Open': return 'warning';
      case 'Escalated': return 'danger';
      default: return 'info';
    }
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="grievance-page">
      <div className="container">
        <div className="page-header">
          <h1>{t('grievancePage')}</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? t('cancel') : t('raiseNewGrievance')}
          </button>
        </div>

<<<<<<< HEAD
        {/* AI Analysis Result */}
        {analysisResult && (
          <div className="grv-analysis-box">
            <h3 className="grv-analysis-title">🤖 AI-Generated Complaint Draft</h3>
            <p className="grv-analysis-subtitle">
              Copy this draft and use it to file your formal complaint
            </p>
            
            {/* Draft Response */}
            <div className="grv-draft-section">
              <div className="grv-draft-content">
                {(() => {
                  // Handle different response formats from webhook
                  if (typeof analysisResult === 'string') {
                    return analysisResult;
                  }
                  if (analysisResult.draft) {
                    return analysisResult.draft;
                  }
                  if (analysisResult.choices?.[0]?.message?.content) {
                    return analysisResult.choices[0].message.content;
                  }
                  if (analysisResult.message?.content) {
                    return analysisResult.message.content;
                  }
                  // Try to extract text from any structure
                  return JSON.stringify(analysisResult, null, 2);
                })()}
              </div>
              <button
                type="button"
                className="grv-copy-btn"
                onClick={() => {
                  let text = analysisResult;
                  if (typeof analysisResult !== 'string') {
                    text = analysisResult.draft || 
                           analysisResult.choices?.[0]?.message?.content || 
                           analysisResult.message?.content ||
                           JSON.stringify(analysisResult);
                  }
                  navigator.clipboard.writeText(text);
                  setMessage({ type: 'success', text: 'Draft copied to clipboard!' });
                  setTimeout(() => setMessage({ type: '', text: '' }), 2000);
                }}
              >
                📋 Copy Draft
              </button>
            </div>
=======
        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message}
>>>>>>> 9c7f4c0f5b2d007e003e00220a45f8ad05bfb171
          </div>
        )}

        {showForm && (
          <div className="card">
            <h2>{t('submitNewGrievance')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('selectApplication')}</label>
                <select
                  value={formData.applicationId}
                  onChange={(e) => setFormData({...formData, applicationId: e.target.value})}
                  required
                >
                  <option value="">{t('selectApplicationPlaceholder')}</option>
                  {applications.map((app) => (
                    <option key={app._id} value={app._id}>
                      {app.schemeId?.name} - {app.applicationNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('complaintDetails')}</label>
                <textarea
                  rows="5"
                  value={formData.complaintText}
                  onChange={(e) => setFormData({...formData, complaintText: e.target.value})}
                  placeholder={t('complaintPlaceholder')}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary">{t('submitGrievance')}</button>
            </form>
          </div>
        )}

        <div className="grievances-list">
          {grievances.length === 0 ? (
            <div className="alert alert-info">
              {t('noGrievances')}
            </div>
          ) : (
            grievances.map((grievance) => (
              <div key={grievance._id} className="card grievance-card">
                <div className="grievance-header">
                  <div>
                    <h3>{grievance.applicationId?.schemeId?.name}</h3>
                    <p className="grievance-number">{t('grievanceNo')}: {grievance.grievanceNumber}</p>
                  </div>
                  <span className={`badge badge-${getStatusColor(grievance.status)}`}>
                    {grievance.status}
                  </span>
                </div>

                <p className="complaint-text">{grievance.complaintText}</p>

                <div className="grievance-meta">
                  <span>{t('escalationLevel')}: {grievance.escalationLevel}</span>
                  <span>{t('created')}: {new Date(grievance.createdAt).toLocaleDateString()}</span>
                </div>

                {grievance.responses.length > 0 && (
                  <div className="responses-section">
                    <h4>{t('responses')}:</h4>
                    {grievance.responses.map((response, index) => (
                      <div key={index} className="response-item">
                        <strong>{response.respondent}</strong>
                        <p>{response.message}</p>
                        <span className="response-date">
                          {new Date(response.date).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GrievancePage;
