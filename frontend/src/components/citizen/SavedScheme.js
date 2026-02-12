import React from 'react';
import SchemeList from './SchemeList';
import './SavedScheme.css';

// --- UPDATED: Pass 'onRemove' prop ---
const SavedScheme = ({ savedSchemes, onRemove }) => {
  if (savedSchemes.length === 0) {
    return <p>You have not saved any schemes yet.</p>;
  }
  
  // 'savedSchemes' is the full array of SavedScheme objects
  // Each object looks like: { _id: '...', user: '...', scheme: {...} }
  return <SchemeList schemes={savedSchemes} onRemove={onRemove} />;
};

export default SavedScheme;