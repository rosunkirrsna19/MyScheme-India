import React from 'react';
import { Link } from 'react-router-dom'; // We need Link for the button
import './ApplicationStatus.css'; // This is the local CSS

const ApplicationStatus = ({ applications }) => {
  if (applications.length === 0) {
    return <p>You have not submitted any private applications yet.</p>;
  }

  return (
    <table className="app-status-table">
      <thead>
        <tr>
          <th>Scheme</th>
          <th>Status</th>
          <th>Coordinator Notes</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {applications.map((app) => (
          <tr key={app._id}>
            <td>{app.scheme.title}</td>
            <td>
              <span className={`status-badge status-${app.status.toLowerCase().replace(' ', '-')}`}>
                {app.status}
              </span>
            </td>
            <td className="notes-cell">
              {app.coordinatorNotes || 'N/A'}
            </td>
            <td className="action-cell">
              {app.status === 'More Info Required' && (
                <Link 
                  to={`/schemes/${app.scheme._id}`} 
                  className="btn-resubmit"
                >
                  Re-submit
                </Link>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ApplicationStatus;