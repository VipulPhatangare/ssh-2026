import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './SchemeExplorer.css';

const SchemeExplorer = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [schemes, setSchemes] = useState([]);
  const [eligibilityMap, setEligibilityMap] = useState({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchemes();
  }, [filter]);

  // Fetch eligibility for all schemes when schemes load and user is logged in
  useEffect(() => {
    if (user?.id && schemes.length > 0) {
      fetchAllEligibilities();
    }
  }, [schemes, user?.id]);

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

  const fetchAllEligibilities = async () => {
    try {
      const eligibilityPromises = schemes.map(scheme =>
        api.get(`/schemes/check/${scheme._id}/${user.id}`)
          .then(res => ({ schemeId: scheme._id, data: res.data }))
          .catch(err => {
            console.error(`Error fetching eligibility for scheme ${scheme._id}:`, err);
            return { schemeId: scheme._id, data: null };
          })
      );

      const results = await Promise.all(eligibilityPromises);
      const map = {};
      results.forEach(({ schemeId, data }) => {
        map[schemeId] = data;
      });
      setEligibilityMap(map);
    } catch (error) {
      console.error('Error fetching eligibilities:', error);
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

  const getEligibilityBannerType = (schemeId) => {
    const eligibility = eligibilityMap[schemeId];
    if (!eligibility) return null;

    if (eligibility.eligible) {
      return 'fully-eligible';
    }

    if (eligibility.missingDocs && eligibility.missingDocs.length > 0 && 
        (!eligibility.failedConditions || eligibility.failedConditions.length === 0)) {
      return 'missing-docs';
    }

    if (eligibility.failedConditions && eligibility.failedConditions.length > 0) {
      return 'not-eligible';
    }

    return null;
  };

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
                {/* ELIGIBILITY BANNER */}
                {(() => {
                  const bannerType = getEligibilityBannerType(scheme._id);
                  if (!bannerType) return null;

                  return (
                    <div className={`scheme-card-banner banner-${bannerType}`}>
                      {bannerType === 'fully-eligible' && (
                        <div className="banner-content-compact">
                          <span className="banner-icon">✓</span>
                          <span className="banner-text">You are eligible</span>
                        </div>
                      )}
                      {bannerType === 'missing-docs' && (
                        <div className="banner-content-compact">
                          <span className="banner-icon">⚠</span>
                          <span className="banner-text">Missing documents</span>
                        </div>
                      )}
                      {bannerType === 'not-eligible' && (
                        <div className="banner-content-compact">
                          <span className="banner-icon">✗</span>
                          <span className="banner-text">Not eligible</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

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
