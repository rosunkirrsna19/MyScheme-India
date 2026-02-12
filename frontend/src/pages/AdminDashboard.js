import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import AdminHome from '../components/admin/ApplicationStats'; // This is the dashboard home
import UserManagement from '../components/admin/UserManagement';
import SchemeManagement from '../components/admin/SchemeManagement';
import SchemeForm from '../components/admin/SchemeForm';
import './CoordinatorDashboard.css'; // Re-using the same dashboard layout CSS

const AdminDashboard = () => {
  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <ul>
          <li>
            <Link to="">Dashboard Home</Link>
          </li>
          <li>
            <Link to="users">User Management</Link>
          </li>
          <li>
            <Link to="schemes">Scheme Management</Link>
          </li>
          <li>
            <Link to="schemes/new">Create New Scheme</Link>
          </li>
        </ul>
      </nav>
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="schemes" element={<SchemeManagement />} />
          <Route path="schemes/new" element={<SchemeForm />} />
          <Route path="schemes/edit/:id" element={<SchemeForm />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;