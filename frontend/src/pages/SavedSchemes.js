import React, { useState, useEffect } from 'react';
import * as userService from '../services/user';
import SavedScheme from '../components/citizen/SavedScheme';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Schemes.css'; // Re-use styles

const SavedSchemes = () => {
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const data = await userService.getSavedSchemes();
      // data is an array of SavedScheme objects
      setSavedSchemes(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Function to remove a scheme from the state ---
  const handleRemoveScheme = (savedSchemeId) => {
    setSavedSchemes(prevSchemes => 
      prevSchemes.filter(s => s._id !== savedSchemeId)
    );
  };
  
  return (
    <div className="schemes-container">
      <h1>My Saved Schemes</h1>
      {loading && <LoadingSpinner />}
      {error && <p className="schemes-error">Error: {error}</p>}
      {!loading && !error && (
        <SavedScheme 
          savedSchemes={savedSchemes} 
          onRemove={handleRemoveScheme} // <-- Pass the function down
        />
      )}
    </div>
  );
};

export default SavedSchemes;