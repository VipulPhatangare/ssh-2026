import React, { useState, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import './GrievancePage.css';

const GrievancePage = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    image: null,
    description: '',
    location: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file) => {
    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await api.post('/ai/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormData(prev => ({ ...prev, image: response.data.url }));
      setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to upload image' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image) {
      setMessage({ type: 'error', text: 'Please upload an image first' });
      return;
    }

    if (!formData.location) {
      setMessage({ type: 'error', text: 'Please enter a location' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
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
      
    } catch (error) {
      console.error('❌ Submit error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.message || 'Failed to submit grievance' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Image file handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      uploadToCloudinary(file);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        uploadToCloudinary(file);
      } else {
        setMessage({ type: 'error', text: 'Please upload an image file' });
      }
    }
  };

  return (
    <div className="grv-page">
      <div className="grv-container">
        {/* Header */}
        <div className="grv-header">
          <h1 className="grv-title">📢 Report a Grievance</h1>
          <p className="grv-subtitle">Upload a photo and get AI-powered complaint assistance</p>
        </div>

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
          </div>
        )}

        {/* Alert Messages */}
        {message.text && (
          <div className={`grv-alert grv-alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Submission Form */}
        <div className="grv-form-card">
          <form onSubmit={handleSubmit} className="grv-form">
            
            {/* Name Field (Auto-filled) */}
            <div className="grv-form-group">
              <label className="grv-label">
                <span className="grv-label-icon">👤</span>
                Your Name
              </label>
              <input
                type="text"
                className="grv-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Auto-filled from profile"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="grv-form-group">
              <label className="grv-label">
                <span className="grv-label-icon">📸</span>
                Upload Grievance Photo
                <span className="grv-required">*</span>
              </label>
              <div
                className={`grv-dropzone ${dragActive ? 'grv-dropzone-active' : ''} ${imagePreview ? 'grv-dropzone-filled' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('image-input').click()}
              >
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                
                {imagePreview ? (
                  <div className="grv-preview">
                    <img src={imagePreview} alt="Preview" className="grv-preview-img" />
                    <div className="grv-preview-overlay">
                      <span>Click to change image</span>
                    </div>
                  </div>
                ) : (
                  <div className="grv-dropzone-content">
                    <div className="grv-upload-icon">☁️</div>
                    <p className="grv-upload-text">
                      {dragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="grv-upload-hint">Supports: JPG, PNG (Max 5MB)</p>
                  </div>
                )}
              </div>
              {uploading && (
                <p className="grv-uploading">⏳ Uploading to cloud...</p>
              )}
            </div>

            {/* Description (Optional) */}
            <div className="grv-form-group">
              <label className="grv-label">
                <span className="grv-label-icon">📝</span>
                Description
                <span className="grv-optional">(Optional)</span>
              </label>
              <textarea
                className="grv-textarea"
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide additional details about your grievance..."
              />
            </div>

            {/* Location */}
            <div className="grv-form-group">
              <label className="grv-label">
                <span className="grv-label-icon">📍</span>
                Location
                <span className="grv-required">*</span>
              </label>
              <input
                type="text"
                className="grv-input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter the location (e.g., Mumbai)"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="grv-submit-btn"
              disabled={uploading || submitting || !formData.image}
            >
              {submitting ? (
                <>
                  <span className="grv-spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Submit & Get AI Analysis
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Section */}
        <div className="grv-info-box">
          <div className="grv-info-item">
            <span className="grv-info-icon">🤖</span>
            <div>
              <h4>AI-Powered Analysis</h4>
              <p>Get instant complaint drafts generated by AI</p>
            </div>
          </div>
          <div className="grv-info-item">
            <span className="grv-info-icon">📋</span>
            <div>
              <h4>Ready-to-Use Drafts</h4>
              <p>Copy and paste the generated text for filing</p>
            </div>
          </div>
          <div className="grv-info-item">
            <span className="grv-info-icon">⚡</span>
            <div>
              <h4>Quick Resolution</h4>
              <p>Speed up your complaint process with AI assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrievancePage;
