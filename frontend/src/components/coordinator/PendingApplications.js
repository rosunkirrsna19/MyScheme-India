import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as coordService from '../../services/coordinator';
import LoadingSpinner from '../common/LoadingSpinner';
import './PendingApplications.css'; // We'll use this for tables

const PendingApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const data = await coordService.getPendingApplications();
        setApplications(data);
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard-table-container">
      <h2>Pending Applications</h2>
      {error && <p className="dashboard-error">Error: {error}</p>}
      
      {applications.length === 0 && !error && (
        <p>There are no pending applications.</p>
      )}

      {applications.length > 0 && (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Scheme</th>
              <th>Applied On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id}>
                <td>{app.citizen.username}</td>
                <td>{app.scheme.title}</td>
                <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                <td>
                  <Link to={`../review/${app._id}`} className="btn-review">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingApplications;