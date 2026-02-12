import api from './api';

// --- Dashboard ---
export const getAdminStats = async () => {
  try {
    const { data } = await api.get('/admin/dashboard');
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch admin stats';
  }
};

export const getApplicationStatusStats = async () => {
  try {
    const { data } = await api.get('/admin/stats/application-status');
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch application stats';
  }
};

export const getSchemeDepartmentStats = async () => {
  try {
    const { data } = await api.get('/admin/stats/scheme-department');
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch scheme stats';
  }
};

// --- User Management ---
export const getAllUsers = async () => {
  try {
    const { data } = await api.get('/admin/users');
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch users';
  }
};

// --- NEW FUNCTION ---
export const getCoordinators = async () => {
  try {
    const { data } = await api.get('/admin/coordinators');
    return data; // Returns array of { _id, username, email }
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch coordinators';
  }
};
// --- END NEW FUNCTION ---

export const updateUserRole = async (userId, role) => {
  try {
    const { data } = await api.put(`/admin/users/${userId}`, { role });
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to update user role';
  }
};

export const deleteUser = async (userId) => {
  try {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to delete user';
  }
};

// --- Scheme Management ---
export const createScheme = async (schemeData) => {
  try {
    const { data } = await api.post('/schemes', schemeData);
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to create scheme';
  }
};

export const updateScheme = async (schemeId, schemeData) => {
  try {
    const { data } = await api.put(`/schemes/${schemeId}`, schemeData);
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to update scheme';
  }
};

export const deleteScheme = async (schemeId) => {
  try {
    const { data } = await api.delete(`/schemes/${schemeId}`);
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to delete scheme';
  }
};