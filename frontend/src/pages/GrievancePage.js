import React, { useState, useContext, useRef } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import './GrievancePage.css';

const GrievancePage = () => {
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    image: null,
    description: '',
    location: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', text: '' });
  const [step, setStep] = useState('form');

  const showToast = (type, text) => {
    setToast({ show: true, type, text });
    setTimeout(() => setToast({ show: false, type: '', text: '' }), 4000);
  };

  // Upload image to Cloudinary via backend
  const uploadToCloudinary = async (file) => {
    setUploading(true);
    setUploadProgress(10);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const response = await api.post('/ai/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / e.total) * 80);
          setUploadProgress(pct);
        }
      });
      // uploadRoutes returns { imageUrl: '...' }
      const cloudUrl = response.data.imageUrl || response.data.url;
      if (!cloudUrl) throw new Error('No image URL returned from server');
      setFormData(prev => ({ ...prev, image: cloudUrl }));
      setUploadProgress(100);
      showToast('success', '✅ Image uploaded to cloud!');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('error', error.response?.data?.error || 'Failed to upload image. Try again.');
      setImagePreview(null);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 800);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image must be smaller than 5 MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    uploadToCloudinary(file);
  };

  const handleImageChange = (e) => processFile(e.target.files[0]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) { showToast('error', 'Please upload an image first'); return; }
    if (!formData.location.trim()) { showToast('error', 'Please enter a location'); return; }
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name || user?.fullName || 'Anonymous',
        image_url: formData.image,
        description: formData.description || 'No description provided',
        location: formData.location.trim()
      };
      const response = await api.post('/grievances/submit-photo', payload);
      if (!response.data.success) throw new Error(response.data.message);
      const analysis = response.data.data?.analysis;
      if (analysis) {
        setAnalysisResult(analysis);
        setStep('result');
        showToast('success', '🤖 AI analysis complete!');
      } else {
        showToast('warning', 'Submitted! AI analysis unavailable right now.');
      }
      setFormData({ name: user?.fullName || '', image: null, description: '', location: '' });
      setImagePreview(null);
    } catch (error) {
      showToast('error', error.response?.data?.message || error.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const extractText = (result) => {
    if (!result) return '';
    if (typeof result === 'string') return result;
    return (
      result.draft || result.output || result.response || result.text ||
      result.choices?.[0]?.message?.content ||
      result.message?.content ||
      JSON.stringify(result, null, 2)
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractText(analysisResult));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grv-page">

      {/* Toast */}
      {toast.show && (
        <div className={`grv-toast grv-toast-${toast.type}`}>{toast.text}</div>
      )}

      <div className="grv-container">

        {/* Hero */}
        <div className="grv-hero">
          <span className="grv-hero-badge">AI-Powered</span>
          <h1 className="grv-hero-title">Report a Grievance</h1>
          <p className="grv-hero-subtitle">
            Upload a photo, add your location, and let AI draft your formal complaint in seconds.
          </p>
          <div className="grv-steps-indicator">
            <div className={`grv-step-dot ${step === 'form' ? 'active' : 'done'}`}>
              {step === 'result' ? '✓' : '1'}
            </div>
            <div className={`grv-step-line ${step === 'result' ? 'done' : ''}`} />
            <div className={`grv-step-dot ${step === 'result' ? 'active' : ''}`}>2</div>
          </div>
          <div className="grv-steps-labels">
            <span>Upload &amp; Submit</span>
            <span>AI Analysis</span>
          </div>
        </div>

        {step === 'form' ? (
          <div className="grv-card">
            <form onSubmit={handleSubmit} className="grv-form">

              {/* Name */}
              <div className="grv-field">
                <label className="grv-field-label">
                  <span>👤</span> Your Name
                </label>
                <input
                  type="text"
                  className="grv-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>

              {/* Upload */}
              <div className="grv-field">
                <label className="grv-field-label">
                  <span>📸</span> Grievance Photo <span className="grv-required">*</span>
                </label>
                <div
                  className={`grv-dropzone${dragActive ? ' dz-drag' : ''}${imagePreview ? ' dz-filled' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  {imagePreview ? (
                    <div className="grv-dz-preview">
                      <img src={imagePreview} alt="Preview" className="grv-preview-img" />
                      <div className="grv-dz-overlay">
                        {uploading ? (
                          <div className="grv-upload-status">
                            <div className="grv-progress-bar">
                              <div className="grv-progress-fill" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <span>Uploading {uploadProgress}%</span>
                          </div>
                        ) : (
                          <span className="grv-change-hint">🔄 Click to change</span>
                        )}
                      </div>
                      {formData.image && !uploading && (
                        <div className="grv-uploaded-badge">✅ Uploaded</div>
                      )}
                    </div>
                  ) : (
                    <div className="grv-dz-placeholder">
                      <div className="grv-dz-icon">{dragActive ? '🎯' : '📷'}</div>
                      <p className="grv-dz-text">
                        {dragActive ? 'Drop it here!' : 'Drag & drop or click to upload'}
                      </p>
                      <p className="grv-dz-hint">JPG, PNG — max 5 MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="grv-field">
                <label className="grv-field-label">
                  <span>📍</span> Location <span className="grv-required">*</span>
                </label>
                <input
                  type="text"
                  className="grv-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Bhopal, MP — Ward 12, Main Road"
                  required
                />
              </div>

              {/* Description */}
              <div className="grv-field">
                <label className="grv-field-label">
                  <span>📝</span> Description <span className="grv-optional">(optional)</span>
                </label>
                <textarea
                  className="grv-textarea"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Any extra details about the issue..."
                />
              </div>

              <button
                type="submit"
                className="grv-submit-btn"
                disabled={uploading || submitting || !formData.image}
              >
                {submitting ? (
                  <><span className="grv-spinner" /> Analyzing with AI...</>
                ) : uploading ? (
                  <><span className="grv-spinner" /> Uploading image...</>
                ) : (
                  <>🚀 Submit &amp; Get AI Analysis</>
                )}
              </button>

              {!formData.image && (
                <p className="grv-submit-hint">⬆️ Upload a photo to enable submission</p>
              )}
            </form>
          </div>
        ) : (
          /* Result */
          <div className="grv-result-card">
            <div className="grv-result-header">
              <div className="grv-result-avatar">🤖</div>
              <div>
                <h2 className="grv-result-title">AI-Generated Complaint Draft</h2>
                <p className="grv-result-sub">Review, copy and use this for your formal complaint</p>
              </div>
            </div>
            <div className="grv-draft-box">
              <pre className="grv-draft-text">{extractText(analysisResult)}</pre>
            </div>
            <div className="grv-result-actions">
              <button className="grv-copy-btn" onClick={handleCopy}>
                {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
              </button>
              <button className="grv-new-btn" onClick={() => { setStep('form'); setAnalysisResult(null); }}>
                ➕ Submit Another
              </button>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="grv-how">
          <h3 className="grv-how-title">How It Works</h3>
          <div className="grv-how-grid">
            <div className="grv-how-card">
              <div className="grv-how-icon">📸</div>
              <h4>Upload Photo</h4>
              <p>Take or select a clear photo of the issue you want to report</p>
            </div>
            <div className="grv-how-card">
              <div className="grv-how-icon">📍</div>
              <h4>Add Location</h4>
              <p>Enter the exact location where the issue was observed</p>
            </div>
            <div className="grv-how-card">
              <div className="grv-how-icon">🤖</div>
              <h4>Get AI Draft</h4>
              <p>AI analyzes the image and generates a formal complaint letter</p>
            </div>
            <div className="grv-how-card">
              <div className="grv-how-icon">📋</div>
              <h4>Copy &amp; File</h4>
              <p>Copy the draft and submit it to the relevant authority</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GrievancePage;

