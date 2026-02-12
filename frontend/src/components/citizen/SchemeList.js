import React from 'react';
import SchemeCard from './SchemeCard';
import './SchemeList.css';

const SchemeList = (props) => {
  // schemes can be an array of Scheme objects OR SavedScheme objects
  const { schemes, onRemove } = props;
  
  if (!schemes || schemes.length === 0) {
    return <p>No schemes found.</p>;
  }

  return (
    <div className="schemes-list">
      {schemes.map((data) => {
        // This logic handles data from "All Schemes", "Saved Schemes", & "Eligibility"
        
        // Is it a SavedScheme object? (which has a 'scheme' property)
        if (data.scheme) {
          const savedSchemeId = data._id;
          const scheme = data.scheme;
          return (
            <SchemeCard 
              key={scheme._id} 
              scheme={scheme}
              savedSchemeId={savedSchemeId}
              onRemove={onRemove}
            />
          );
        }
        
        // Is it an Eligibility object? (which has a 'matchPercentage' property)
        if (data.matchPercentage !== undefined) {
           return (
            <SchemeCard 
              key={data._id} 
              scheme={data} // Pass the whole object (which includes scheme data + match%)
              matchPercentage={data.matchPercentage} // Pass the percentage as a prop
            />
          );
        }

        // It's just a plain Scheme object
        return (
          <SchemeCard 
            key={data._id} 
            scheme={data}
          />
        );
      })}
    </div>
  );
};

export default SchemeList;