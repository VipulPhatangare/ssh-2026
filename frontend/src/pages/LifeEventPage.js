import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './LifeEventPage.css';

const LifeEventPage = () => {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);

  const lifeEvents = [
    { value: 'Student', icon: '🎓', label: 'Student / Education' },
    { value: 'Farmer', icon: '🌾', label: 'Farmer / Agriculture' },
    { value: 'Senior Citizen', icon: '👴', label: 'Senior Citizen' },
    { value: 'Medical Emergency', icon: '🏥', label: 'Medical Emergency' },
    { value: 'Marriage', icon: '💑', label: 'Marriage' },
    { value: 'New Child', icon: '👶', label: 'New Child / Birth' }
  ];

  const fetchSchemesByEvent = async (event) => {
    setLoading(true);
    try {
      const response = await api.get(`/schemes/life-event/${event}`);
      setSchemes(response.data.data);
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    fetchSchemesByEvent(event);
  };

  return (
    <div className="life-event-page">
      <div className="container">
        <h1>Life-Event Based Services</h1>
        <p className="subtitle">Select a major life event to discover relevant government schemes</p>

        <div className="events-grid">
          {lifeEvents.map((event) => (
            <div
              key={event.value}
              className={`event-card ${selectedEvent === event.value ? 'active' : ''}`}
              onClick={() => handleEventSelect(event.value)}
            >
              <div className="event-icon">{event.icon}</div>
              <h3>{event.label}</h3>
            </div>
          ))}
        </div>

        {loading && <div className="loading">Loading schemes...</div>}

        {!loading && schemes.length > 0 && (
          <div className="schemes-section">
            <h2>Schemes for {selectedEvent}</h2>
            <div className="schemes-grid">
              {schemes.map((scheme) => (
                <div key={scheme._id} className="card scheme-card">
                  <h3>{scheme.name}</h3>
                  <p className="scheme-dept">{scheme.department}</p>
                  <p>{scheme.description}</p>
                  <div className="scheme-benefits">
                    <strong>Benefits:</strong>
                    <p>{scheme.benefits}</p>
                  </div>
                  <a 
                    href={scheme.applyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary"
                  >
                    Apply Now →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && selectedEvent && schemes.length === 0 && (
          <div className="alert alert-info">
            No schemes found for the selected life event.
          </div>
        )}
      </div>
    </div>
  );
};

export default LifeEventPage;
