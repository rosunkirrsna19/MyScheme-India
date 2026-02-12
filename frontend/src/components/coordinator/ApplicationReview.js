import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as coordService from '../../services/coordinator';
import LoadingSpinner from '../common/LoadingSpinner';
import './ApplicationReview.css';

const ApplicationReview = () => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApp = async () => {
      try {
        setLoading(true);
        const data = await coordService.getApplicationById(id);
        setApplication(data);
        if (data.status !== 'Pending' && data.status !== 'More Info Required') {
          setMessage(`This application was already ${data.status.toLowerCase()}.`);
          setNotes(data.coordinatorNotes || '');
        }
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const handleSubmit = async (status) => {
    if ((status === 'Rejected' || status === 'More Info Required') && !notes) {
      setError('Notes are required to reject or request more info.');
      return;
    }
    
    setActionLoading(true);
    setError('');
    try {
      await coordService.updateApplicationStatus(id, status, notes);
      setMessage(`Application successfully ${status.toLowerCase()}!`);
      if (application.status === 'Pending') {
        navigate('/coordinator-dashboard/pending');
      } else {
        navigate('/coordinator-dashboard/all');
      }
    } catch (err) {
      setError(err.toString());
    } finally {
      setActionLoading(false);
    }
  };
  
  const renderSubmittedData = () => {
    const entries = Object.entries(application.formData);
    
    return (
      <ul className="submitted-data-list">
        {entries.map(([label, value]) => {
          if (typeof value === 'string' && value.startsWith('/uploads/')) {
            return (
              <li key={label}>
                <strong>{label}:</strong>
                <a href={`http://localhost:5001${value}`} target="_blank" rel="noopener noreferrer">
                  View Uploaded File
                </a>
              </li>
            );
          }
          return (
            <li key={label}>
              <strong>{label}:</strong> {value.toString()}
            </li>
          );
        })}
      </ul>
    );
  };
  
  if (loading) return <LoadingSpinner />;
  if (error) return <p className="dashboard-error">Error: {error}</p>;
  if (!application) return <p>Application not found.</p>;

  // --- THIS LINE IS UPDATED --- (formData removed)
  const { citizen, scheme, status, documents } = application;
  const canTakeAction = (status === 'Pending' || status === 'More Info Required');

  return (
    <div className="review-container">
      <h2>Review Application: {scheme.title}</h2>
      
      {message && <div className="review-message success">{message}</div>}
      
      <div className="review-grid">
        <div className="applicant-details">
          <h3>Applicant Details</h3>
          <p><strong>Username:</strong> {citizen.username}</p>
          <p><strong>Email:</strong> {citizen.email}</p>
          <p><strong>Age:</strong> {citizen.profile.age || 'N/A'}</p>
          <p><strong>State:</strong> {citizen.profile.state || 'N/A'}</p>
          <p><strong>Occupation:</strong> {citizen.profile.occupation || 'N/A'}</p>
          <p><strong>Income:</strong> Rs. {citizen.profile.annualIncome || 'N/A'}</p>
        </div>
        
        <div className="application-data">
          <h3>Submitted Application Form</h3>
          {renderSubmittedData()}
        </div>
      </div>

      <div className="document-list">
        <h3>Legacy Documents (if any)</h3>
        {documents && documents.length > 0 ? (
          <ul>
            {documents.map((docPath, index) => (
              <li key={index}>
                <a href={`http://localhost:5001${docPath}`} target="_blank" rel="noopener noreferrer">
                  Document {index + 1}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No legacy documents were uploaded.</p>
        )}
      </div>

      <div className="review-action-box">
        <h3>Coordinator Action</h3>
        {error && <div className="message error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="notes">Notes (Required for "Reject" or "Request More Info")</label>
          <textarea
            id="notes"
            rows="4"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Provide feedback to the citizen..."
            disabled={!canTakeAction}
          ></textarea>
        </div>
        
        {canTakeAction ? (
          <div className="action-buttons">
            <button
              className="btn-approve"
              onClick={() => handleSubmit('Approved')}
              disabled={actionLoading}
            >
              {actionLoading ? '...' : 'Approve'}
            </button>
            <button
              className="btn-reject"
              onClick={() => handleSubmit('Rejected')}
              disabled={actionLoading || !notes} 
            >
              {actionLoading ? '...' : 'Reject'}
            </button>
            <button
              className="btn-request-info"
              onClick={() => handleSubmit('More Info Required')}
              disabled={actionLoading || !notes} 
            >
              {actionLoading ? '...' : 'Request More Info'}
            </button>
          </div>
        ) : (
          <p><strong>This application has already been reviewed and {status.toLowerCase()}.</strong></p>
        )}
      </div>
    </div>
  );
};

export default ApplicationReview;