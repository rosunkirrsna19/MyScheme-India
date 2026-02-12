import api from './api';

export const getMyNotifications = async () => {
  try {
    const { data } = await api.get('/notifications');
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to fetch notifications';
  }
};

export const markAsRead = async (id) => {
  try {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  } catch (error) {
    throw error.response.data.msg || 'Failed to mark as read';
  }
};