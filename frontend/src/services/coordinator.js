import api from './api';

// Get stats for the coordinator dashboard
export const getCoordinatorStats = async () => {
  try {
    const { data } = await api.get('/coordinator/dashboard');
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch dashboard stats';
  }
};

// Get all pending applications
export const getPendingApplications = async () => {
  try {
    const { data } = await api.get('/coordinator/applications/pending');
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch pending applications';
  }
};

// Get all applications (pending, approved, rejected) with search
export const getAllApplications = async (searchQuery) => {
  try {
    const { data } = await api.get('/coordinator/applications/all', {
      params: {
        search: searchQuery || undefined, 
      },
    });
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch all applications';
  }
};

// Get a single application by its ID
export const getApplicationById = async (id) => {
  try {
    const { data } = await api.get(`/coordinator/applications/${id}`);
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch application details';
  }
};

// Update an application's status (approve/reject)
// --- THIS LINE IS FIXED (removed the '.') ---
export const updateApplicationStatus = async (id, status, coordinatorNotes) => {
  try {
    const { data } = await api.put(`/coordinator/applications/${id}`, {
      status,
      coordinatorNotes,
    });
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to update application status';
  }
};