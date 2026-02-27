import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './SchemeExplorer.css';

// Match score → colour
const scoreColor = (score) => {
  if (score >= 85) return '#16a34a'; // green
  if (score >= 70) return '#d97706'; // amber
  return '#dc2626';                  // red
};

const SchemeExplorer = () => {
  const { t } = useTranslation();
  const { eligibleSchemes } = useContext(AuthContext);
  const [schemes, setSchemes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const navigate = useNavigate();

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

  // Extract unique departments
  const departments = useMemo(() => {
    const deptSet = new Set();
    schemes.forEach(scheme => {
      if (scheme.department) {
        deptSet.add(scheme.department);
      }
    });
    return Array.from(deptSet).sort();
  }, [schemes]);

  // Filter schemes based on search query and selected department
  const filteredSchemes = useMemo(() => {
    return schemes.filter(scheme => {
      // Check department filter
      const departmentMatch = selectedDepartment === 'all' || scheme.department === selectedDepartment;

      // Check search query
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = scheme.name.toLowerCase().includes(searchLower);
      const descriptionMatch = scheme.description.toLowerCase().includes(searchLower);
      const searchMatch = nameMatch || descriptionMatch;

      return departmentMatch && searchMatch;
    });
  }, [schemes, searchQuery, selectedDepartment]);

  const handleViewMore = (schemeId) => {
    navigate(`/schemes/${schemeId}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="scheme-explorer">
      <div className="container">
        <h1>{t('governmentSchemes')}</h1>

        {/* ── AI-recommended "Eligible for You" section ── */}
        {eligibleSchemes.length > 0 && (
          <div className="eligible-section">
            <div className="eligible-section-header">
              <span className="eligible-star">✨</span>
              <h2 className="eligible-title">Eligible for You</h2>
              <span className="eligible-subtitle">AI-matched based on your profile</span>
            </div>

            <div className="eligible-cards-grid">
              {eligibleSchemes.map((scheme, idx) => (
                <div key={scheme.schemeId || idx} className="eligible-card">
                  <div className="eligible-card-top">
                    <h3 className="eligible-card-name">{scheme.scheme_name}</h3>
                    <span
                      className="eligible-match-badge"
                      style={{ background: scoreColor(scheme.match_score) }}
                    >
                      {scheme.match_score}% Match
                    </span>
                  </div>
                  <p className="eligible-card-desc">{scheme.description}</p>
                  <button
                    className="btn btn-primary eligible-view-btn"
                    onClick={() => navigate(`/schemes/${scheme.schemeId}`)}
                  >
                    View More →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="filter-buttons">
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            {t('allSchemes')}
          </button>
          <button 
            className={`btn ${filter === 'eligible' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('eligible')}
          >
            {t('eligibleForMe')}
          </button>
          <button 
            className={`btn ${filter === 'unclaimed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('unclaimed')}
          >
            {t('unclaimedBenefits')}
          </button>
        </div>

        <div className="search-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            className="department-select"
          >
            <option value="all">{t('allDepartments')}</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="schemes-list">
          {filteredSchemes.length === 0 ? (
            <p className="no-schemes">
              {schemes.length === 0
                ? t('noSchemes')
                : t('noSchemesFound')}
            </p>
          ) : (
            filteredSchemes.map((scheme) => (
              <div key={scheme._id} className="scheme-card">
                <div className="scheme-header">
                  <div className="scheme-info">
                    <h3 className="scheme-name">{scheme.name}</h3>
                    <p className="scheme-department">{scheme.department}</p>
                    <p className="scheme-description">{scheme.description}</p>
                  </div>
                  <button
                    onClick={() => handleViewMore(scheme._id)}
                    className="btn btn-primary view-more-btn"
                  >
                    {t('viewMore')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemeExplorer;
