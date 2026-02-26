import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'applications') fetchApplications();
    if (activeTab === 'grievances') fetchGrievances();
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications');
      setApplications(response.data.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchGrievances = async () => {
    try {
      const response = await api.get('/grievances');
      setGrievances(response.data.data);
    } catch (error) {
      console.error('Error fetching grievances:', error);
    }
  };

  const updateApplicationStatus = async (appId, status, remarks) => {
    try {
      await api.put(`/applications/${appId}/status`, { status, remarks });
      fetchApplications();
      alert('Application status updated successfully');
    } catch (error) {
      alert('Error updating application status');
    }
  };

  if (loading) {
    return <div className="loading">Loading admin panel...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="container">
        <h1>Admin Panel</h1>

        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button 
            className={`tab-btn ${activeTab === 'grievances' ? 'active' : ''}`}
            onClick={() => setActiveTab('grievances')}
          >
            Grievances
          </button>
        </div>

        {activeTab === 'dashboard' && stats && (
          <div className="dashboard-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{stats.overview.totalUsers}</h3>
                <p>Total Users</p>
              </div>
              <div className="stat-card">
                <h3>{stats.overview.totalApplications}</h3>
                <p>Total Applications</p>
              </div>
              <div className="stat-card">
                <h3>{stats.overview.pendingApplications}</h3>
                <p>Pending Applications</p>
              </div>
              <div className="stat-card">
                <h3>{stats.overview.totalSchemes}</h3>
                <p>Active Schemes</p>
              </div>
              <div className="stat-card">
                <h3>{stats.overview.pendingGrievances}</h3>
                <p>Pending Grievances</p>
              </div>
            </div>

            <div className="card">
              <h2>Recent Applications</h2>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Application No</th>
                      <th>User</th>
                      <th>Scheme</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentApplications.slice(0, 5).map((app) => (
                      <tr key={app._id}>
                        <td>{app.applicationNumber}</td>
                        <td>{app.userId?.fullName}</td>
                        <td>{app.schemeId?.name}</td>
                        <td><span className={`badge badge-${getStatusColor(app.status)}`}>{app.status}</span></td>
                        <td>{new Date(app.submissionDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="card">
              <h2>All Users</h2>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>District</th>
                      <th>Occupation</th>
                      <th>Registered Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>{user.district}</td>
                        <td>{user.occupation}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-tab">
            <div className="card">
              <h2>All Applications</h2>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>App No</th>
                      <th>User</th>
                      <th>Scheme</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app._id}>
                        <td>{app.applicationNumber}</td>
                        <td>{app.userId?.fullName}</td>
                        <td>{app.schemeId?.name}</td>
                        <td><span className={`badge badge-${getStatusColor(app.status)}`}>{app.status}</span></td>
                        <td>{new Date(app.submissionDate).toLocaleDateString()}</td>
                        <td>
                          <select 
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              if (newStatus && window.confirm(`Change status to ${newStatus}?`)) {
                                updateApplicationStatus(app._id, newStatus, `Status changed to ${newStatus} by admin`);
                              }
                            }}
                            defaultValue=""
                          >
                            <option value="">Update Status</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grievances' && (
          <div className="grievances-tab">
            <div className="card">
              <h2>All Grievances</h2>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Grievance No</th>
                      <th>User</th>
                      <th>Application</th>
                      <th>Status</th>
                      <th>Escalation Level</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grievances.map((grievance) => (
                      <tr key={grievance._id}>
                        <td>{grievance.grievanceNumber}</td>
                        <td>{grievance.userId?.fullName}</td>
                        <td>{grievance.applicationId?.applicationNumber}</td>
                        <td><span className={`badge badge-${getGrievanceStatusColor(grievance.status)}`}>{grievance.status}</span></td>
                        <td>{grievance.escalationLevel}</td>
                        <td>{new Date(grievance.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch(status) {
    case 'Approved': return 'success';
    case 'Rejected': return 'danger';
    case 'Pending': return 'warning';
    default: return 'info';
  }
};

const getGrievanceStatusColor = (status) => {
  switch(status) {
    case 'Resolved': return 'success';
    case 'Open': return 'warning';
    case 'Escalated': return 'danger';
    default: return 'info';
  }
};

export default AdminPanel;
