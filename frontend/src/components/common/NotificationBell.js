import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- This is the corrected line
import * as notificationService from '../../services/notifications';
import AuthContext from '../../context/AuthContext';
import './NotificationBell.css'; 

// Simple Bell Icon
const BellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" />
  </svg>
);

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // If opening, refetch notifications
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    setIsOpen(false);
    navigate(notification.link); // Go to the link (e.g., /my-applications)
    
    // Mark as read in the backend
    try {
      await notificationService.markAsRead(notification._id);
      // Update state locally
      setNotifications(prev =>
        prev.map(n => (n._id === notification._id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <div className="notification-bell">
      <button onClick={handleToggle} className="bell-button">
        <BellIcon />
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
          </div>
          <ul className="notification-list">
            {notifications.length === 0 ? (
              <li className="notification-item-empty">You have no notifications.</li>
            ) : (
              notifications.map(notification => (
                <li
                  key={notification._id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;