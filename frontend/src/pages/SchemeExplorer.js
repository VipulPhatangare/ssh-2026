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
  const { eligibleSchemes, eligibleLoading, refreshEligibleSchemes } = useContext(AuthContext);
  const [schemes, setSchemes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    // 'eligible' tab uses n8n context data — no backend fetch needed
    if (filter !== 'eligible') fetchSchemes();
  }, [filter]);

  const fetchSchemes = async () => {
    try {
      let response;
      if (filter === 'unclaimed') {
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

  if (loading && filter !== 'eligible') {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="scheme-explorer">
      <div className="container">
        <h1>{t('governmentSchemes')}</h1>

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
          {filter === 'eligible' ? (
            // ── Eligible tab: render n8n AI-recommended schemes ──
            eligibleLoading ? (
              <div className="eligible-loading" style={{ padding: '40px 0' }}>
                <div className="eligible-spinner" />
                <p>Finding best schemes for your profile…</p>
              </div>
            ) : eligibleSchemes.length === 0 ? (
              <div className="no-schemes">
                <p>No AI recommendations yet.</p>
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={refreshEligibleSchemes}>
                  🔄 Get My Eligible Schemes
                </button>
              </div>
            ) : (
              eligibleSchemes.map((scheme, idx) => (
                <div key={scheme.schemeId || idx} className="scheme-card">
                  <div className="scheme-header">
                    <div className="scheme-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <h3 className="scheme-name" style={{ margin: 0 }}>{scheme.scheme_name}</h3>
                        {scheme.match_score != null && (
                          <span
                            className="eligible-match-badge"
                            style={{ backgroundColor: scoreColor(scheme.match_score), flexShrink: 0 }}
                          >
                            {scheme.match_score}% Match
                          </span>
                        )}
                      </div>
                      <p className="scheme-description">{scheme.description}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/schemes/${scheme.schemeId}`)}
                      className="btn btn-primary view-more-btn"
                    >
                      {t('viewMore')}
                    </button>
                  </div>
                </div>
              ))
            )
          ) : filteredSchemes.length === 0 ? (
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
