// src/components/ui/Pagination.jsx
import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  ...props
}) => {
  // Create an array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];

    // Always show first page
    if (currentPage > 3) {
      pageNumbers.push(1);
      // Add ellipsis if needed
      if (currentPage > 4) {
        pageNumbers.push('...');
      }
    }

    // Add pages around the current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pageNumbers.push(i);
    }

    // Always show last page
    if (currentPage < totalPages - 2) {
      // Add ellipsis if needed
      if (currentPage < totalPages - 3) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className={cn('flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6', className)}
      aria-label="Pagination"
      {...props}
    >
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span> pages
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Previous
        </button>
        
        <div className="hidden sm:flex sm:items-center sm:ml-4 space-x-1">
          {getPageNumbers().map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={cn(
                  'relative inline-flex items-center px-4 py-2 text-sm font-medium',
                  currentPage === page
                    ? 'bg-primary-600 text-white z-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                )}
              >
                {page}
              </button>
            ) : (
              <span
                key={index}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700"
              >
                {page}
              </span>
            )
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="h-5 w-5 ml-1" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;