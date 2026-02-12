import React from 'react';
import './Pagination.css'; // We will create this next

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <div className="pagination-container">
      <button
        className="pagination-button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>
      <span className="pagination-text">
        Page {page} of {pages}
      </span>
      <button
        className="pagination-button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;