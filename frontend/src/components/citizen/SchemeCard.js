import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import * as userService from '../../services/user';
import AuthContext from '../../context/AuthContext';
import './SchemeCard.css';

const SchemeCard = ({ scheme, savedSchemeId, onRemove, matchPercentage }) => {
  const { _id, title, description, department, schemeType } = scheme;
  const { user } = useContext(AuthContext);
  const [isSaving, setIsSaving] = useState(false);

  const truncateDescription = (text, length) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please log in to save schemes.');
      return;
    }
    setIsSaving(true);
    try {
      await userService.saveScheme(_id);
      alert('Scheme saved!');
    } catch (err) {
      alert('Error saving scheme: ' + err.toString());
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsave = async () => {
    if (!savedSchemeId) return;
    setIsSaving(true);
    try {
      await userService.removeSavedScheme(savedSchemeId);
      if (onRemove) {
        onRemove(savedSchemeId); 
      }
    } catch (err) {
      alert('Error removing scheme: ' + err.toString());
    } finally {
      setIsSaving(false);
    }
  };

  const renderSaveButton = () => {
    if (!user || user.role !== 'Citizen') {
      return null; 
    }

    if (savedSchemeId) {
      return (
        <button onClick={handleUnsave} className="card-btn-save unsave" disabled={isSaving}>
          {isSaving ? '...' : 'Unsave'}
        </button>
      );
    } else {
      return (
        <button onClick={handleSave} className="card-btn-save save" disabled={isSaving}>
          {isSaving ? '...' : 'Save'}
        </button>
      );
    }
  };

  const getMatchColor = (percent) => {
    if (percent === 100) return 'match-100';
    if (percent >= 70) return 'match-70';
    if (percent >= 40) return 'match-40';
    return 'match-0';
  }

  return (
    <div className="scheme-card">
      <div className="card-header">
        
        {/* --- THIS IS THE FIX --- */}
        {/* We now show both badges. A new container will stack them. */}
        <div className="card-badges">
          <span className={`card-badge ${schemeType.toLowerCase()}`}>
            {schemeType}
          </span>
          {matchPercentage !== undefined && (
            <span className={`card-badge match ${getMatchColor(matchPercentage)}`}>
              {matchPercentage}% Match
            </span>
          )}
        </div>
        {/* --- END OF FIX --- */}
        
        <h3 className="card-title">{title}</h3>
        <p className="card-department">{department}</p>
      </div>
      <div className="card-body">
        <p className="card-description">{truncateDescription(description, 100)}</p>
      </div>
      <div className="card-footer">
        {renderSaveButton()} 
        <Link to={`/schemes/${_id}`} className="card-link">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default SchemeCard;