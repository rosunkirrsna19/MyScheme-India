import api from './api';

export const register = async (userData) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    return data;
  } catch (error) {
    throw new Error(error.response.data.msg || error.response.data.errors[0].msg || 'Registration failed');
  }
};

export const login = async (userData) => {
  try {
    const { data } = await api.post('/auth/login', userData);
    return data;
  } catch (error) {
    // --- THIS IS THE FIX ---
    // Make sure to throw a real Error object
    throw new Error(error.response.data.msg || 'Login failed');
  }
};