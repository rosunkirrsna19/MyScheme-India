import api from './api';

// Get the logged-in user's profile
export const getMyProfile = async () => {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch profile';
  }
};

// Update the logged-in user's profile
export const updateMyProfile = async (profileData) => {
  try {
    const { data } = await api.put('/users/profile', profileData);
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to update profile';
  }
};

// --- NEW FUNCTION ---
export const changePassword = async (passwordData) => {
  try {
    const { data } = await api.put('/users/change-password', passwordData);
    return data; // Will return { msg: 'Password updated successfully' }
  } catch (error) {
    // Throw the specific error message from the backend
    throw new Error(error.response.data.msg || 'Password change failed');
  }
};
// --- END NEW FUNCTION ---

// Get user's saved schemes
export const getSavedSchemes = async () => {
  try {
    const { data } = await api.get('/users/saved-schemes');
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch saved schemes';
  }
};

// Save a scheme
export const saveScheme = async (schemeId) => {
  try {
    const { data } = await api.post('/users/save-scheme', { schemeId });
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to save scheme';
  }
};

// Remove a saved scheme
export const removeSavedScheme = async (savedSchemeId) => {
  try {
    const { data } = await api.delete(`/users/saved-schemes/${savedSchemeId}`);
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to remove scheme';
  }
};