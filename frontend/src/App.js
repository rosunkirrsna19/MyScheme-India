import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import FloatingSupportButton from './components/common/FloatingSupportButton';

// Page Imports
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Schemes from './pages/Schemes';
import SchemeDetails from './pages/SchemeDetails';
import SavedSchemes from './pages/SavedSchemes';
import AdminDashboard from './pages/AdminDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import ApplicationStatus from './pages/ApplicationStatus';
import ProtectedRoute from './components/common/ProtectedRoute';
import EligibilityPage from './pages/EligibilityPage';
import NotFound from './pages/NotFound'; // <-- 1. IMPORT THE NEW PAGE

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <main className="container">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/schemes/:id" element={<SchemeDetails />} />

            {/* Citizen Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={['Citizen', 'Admin', 'Coordinator']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved-schemes"
              element={
                <ProtectedRoute roles={['Citizen']}>
                  <SavedSchemes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-applications"
              element={
                <ProtectedRoute roles={['Citizen']}>
                  <ApplicationStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/check-eligibility"
              element={
                <ProtectedRoute roles={['Citizen']}>
                  <EligibilityPage />
                </ProtectedRoute>
              }
            />

            {/* Coordinator Route */}
            <Route
              path="/coordinator-dashboard/*"
              element={
                <ProtectedRoute roles={['Coordinator']}>
                  <CoordinatorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Route */}
            <Route
              path="/admin-dashboard/*"
              element={
                <ProtectedRoute roles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* --- 2. ADD THE CATCH-ALL ROUTE AT THE END --- */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </main>
        <Footer />
        <FloatingSupportButton />
      </div>
    </AuthProvider>
  );
}

export default App;