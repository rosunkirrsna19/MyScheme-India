import api from './api';

// --- UPDATED FUNCTION ---
// This function now takes a complete FormData object
export const submitApplication = async (formData) => {
  try {
    // When sending FormData, we must NOT set the 'Content-Type' header.
    // Axios and the browser will set it automatically to 'multipart/form-data'.
    const { data } = await api.post('/applications', formData, {
      headers: {
        'Content-Type': undefined, // Let the browser set the boundary
      },
    });
    return data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.msg) {
      throw new Error(error.response.data.msg);
    } else {
      throw new Error('Application submission failed. Please try again.');
    }
  }
};
// --- END OF UPDATE ---

// Get all applications for the logged-in user
export const getMyApplications = async () => {
  try {
    const { data } = await api.get('/applications/my');
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch applications';
  }
};