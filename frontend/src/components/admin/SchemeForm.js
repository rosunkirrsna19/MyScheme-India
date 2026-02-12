import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as adminService from '../../services/admin';
import * as schemeService from '../../services/schemes';
import LoadingSpinner from '../common/LoadingSpinner';
import './SchemeForm.css';

const initialState = {
  title: '',
  description: '',
  department: '',
  schemeType: 'Government',
  officialLink: '',
  assignedTo: '', // <-- NEW FIELD
  eligibility: {
    ageMin: '',
    ageMax: '',
    state: '',
    gender: '',
    annualIncomeMax: '',
    casteCategory: '',
    occupation: '',
    requiresDisability: false,
    requiresBPL: false,
    educationLevelMin: 0,
  },
  benefits: [],
  howToApply: '',
  formFields: [],
};

const createNewField = () => ({
  label: '',
  fieldType: 'text',
  options: [],
  required: true,
});

const SchemeForm = () => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [benefitsString, setBenefitsString] = useState('');
  
  // --- NEW: State for coordinators dropdown ---
  const [coordinators, setCoordinators] = useState([]);
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // --- NEW: Fetch coordinators for the dropdown ---
    const fetchCoordinators = async () => {
      try {
        const data = await adminService.getCoordinators();
        setCoordinators(data);
      } catch (err) {
        console.error('Failed to fetch coordinators', err);
      }
    };
    
    fetchCoordinators();

    if (id) {
      setFormLoading(true);
      schemeService.getSchemeById(id)
        .then(data => {
          setFormData(prev => ({ ...prev, ...data, eligibility: { ...prev.eligibility, ...data.eligibility } }));
          setBenefitsString(data.benefits.join(', '));
        })
        .catch(err => setError(err.toString()))
        .finally(() => setFormLoading(false));
    } else {
      setFormData(initialState);
      setBenefitsString('');
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEligibilityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      eligibility: {
        ...formData.eligibility,
        [name]: type === 'checkbox' ? checked : value,
      },
    });
  };

  // ... (All other handlers: handleAddFormField, handleRemoveFormField, etc. remain exactly the same) ...
  const handleAddFormField = () => {
    setFormData(prev => ({
      ...prev,
      formFields: [...prev.formFields, createNewField()]
    }));
  };

  const handleRemoveFormField = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      formFields: prev.formFields.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleFormFieldChange = (index, event) => {
    const { name, value, type, checked } = event.target;
    const newFormFields = [...formData.formFields];
    const fieldToUpdate = { ...newFormFields[index] };

    if (type === 'checkbox') {
      fieldToUpdate[name] = checked;
    } else {
      fieldToUpdate[name] = value;
    }
    
    if (name === 'fieldType' && value !== 'select') {
      fieldToUpdate.options = [];
    }
    
    newFormFields[index] = fieldToUpdate;
    setFormData(prev => ({ ...prev, formFields: newFormFields }));
  };
  
  const handleFieldOptionsChange = (index, value) => {
    const newFormFields = [...formData.formFields];
    newFormFields[index].options = value.split(',').map(opt => opt.trim());
    setFormData(prev => ({ ...prev, formFields: newFormFields }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const finalData = {
      ...formData,
      benefits: benefitsString.split(',').map(s => s.trim()).filter(Boolean),
    };
    
    // --- Ensure unassigned is 'null' not '' ---
    if (finalData.schemeType === 'Government' || !finalData.assignedTo) {
      finalData.assignedTo = null;
    }

    try {
      if (id) {
        await adminService.updateScheme(id, finalData);
      } else {
        await adminService.createScheme(finalData);
      }
      navigate('/admin-dashboard/schemes');
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  if (formLoading) return <LoadingSpinner />;

  return (
    <div className="scheme-form-container">
      <h2>{id ? 'Edit Scheme' : 'Create New Scheme'}</h2>
      {error && <p className="dashboard-error">{error}</p>}
      
      <form onSubmit={handleSubmit} className="scheme-form">
        
        <fieldset>
          <legend>Basic Information</legend>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea name="description" rows="4" value={formData.description} onChange={handleChange} required />
          </div>
          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="schemeType">Scheme Type *</label>
              <select name="schemeType" value={formData.schemeType} onChange={handleChange}>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
              </select>
            </div>
          </div>
          {formData.schemeType === 'Government' && (
            <div className="form-group">
              <label htmlFor="officialLink">Official Link (for Govt. Schemes)</label>
              <input type="text" name="officialLink" value={formData.officialLink} onChange={handleChange} />
            </div>
          )}
          
          {/* --- NEW: Assign Coordinator Dropdown --- */}
          {formData.schemeType === 'Private' && (
             <div className="form-group">
              <label htmlFor="assignedTo">Assign to Coordinator (for Private schemes)</label>
              <select name="assignedTo" value={formData.assignedTo || ''} onChange={handleChange}>
                <option value="">-- Unassigned --</option>
                {coordinators.map(coord => (
                  <option key={coord._id} value={coord._id}>
                    {coord.username} ({coord.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend>Eligibility Criteria</legend>
          <p className="fieldset-desc">Set the rules for who is eligible. This is used by the "Check Eligibility" feature.</p>
          <div className="form-group-inline">
            <div className="form-group">
              <label>Min Age</label>
              <input type="number" name="ageMin" value={formData.eligibility.ageMin} onChange={handleEligibilityChange} />
            </div>
            <div className="form-group">
              <label>Max Age</label>
              <input type="number" name="ageMax" value={formData.eligibility.ageMax} onChange={handleEligibilityChange} />
            </div>
            <div className="form-group">
              <label>Max Annual Income</label>
              <input type="number" name="annualIncomeMax" value={formData.eligibility.annualIncomeMax} onChange={handleEligibilityChange} />
            </div>
          </div>
          <div className="form-group-inline">
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.eligibility.gender} onChange={handleEligibilityChange}>
                <option value="">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="casteCategory" value={formData.eligibility.casteCategory} onChange={handleEligibilityChange}>
                <option value="">Any</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Occupation</label>
              <select name="occupation" value={formData.eligibility.occupation} onChange={handleEligibilityChange}>
                <option value="">Any</option>
                <option value="Student">Student</option>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Minimum Education</label>
            <select name="educationLevelMin" value={formData.eligibility.educationLevelMin} onChange={handleEligibilityChange}>
              <option value="0">No Requirement</option>
              <option value="1">Below 10th</option>
              <option value="2">10th Pass</option>
              <option value="3">12th Pass</option>
              <option value="4">Graduate</option>
              <option value="5">Post-Graduate</option>
            </select>
          </div>
          <div className="form-group-inline checkbox-group-admin">
            <label className="field-required-label">
              <input
                type="checkbox"
                name="requiresDisability"
                checked={formData.eligibility.requiresDisability}
                onChange={handleEligibilityChange}
              />
              Must be Disabled?
            </label>
            <label className="field-required-label">
              <input
                type="checkbox"
                name="requiresBPL"
                checked={formData.eligibility.requiresBPL}
                onChange={handleEligibilityChange}
              />
              Must be BPL?
            </label>
          </div>
        </fieldset>
        
        {formData.schemeType === 'Private' && (
          <fieldset>
            <legend>Application Form Builder</legend>
            <p className="fieldset-desc">Build the form that citizens will fill out when they apply for this scheme. This is for **Private Schemes** only.</p>
            
            <div className="form-builder-list">
              {formData.formFields.map((field, index) => (
                <div key={index} className="form-field-builder">
                  <div className="form-group">
                    <label>Field Label</label>
                    <input
                      type="text"
                      name="label"
                      value={field.label}
                      onChange={(e) => handleFormFieldChange(index, e)}
                      placeholder="e.g., Full Name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Field Type</label>
                    <select
                      name="fieldType"
                      value={field.fieldType}
                      onChange={(e) => handleFormFieldChange(index, e)}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Dropdown (Select)</option>
                      <option value="file">File Upload</option>
                    </select>
                  </div>
                  
                  {field.fieldType === 'select' && (
                    <div className="form-group">
                      <label>Options (comma-separated)</label>
                      <input
                        type="text"
                        name="options"
                        value={field.options.join(', ')}
                        onChange={(e) => handleFieldOptionsChange(index, e.target.value)}
                        placeholder="e.g., Yes, No, Maybe"
                      />
                    </div>
                  )}
                  
                  <div className="field-actions">
                    <label className="field-required-label">
                      <input
                        type="checkbox"
                        name="required"
                        checked={field.required}
                        onChange={(e) => handleFormFieldChange(index, e)}
                      />
                      Required
                    </label>
                    <button type="button" onClick={() => handleRemoveFormField(index)} className="btn-remove-field">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button type="button" onClick={handleAddFormField} className="btn-add-field">
              + Add Field
            </button>
          </fieldset>
        )}

        <fieldset>
          <legend>Other Details</legend>
          <div className="form-group">
            <label>Benefits (comma-separated)</label>
            <textarea name="benefits" rows="3" value={benefitsString} onChange={(e) => setBenefitsString(e.target.value)} />
          </div>
          <div className="form-group">
            <label>How to Apply</label>
            <textarea name="howToApply" rows="3" value={formData.howToApply} onChange={handleChange} />
          </div>
        </fieldset>
        
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Saving...' : (id ? 'Update Scheme' : 'Create Scheme')}
        </button>
      </form>
    </div>
  );
};

export default SchemeForm;