import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as schemeService from '../services/schemes';
import * as appService from '../services/applications';
import AuthContext from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './SchemeDetails.css';

const SchemeDetails = () => {
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  
  // --- NEW: State for the dynamic form ---
  const [formData, setFormData] = useState({}); // Stores text/select answers
  const [fileData, setFileData] = useState({}); // Stores file answers
  
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchemeAndStatus = async () => {
      try {
        setLoading(true);
        const schemeData = await schemeService.getSchemeById(id);
        setScheme(schemeData);

        // Initialize form data state
        const initialFormData = {};
        if (schemeData.formFields) {
          schemeData.formFields.forEach(field => {
            if (field.fieldType !== 'file') {
              initialFormData[field.label] = '';
            }
          });
        }
        setFormData(initialFormData);

        if (user) {
          const myApps = await appService.getMyApplications();
          const app = myApps.find(a => a.scheme._id === id);
          if (app) {
            setExistingApplication(app);
            if(app.status === 'More Info Required') {
              setError(`Coordinator's Notes: ${app.coordinatorNotes}. Please re-upload documents and submit again.`);
            }
          }
        }
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };
    fetchSchemeAndStatus();
  }, [id, user]);

  // --- NEW: Handlers for the dynamic form ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFileData(prev => ({ ...prev, [name]: files[0] }));
  };

  // --- UPDATED: handleApply now builds FormData dynamically ---
  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setApplyLoading(true);
    setError('');
    setMessage('');

    try {
      // 1. Create the FormData object
      const submissionData = new FormData();
      submissionData.append('schemeId', scheme._id);

      // 2. Append all text/select answers as a single JSON string
      submissionData.append('formData', JSON.stringify(formData));

      // 3. Append all files, using the 'label' as the key
      for (const fieldLabel in fileData) {
        if (fileData[fieldLabel]) {
          submissionData.append(fieldLabel, fileData[fieldLabel]);
        }
      }

      // 4. Check for required fields
      for (const field of scheme.formFields) {
        if (field.required) {
          if (field.fieldType === 'file' && !fileData[field.label] && !existingApplication) {
            throw new Error(`Required file is missing: ${field.label}`);
          }
          if (field.fieldType !== 'file' && !formData[field.label]) {
            throw new Error(`Required field is missing: ${field.label}`);
          }
        }
      }

      // 5. Submit the application
      await appService.submitApplication(submissionData);
      setMessage('Application submitted successfully! Check "My Applications" for status.');
      setExistingApplication(null); // Clear status
      setFormData({}); // Clear form
      setFileData({}); // Clear files
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setApplyLoading(false); 
    }
  };

  // --- NEW: Dynamically renders the form based on scheme.formFields ---
  const renderDynamicForm = () => {
    if (!scheme.formFields || scheme.formFields.length === 0) {
      return <p>This scheme is not accepting applications at this time.</p>;
    }

    let buttonText = 'Submit Application';
    let isButtonDisabled = applyLoading;
    
    if (existingApplication) {
      if (existingApplication.status === 'More Info Required') {
        buttonText = 'Re-submit Application';
      } else {
        buttonText = `Status: ${existingApplication.status}`;
        isButtonDisabled = true;
      }
    }

    return (
      <div className="dynamic-apply-form">
        {scheme.formFields.map((field, index) => (
          <div className="form-group" key={index}>
            <label htmlFor={field.label}>
              {field.label} {field.required && '*'}
            </label>
            
            {field.fieldType === 'text' && (
              <input
                type="text"
                id={field.label}
                name={field.label}
                value={formData[field.label] || ''}
                onChange={handleFormChange}
                required={field.required}
                disabled={isButtonDisabled}
              />
            )}
            
            {field.fieldType === 'number' && (
              <input
                type="number"
                id={field.label}
                name={field.label}
                value={formData[field.label] || ''}
                onChange={handleFormChange}
                required={field.required}
                disabled={isButtonDisabled}
              />
            )}
            
            {field.fieldType === 'select' && (
              <select
                id={field.label}
                name={field.label}
                value={formData[field.label] || ''}
                onChange={handleFormChange}
                required={field.required}
                disabled={isButtonDisabled}
              >
                <option value="">-- Select an option --</option>
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            
            {field.fieldType === 'file' && (
              <input
                type="file"
                id={field.label}
                name={field.label}
                onChange={handleFileChange}
                required={field.required}
                disabled={isButtonDisabled}
                className="file-input"
              />
            )}
          </div>
        ))}
        
        <button 
          onClick={handleApply} 
          className="btn-apply private" 
          disabled={isButtonDisabled}
        >
          {applyLoading ? 'Submitting...' : buttonText}
        </button>
      </div>
    );
  };

  const renderApplySection = () => {
    if (scheme.schemeType === 'Government') {
      return (
        <a href={scheme.officialLink} target="_blank" rel="noopener noreferrer" className="btn-apply government">
          Apply on Official Website
        </a>
      );
    }
    
    if (!user) {
      return (
        <button onClick={() => navigate('/login')} className="btn-apply private">
          Login to Apply
        </button>
      );
    }

    if (user.role !== 'Citizen') {
      return null;
    }

    return renderDynamicForm();
  };

  if (loading) return <LoadingSpinner />;
  if (!scheme) return <p>Scheme not found.</p>;

  return (
    <div className="scheme-details-container">
      <header className="scheme-header">
        <h1>{scheme.title}</h1>
        <p className="department">Department: {scheme.department}</p>
        <span className={`badge ${scheme.schemeType?.toLowerCase()}`}>{scheme.schemeType}</span>
      </header>
      
      <div className="scheme-content">
        <div className="scheme-main">
          <h3>Description</h3>
          <p>{scheme.description}</p>
          <h3>Benefits</h3>
          <ul>
            {scheme.benefits?.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
          <h3>How to Apply</h3>
          <p>{scheme.howToApply || 'Fill out the application form.'}</p>
        </div>

        <aside className="scheme-sidebar">
          <div className="sidebar-card">
            <h3>Eligibility</h3>
            <ul>
              {scheme.eligibility?.ageMin && <li>Minimum Age: {scheme.eligibility.ageMin}</li>}
              {scheme.eligibility?.ageMax && <li>Maximum Age: {scheme.eligibility.ageMax}</li>}
              {scheme.eligibility?.state && <li>State: {scheme.eligibility.state}</li>}
              {scheme.eligibility?.gender && <li>Gender: {scheme.eligibility.gender}</li>}
              {scheme.eligibility?.annualIncomeMax && <li>Max Income: Rs. {scheme.eligibility.annualIncomeMax}</li>}
              {scheme.eligibility?.casteCategory && <li>Category: {scheme.eligibility.casteCategory}</li>}
            </ul>
          </div>
          
          <div className="apply-section">
            <h3>Apply Now</h3>
            {error && <div className="message error-message">{error}</div>}
            {message && <div className="message success-message">{message}</div>}
            {renderApplySection()}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SchemeDetails;