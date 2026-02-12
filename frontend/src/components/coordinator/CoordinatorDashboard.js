import React, { useState, useEffect } from 'react';
import * as coordService from '../../services/coordinator';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts'; // --- IMPORT RECHARTS ---
import '../admin/ApplicationStats.css'; // Re-using admin chart CSS

// --- NEW: Colors for Pie Chart ---
const PIE_COLORS = {
  Approved: '#00C49F',
  Rejected: '#FF8042',
};

const CoordinatorHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await coordService.getCoordinatorStats();
        setStats(data);
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="dashboard-error">Error: {error}</p>;

  // --- NEW: Data for Pie Chart ---
  const pieData = [
    { name: 'Approved', value: stats?.approvedCount || 0 },
    { name: 'Rejected', value: stats?.rejectedCount || 0 },
  ].filter(entry => entry.value > 0); // Filter out 0 values

  return (
    <div className="dashboard-home">
      <h2>Coordinator Dashboard</h2>
      <p className="dashboard-desc">Welcome! You can only see applications for schemes assigned to you.</p>
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Pending Applications</h3>
            <p>{stats.pendingCount}</p>
          </div>
          <div className="stat-card">
            <h3>Approved by Me</h3>
            <p>{stats.approvedCount}</p>
          </div>
          <div className="stat-card">
            <h3>Rejected by Me</h3>
            <p>{stats.rejectedCount}</p>
          </div>
          <div className="stat-card">
            <h3>Total Reviewed by Me</h3>
            <p>{stats.totalReviewedByMe}</p>
          </div>
        </div>
      )}

      {/* --- NEW: Analytics Chart --- */}
      <div className="charts-grid coordinator-chart">
        <div className="chart-container">
          <h3>My Reviewed Applications</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data-chart">No data to display. Review an application to see stats.</p>
          )}
        </div>
      </div>
      {/* --- END OF NEW CHART --- */}

    </div>
  );
};

export default CoordinatorHome;