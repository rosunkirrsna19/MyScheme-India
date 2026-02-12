import api from './api';

// --- UPDATED FUNCTION ---
export const getAllSchemes = async (filters = {}, page = 1) => {
  const { search, state, category, occupation } = filters;

  try {
    // Pass page number and filters as URL query parameters
    const { data } = await api.get('/schemes', {
      params: {
        page: page,
        search: search || undefined, 
        state: state || undefined,
        category: category || undefined,
        occupation: occupation || undefined,
      },
    });
    return data; // Return the full object { schemes, page, pages }
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch schemes';
  }
};
// --- END OF UPDATE ---

export const getSchemeById = async (id) => {
  try {
    const { data } = await api.get(`/schemes/${id}`);
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch scheme details';
  }
};

export const getEligibleSchemes = async () => {
  try {
    const { data } = await api.get('/schemes/eligible');
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch eligible schemes';
  }
};