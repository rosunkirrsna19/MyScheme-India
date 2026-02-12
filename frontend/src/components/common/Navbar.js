import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const renderAuthLinks = () => {
    if (user) {
      return (
        <>
          {user.role === 'Citizen' && (
            <li>
              <NotificationBell />
            </li>
          )}
          <li>
            <span className="navbar-user">Hello, {user.username || user.email}</span>
          </li>
          <li>
            <button onClick={onLogout} className="nav-btn">
              Logout
            </button>
          </li>
        </>
      );
    } else {
      return (
        <>
          <li>
            <Link to="/login" className="nav-link">
              Login
            </Link>
          </li>
          <li>
            <Link to="/register" className="nav-link nav-btn-register">
              Register
            </Link>
          </li>
        </>
      );
    }
  };

  const renderRoleLinks = () => {
    let links = [];

    links.push(
      <li key="home">
        <Link to="/" className="nav-link">
          Home
        </Link>
      </li>
    );
    links.push(
      <li key="schemes">
        <Link to="/schemes" className="nav-link">
          All Schemes
        </Link>
      </li>
    );

    if (!user) return links; 

    switch (user.role) {
      case 'Admin':
        links.push(
          <li key="admin">
            <Link to="/admin-dashboard" className="nav-link">
              Admin Dashboard
            </Link>
          </li>
        );
        break;
      case 'Coordinator':
        links.push(
          <li key="coord">
            <Link to="/coordinator-dashboard" className="nav-link">
              Coordinator Dashboard
            </Link>
          </li>
        );
        break;
      case 'Citizen':
      default:
        links.push(
          <li key="eligibility">
            <Link to="/check-eligibility" className="nav-link">
              Check Eligibility
            </Link>
          </li>
        );
        links.push(
          <li key="apps">
            <Link to="/my-applications" className="nav-link">
              My Applications
            </Link>
          </li>
        );
        links.push(
          <li key="saved">
            <Link to="/saved-schemes" className="nav-link">
              Saved Schemes
            </Link>
          </li>
        );
        links.push(
          <li key="profile">
            <Link to="/profile" className="nav-link">
              My Profile
            </Link>
          </li>
        );
        break;
    }
    return links;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* --- THIS IS THE FIX --- */}
        <div className="navbar-left-group">
          <Link to="/" className="navbar-logo">
            MyScheme
          </Link>
          <ul className="nav-menu-left">{renderRoleLinks()}</ul>
        </div>
        {/* --- END OF FIX --- */}
        
        <ul className="nav-menu-right">{renderAuthLinks()}</ul>
      </div>
    </nav>
  );
};

export default Navbar;