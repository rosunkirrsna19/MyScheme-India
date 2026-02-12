import React, { useState, useEffect } from 'react';
import * as adminService from '../../services/admin';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import './ApplicationStats.css'; // We'll update this CSS file

// Colors for the pie chart
const PIE_COLORS = {
  Pending: '#FFBB28',
  Approved: '#00C49F',
  Rejected: '#FF8042',
};

const AdminHome = () => {
  const [cardStats, setCardStats] = useState(null);
  const [appStatusData, setAppStatusData] = useState([]);
  const [schemeDeptData, setSchemeDeptData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true);
        // Fetch all three data points in parallel
        const [cardData, appData, schemeData] = await Promise.all([
          adminService.getAdminStats(),
          adminService.getApplicationStatusStats(),
          adminService.getSchemeDepartmentStats(),
        ]);
        
        setCardStats(cardData);
        setAppStatusData(appData);
        setSchemeDeptData(schemeData);
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };
    fetchAllStats();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="dashboard-error">Error: {error}</p>;

  return (
    <div className="dashboard-home">
      <h2>Admin Dashboard</h2>
      
      {/* --- 1. Stat Cards --- */}
      {cardStats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{cardStats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Schemes</h3>
            <p>{cardStats.totalSchemes}</p>
          </div>
          <div className="stat-card">
            <h3>Total Applications</h3>
            <p>{cardStats.totalApplications}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Applications</h3>
            <p>{cardStats.pendingApplications}</p>
          </div>
        </div>
      )}

      {/* --- 2. Charts --- */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Applications by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={appStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {appStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Schemes by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={schemeDeptData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={false} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#006400" name="No. of Schemes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;