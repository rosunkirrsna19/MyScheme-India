import React, { useState } from 'react';
import './EligibilityChecker.css';

const EligibilityChecker = () => {
  const [age, setAge] = useState('');
  const [state, setState] = useState('');
  const [gender, setGender] = useState('');
  const [eligibleSchemes, setEligibleSchemes] = useState([]);

  const checkEligibility = () => {
    // In a real app, you would make an API call:
    // const data = await api.get(`/schemes/check?age=${age}&state=${state}`);
    
    // For this demo, we'll just show a message.
    if (age && state && gender) {
      setEligibleSchemes([
        { id: 1, title: 'Demo Scheme for your criteria' },
      ]);
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <div className="checker-container">
      <h3>Check Your Eligibility</h3>
      <div className="checker-form">
        <input 
          type="number" 
          placeholder="Your Age" 
          value={age} 
          onChange={(e) => setAge(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Your State" 
          value={state} 
          onChange={(e) => setState(e.target.value)} 
        />
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <button onClick={checkEligibility} className="btn-check">Check Now</button>
      </div>
      <div className="checker-results">
        {eligibleSchemes.length > 0 && <h4>Eligible Schemes:</h4>}
        <ul>
          {eligibleSchemes.map(scheme => (
            <li key={scheme.id}>{scheme.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EligibilityChecker;