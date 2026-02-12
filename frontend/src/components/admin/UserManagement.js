import React, { useState, useEffect, useContext } from 'react';
import * as adminService from '../../services/admin';
import AuthContext from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import './UserManagement.css'; // New CSS file for this table

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: adminUser } = useContext(AuthContext); // Get the logged-in admin

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    if (window.confirm('Are you sure you want to change this user\'s role?')) {
      try {
        await adminService.updateUserRole(id, newRole);
        fetchUsers(); // Refresh the user list
      } catch (err) {
        alert('Failed to update role: ' + err.toString());
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This is permanent.')) {
      try {
        await adminService.deleteUser(id);
        fetchUsers(); // Refresh the user list
      } catch (err) {
        alert('Failed to delete user: ' + err.toString());
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="user-management-container">
      <h2>User Management</h2>
      {error && <p className="dashboard-error">Error: {error}</p>}
      
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <select 
                  value={user.role} 
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  disabled={user._id === adminUser.id} /* Admin can't change own role */
                >
                  <option value="Citizen">Citizen</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Admin">Admin</option>
                </select>
              </td>
              <td>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(user._id)}
                  disabled={user._id === adminUser.id} /* Admin can't delete self */
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;