import React, { useState, useEffect } from 'react';
import * as schemeService from '../services/schemes';
import SchemeList from '../components/citizen/SchemeList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination'; // <-- 1. IMPORT PAGINATION
import './Schemes.css';

const Schemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- NEW: State for filters ---
  const [filters, setFilters] = useState({
    search: '',
    state: '',
    category: '',
    occupation: '',
  });

  // --- NEW: State for pagination ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- UPDATED: useEffect to re-fetch when filters or page change ---
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        setError('');
        // Pass the current filters and page to the API service
        const data = await schemeService.getAllSchemes(filters, page);
        setSchemes(data.schemes);
        setPage(data.page);
        setTotalPages(data.pages);
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [filters, page]); // Re-run this effect whenever 'filters' or 'page' changes

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    setPage(1); // Reset to page 1 when filters change
  };

  return (
    <div className="schemes-container">
      <h1>All Schemes</h1>
      <p>Browse all available government and private schemes.</p>
      
      <div className="filter-bar">
        <input
          type="text"
          name="search"
          placeholder="Search by title..."
          value={filters.search}
          onChange={handleFilterChange}
          className="filter-search"
        />
        <select
          name="state"
          value={filters.state}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All States</option>
          <option value="Tamil Nadu">Tamil Nadu</option>
          <option value="Kerala">Kerala</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Delhi">Delhi</option>
          <option value="West Bengal">West Bengal</option>
          <option value="Rajasthan">Rajasthan</option>
        </select>
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="General">General</option>
          <option value="OBC">OBC</option>
          <option value="SC">SC</option>
          <option value="ST">ST</option>
        </select>
        <select
          name="occupation"
          value={filters.occupation}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Occupations</option>
          <option value="Student">Student</option>
          <option value="Salaried">Salaried</option>
          <option value="Self-Employed">Self-Employed</option>
          <option value="Unemployed">Unemployed</option>
        </select>
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="schemes-error">Error: {error}</div>}
      {!loading && !error && (
        <>
          <SchemeList schemes={schemes} />
          {/* --- 2. RENDER THE PAGINATION COMPONENT --- */}
          <Pagination 
            page={page} 
            pages={totalPages} 
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      )}
    </div>
  );
};

export default Schemes;