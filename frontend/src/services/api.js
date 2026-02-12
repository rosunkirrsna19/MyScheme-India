import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: 'http://localhost:5001/api', // <-- THIS IS THE FIX
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
  Add a response interceptor to handle token expiration
  or other authentication errors automatically.
*/
api.interceptors.response.use(
  (response) => response, // Directly return successful responses
  (error) => {
    if (error.response && error.response.status === 401) {
      // 401 Unauthorized (e.g., token expired)
      localStorage.removeItem('token');
      // You could also redirect to login here
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;