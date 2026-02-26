import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './SchemeExplorer.css';

const SchemeExplorer = () => {
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

        <div className="search-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by scheme name or description..."
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
            <option value="all">All Departments</option>
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
                ? 'No schemes found.'
                : 'No schemes match your search or filter criteria.'}
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
                    View More
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
