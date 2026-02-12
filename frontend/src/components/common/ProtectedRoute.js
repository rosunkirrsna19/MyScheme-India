import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    // Show a loading spinner while auth state is being checked
    return <LoadingSpinner />;
  }

  if (!user) {
    // User is not logged in, redirect them to the login page
    // Save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // User is logged in but doesn't have the required role
    // Redirect them to the home page (or an 'Unauthorized' page)
    return <Navigate to="/" replace />;
  }

  // User is logged in and has the correct role, render the component
  return children;
};

export default ProtectedRoute;