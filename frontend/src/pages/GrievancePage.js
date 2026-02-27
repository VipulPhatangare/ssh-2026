import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
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
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [dragActive, setDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Upload image to backend Cloudinary endpoint
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('message', 'Grievance photo');

    try {
      const response = await api.post('/ai/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleImageSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setUploading(true);
    setMessage({ type: '', text: '' });
    try {
      const imageUrl = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
      setMessage({ type: 'success', text: 'Image uploaded successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      setMessage({ type: 'error', text: 'Please upload an image' });
      return;
    }

    if (!formData.location) {
      setMessage({ type: 'error', text: 'Please provide location' });
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

      // Call backend endpoint (which forwards to webhook)
      const response = await api.post('/grievances/submit-photo', payload);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to submit grievance');
      }

      // Store analysis result from webhook
      if (response.data.data?.analysis) {
        setAnalysisResult(response.data.data.analysis);
      }

      setMessage({ 
        type: 'success', 
        text: 'Grievance analyzed successfully! See the AI analysis below.' 
      });

      // Reset form
      setFormData({
        name: user?.fullName || '',
        image: null,
        description: '',
        location: ''
      });
      setImagePreview(null);
      
    } catch (error) {
      console.error('Submit error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.message || 'Failed to submit grievance. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="grv-page">
      <div className="grv-container">
        
        {/* Header */}
        <div className="grv-header">
          <div>
            <h1 className="grv-title">📣 File a Grievance</h1>
            <p className="grv-subtitle">Report issues with photo evidence and we'll help resolve them</p>
          </div>
        </div>

        {/* Alert Message */}
        {message.text && (
          <div className={`grv-alert ${message.type === 'success' ? 'grv-alert-success' : 'grv-alert-error'}`}>
            <span className="grv-alert-icon">
              {message.type === 'success' ? '✓' : '⚠'}
            </span>
            {message.text}
          </div>
        )}

        {/* Main Form */}
        <form className="grv-form" onSubmit={handleSubmit}>
          
          {/* Image Upload Section */}
          <div className="grv-section">
            <label className="grv-label">
              <span className="grv-label-text">Upload Evidence Photo *</span>
              <span className="grv-label-hint">Required - JPG, PNG or WEBP, max 5MB</span>
            </label>

            {!imagePreview ? (
              <div
                className={`grv-upload-zone ${dragActive ? 'grv-drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                
                <div className="grv-upload-icon">
                  {uploading ? '⏳' : '📸'}
                </div>
                <p className="grv-upload-text">
                  {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                </p>
                <p className="grv-upload-hint">Photo of the issue/problem</p>
              </div>
            ) : (
              <div className="grv-image-preview">
                <img src={imagePreview} alt="Preview" className="grv-preview-img" />
                <button
                  type="button"
                  className="grv-remove-btn"
                  onClick={removeImage}
                  disabled={uploading}
                >
                  ✕
                </button>
                {uploading && <div className="grv-upload-overlay">Uploading...</div>}
              </div>
            )}
          </div>

          {/* Name Field */}
          <div className="grv-section">
            <label className="grv-label" htmlFor="name">
              <span className="grv-label-text">Your Name *</span>
            </label>
            <input
              id="name"
              type="text"
              className="grv-input"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Location Field */}
          <div className="grv-section">
            <label className="grv-label" htmlFor="location">
              <span className="grv-label-text">Location / Address *</span>
              <span className="grv-label-hint">Where is the issue located?</span>
            </label>
            <input
              id="location"
              type="text"
              className="grv-input"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Ward 5, Near Main Market, Bhopal"
              required
            />
          </div>

          {/* Description Field (Optional) */}
          <div className="grv-section">
            <label className="grv-label" htmlFor="description">
              <span className="grv-label-text">Description</span>
              <span className="grv-label-hint grv-optional">Optional</span>
            </label>
            <textarea
              id="description"
              className="grv-textarea"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide additional details about the issue (optional)..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="grv-submit-btn"
            disabled={submitting || uploading || !formData.image}
          >
            {submitting ? (
              <>
                <span className="grv-spinner" />
                Submitting...
              </>
            ) : (
              <>
                <span>📤</span>
                Submit Grievance
              </>
            )}
          </button>
        </form>

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
                {analysisResult.draft || analysisResult.choices?.[0]?.message?.content || analysisResult}
              </div>
              <button
                type="button"
                className="grv-copy-btn"
                onClick={() => {
                  const text = analysisResult.draft || analysisResult.choices?.[0]?.message?.content || analysisResult;
                  navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text));
                  setMessage({ type: 'success', text: 'Draft copied to clipboard!' });
                  setTimeout(() => setMessage({ type: '', text: '' }), 2000);
                }}
              >
                📋 Copy Draft
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="grv-info-box">
          <h3 className="grv-info-title">💡 How it works</h3>
          <ul className="grv-info-list">
            <li>
              <strong>1. Upload Photo:</strong> Take a clear picture of the issue/problem
            </li>
            <li>
              <strong>2. Add Location:</strong> Specify where the issue is located
            </li>
            <li>
              <strong>3. Submit:</strong> Your grievance will be reviewed by our team
            </li>
            <li>
              <strong>4. Track:</strong> You'll receive updates on resolution progress
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default GrievancePage;
