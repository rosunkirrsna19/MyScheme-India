import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import * as userService from '../services/user';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Profile.css';

const Profile = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', age: '', state: '',
    gender: '', occupation: '', annualIncome: '', casteCategory: '',
    isDisabed: false, isBPL: false, educationLevel: 0,
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: '', newPassword: '', confirmNewPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user && user.profile) {
      setFormData({
        firstName: user.profile.firstName || '',
        lastName: user.profile.lastName || '',
        age: user.profile.age || '',
        state: user.profile.state || '',
        gender: user.profile.gender || '',
        occupation: user.profile.occupation || '',
        annualIncome: user.profile.annualIncome || '',
        casteCategory: user.profile.casteCategory || '',
        isDisabed: user.profile.isDisabed || false,
        isBPL: user.profile.isBPL || false,
        educationLevel: user.profile.educationLevel || 0,
      });
    }
  }, [user]);

  const onProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const onPasswordChange = (e) =>
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  
  const onProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage('');
    setProfileError('');
    try {
      await userService.updateMyProfile(formData);
      setProfileMessage('Profile updated successfully! You may need to refresh to see changes in the app.');
    } catch (err) {
      setProfileError(err.toString());
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage('');
    setPasswordError('');
    
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      setPasswordLoading(false);
      return;
    }
    
    try {
      const { oldPassword, newPassword } = passwordData;
      const data = await userService.changePassword({ oldPassword, newPassword });
      setPasswordMessage(data.msg);
      setPasswordData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <div className="profile-container">
      {/* --- Profile Form --- */}
      <form className="profile-form" onSubmit={onProfileSubmit}>
        <h2>My Profile</h2>
        <p>Keep your profile updated. This information is used for checking scheme eligibility.</p>
        
        {profileMessage && <div className="profile-message success">{profileMessage}</div>}
        {profileError && <div className="profile-message error">{profileError}</div>}
        
        <fieldset>
          <legend>Personal Information</legend>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={onProfileChange} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={onProfileChange} />
          </div>
          <div className="form-group">
            <label>Age *</label>
            <input type="number" name="age" value={formData.age} onChange={onProfileChange} required />
          </div>
          <div className="form-group">
            <label>Gender *</label>
            <select name="gender" value={formData.gender} onChange={onProfileChange} required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>State *</label>
            <input type="text" name="state" value={formData.state} onChange={onProfileChange} required placeholder="e.g., Tamil Nadu" />
          </div>
        </fieldset>

        <fieldset>
          <legend>Socio-Economic Information</legend>
          <div className="form-group">
            <label>Occupation</label>
            <select name="occupation" value={formData.occupation} onChange={onProfileChange}>
              <option value="">Select Occupation</option>
              <option value="Student">Student</option>
              <option value="Salaried">Salaried</option>
              <option value="Self-Employed">Self-Employed</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Annual Income (in Rs.)</label>
            <input type="number" name="annualIncome" value={formData.annualIncome} onChange={onProfileChange} placeholder="e.g., 500000" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select name="casteCategory" value={formData.casteCategory} onChange={onProfileChange}>
              <option value="">Select Category</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {/* --- NEW FIELDS --- */}
          <div className="form-group">
            <label>Highest Education Level</label>
            <select name="educationLevel" value={formData.educationLevel} onChange={onProfileChange}>
              <option value="0">Not Applicable</option>
              <option value="1">Below 10th</option>
              <option value="2">10th Pass</option>
              <option value="3">12th Pass</option>
              <option value="4">Graduate</option>
              <option value="5">Post-Graduate</option>
            </select>
          </div>
          <div className="form-group checkbox-group">
            <label>Are you a person with a disability?</label>
            <input type="checkbox" name="isDisabed" checked={formData.isDisabed} onChange={onProfileChange} />
          </div>
          <div className="form-group checkbox-group">
            <label>Do you belong to the BPL category?</label>
            <input type="checkbox" name="isBPL" checked={formData.isBPL} onChange={onProfileChange} />
          </div>
        </fieldset>

        <button type="submit" className="profile-button" disabled={profileLoading}>
          {profileLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      {/* --- Change Password Form (No changes) --- */}
      <form className="profile-form password-form" onSubmit={onPasswordSubmit}>
        <h2>Change Password</h2>
        
        {passwordMessage && <div className="profile-message success">{passwordMessage}</div>}
        {passwordError && <div className="profile-message error">{passwordError}</div>}
        
        <fieldset>
          <div className="form-group">
            <label htmlFor="oldPassword">Old Password *</label>
            <input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={onPasswordChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password *</label>
            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={onPasswordChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="confirmNewPassword">Confirm New Password *</label>
            <input type="password" name="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={onPasswordChange} required />
          </div>
        </fieldset>

        <button type="submit" className="profile-button" disabled={passwordLoading}>
          {passwordLoading ? 'Saving...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default Profile;