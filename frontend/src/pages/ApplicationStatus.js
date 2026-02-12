import React, { useState, useEffect } from 'react';
import * as appService from '../services/applications'; // --- THIS IS THE FIX ---
import ApplicationStatusComponent from '../components/citizen/ApplicationStatus'; 
import LoadingSpinner from '../components/common/LoadingSpinner'; 
import './ApplicationStatus.css';

const ApplicationStatus = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await appService.getMyApplications();
        setApplications(data);
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className="app-status-container">
      <h2>My Applications</h2>
      {loading && <LoadingSpinner />}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && <ApplicationStatusComponent applications={applications} />}
    </div>
  );
};

export default ApplicationStatus;