import React, { useState, useEffect, useCallback } from 'react'; // 1. Import useCallback
import { Link } from 'react-router-dom';
import * as schemeService from '../../services/schemes';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';
import '../admin/UserManagement.css';

const CoordinatorSchemeManagement = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 2. Wrap fetchSchemes in useCallback
  const fetchSchemes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await schemeService.getAllSchemes({}, page);
      setSchemes(data.schemes);
      setPage(data.page);
      setTotalPages(data.pages);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  }, [page]); // 3. Add 'page' as a dependency here

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]); // 4. Now 'fetchSchemes' is a stable dependency

  if (loading) return <LoadingSpinner />;

  return (
    <div className="user-management-container">
      <h2>Scheme Management</h2>
      {error && <p className="dashboard-error">Error: {error}</p>}
      
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Department</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {schemes.map((scheme) => (
            <tr key={scheme._id}>
              <td>{scheme.title}</td>
              <td>
                <span className={`status-badge status-${scheme.schemeType.toLowerCase()}`}>
                  {scheme.schemeType}
                </span>
              </td>
              <td>{scheme.department}</td>
              <td className="actions-cell">
                <Link to={`/schemes/${scheme._id}`} className="btn-review">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <Pagination 
        page={page} 
        pages={totalPages} 
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
};

export default CoordinatorSchemeManagement;