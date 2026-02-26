import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './SchemeExplorer.css';

const SchemeExplorer = () => {
  const [schemes, setSchemes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchemes();
  }, [filter]);

  const fetchSchemes = async () => {
    try {
      let response;
      if (filter === 'eligible') {
        response = await api.get('/schemes/eligible/me');
        setSchemes(response.data.eligible.map(item => item.scheme));
      } else if (filter === 'unclaimed') {
        response = await api.get('/schemes/unclaimed/me');
        setSchemes(response.data.data.map(item => item.scheme));
      } else {
        response = await api.get('/schemes');
        setSchemes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading schemes...</div>;
  }

  return (
    <div className="scheme-explorer">
      <div className="container">
        <h1>Government Schemes</h1>

        <div className="filter-buttons">
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All Schemes
          </button>
          <button 
            className={`btn ${filter === 'eligible' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('eligible')}
          >
            Eligible for Me
          </button>
          <button 
            className={`btn ${filter === 'unclaimed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('unclaimed')}
          >
            Unclaimed Benefits
          </button>
        </div>

        <div className="schemes-grid">
          {schemes.length === 0 ? (
            <p>No schemes found.</p>
          ) : (
            schemes.map((scheme) => (
              <div key={scheme._id} className="card scheme-card">
                <h3>{scheme.name}</h3>
                <p className="scheme-dept">{scheme.department}</p>
                <p>{scheme.description}</p>
                
                <div className="scheme-details">
                  <h4>Benefits:</h4>
                  <p>{scheme.benefits}</p>

                  <h4>Required Documents:</h4>
                  <ul>
                    {scheme.requiredDocuments.map((doc, index) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemeExplorer;
