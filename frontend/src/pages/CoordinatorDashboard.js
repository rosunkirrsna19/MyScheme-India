import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import CoordinatorHome from '../components/coordinator/CoordinatorDashboard';
import PendingApplications from '../components/coordinator/PendingApplications';
import ApplicationReview from '../components/coordinator/ApplicationReview';
import AllApplications from '../components/coordinator/AllApplications';
import CoordinatorSchemeManagement from '../components/coordinator/CoordinatorSchemeManagement'; // --- IMPORT NEW COMPONENT ---
import './CoordinatorDashboard.css';

const CoordinatorDashboard = () => {
  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <ul>
          <li>
            <Link to="">Dashboard Home</Link>
          </li>
          <li>
            <Link to="pending">Pending Applications</Link>
          </li>
          <li>
            <Link to="all">Application History</Link>
          </li>
          {/* --- NEW LINK --- */}
          <li>
            <Link to="schemes">Scheme Management</Link>
          </li>
        </ul>
      </nav>
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<CoordinatorHome />} />
          <Route path="pending" element={<PendingApplications />} />
          <Route path="review/:id" element={<ApplicationReview />} />
          <Route path="all" element={<AllApplications />} />
          <Route path="schemes" element={<CoordinatorSchemeManagement />} /> {/* --- NEW ROUTE --- */}
        </Routes>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;