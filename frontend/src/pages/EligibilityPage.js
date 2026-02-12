import React, { useState, useContext } from 'react'; // 'useEffect' was removed
import { Link } from 'react-router-dom';
import * as schemeService from '../services/schemes';
import AuthContext from '../context/AuthContext'; // We need this for the 'user'
import LoadingSpinner from '../components/common/LoadingSpinner';
import SchemeList from '../components/citizen/SchemeList';
import './EligibilityPage.css';

const EligibilityPage = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasChecked, setHasChecked] = useState(false);
  const { user } = useContext(AuthContext); // Get the user from context

  const handleCheckEligibility = async () => {
    setLoading(true);
    setError('');
    setHasChecked(true);
    try {
      const data = await schemeService.getEligibleSchemes();
      setSchemes(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  // Check if the user's profile is complete
  const isProfileComplete = user?.profile?.age && user?.profile?.state && user?.profile?.gender;

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <div className="eligibility-error">
          <p><strong>Error:</strong> {error}</p>
          <p>Please make sure your profile is complete with your Age, State, and Gender.</p>
          <Link to="/profile" className="btn-primary">
            Update My Profile
          </Link>
        </div>
      );
    }

    if (!hasChecked) {
      return (
        <div className="eligibility-prompt">
          <p>Click the button to find schemes that match your profile.</p>
          <button
            onClick={handleCheckEligibility}
            className="btn-primary"
            disabled={!isProfileComplete}
          >
            Find My Schemes
          </button>
          {!isProfileComplete && (
            <p className="profile-warning">
              You must <Link to="/profile">complete your profile</Link> (Age, State, Gender) to check eligibility.
            </p>
          )}
        </div>
      );
    }

    // Pass the full array (which includes matchPercentage) to SchemeList
    if (schemes.length > 0) {
      return <SchemeList schemes={schemes} />;
    } else {
      return <p>No schemes found matching your profile. You can still browse all schemes.</p>;
    }
  };

  return (
    <div className="eligibility-container">
      <header className="eligibility-header">
        <h1>Check My Eligibility</h1>
      </header>
      <div className="eligibility-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default EligibilityPage;