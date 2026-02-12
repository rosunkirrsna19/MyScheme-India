import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as coordService from '../../services/coordinator';
import LoadingSpinner from '../common/LoadingSpinner';
import './AllApplications.css'; // We will create this CSS file next

const AllApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // This useEffect will re-run whenever the user stops typing
  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const data = await coordService.getAllApplications(searchTerm);
        setApplications(data);
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };

    // This is a "debounce" timer.
    // It waits 500ms after the user stops typing before calling the API.
    const timerId = setTimeout(() => {
      fetchApps();
    }, 500);

    return () => {
      clearTimeout(timerId); // Clear the timer on cleanup
    };
  }, [searchTerm]); // Re-run this effect when searchTerm changes

  // Helper function to render status badges
  const renderStatusBadge = (status) => {
    return (
      <span className={`status-badge status-${status.toLowerCase()}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="all-apps-container">
      <h2>Application History</h2>

      {/* --- NEW SEARCH BAR --- */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by citizen name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {loading && <LoadingSpinner />}
      {error && <p className="dashboard-error">Error: {error}</p>}
      
      {!loading && !error && applications.length === 0 && (
        <p>No applications found.</p>
      )}

      {!loading && !error && applications.length > 0 && (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Citizen</th>
              <th>Email</th>
              <th>Scheme</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id}>
                <td>{app.citizen.username}</td>
                <td>{app.citizen.email}</td>
                <td>{app.scheme.title}</td>
                <td>{renderStatusBadge(app.status)}</td>
                <td>
                  <Link to={`../review/${app._id}`} className="btn-review">
                    View
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

export default AllApplications;