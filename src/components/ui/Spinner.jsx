// src/components/ui/Spinner.jsx
import React from 'react';
import { cn } from '../../utils/cn';

const spinnerSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const spinnerColors = {
  primary: 'text-primary-600',
  secondary: 'text-secondary-600',
  white: 'text-white',
  gray: 'text-gray-600',
};

export const Spinner = ({
  size = 'md',
  color = 'primary',
  className,
  ...props
}) => {
  return (
    <svg
      className={cn(
        'animate-spin',
        spinnerSizes[size],
        spinnerColors[color],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export const LoadingOverlay = ({ children, loading = false, className, ...props }) => {
  if (!loading) return children;
  
  return (
    <div className="relative">
      {children}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg',
          className
        )}
        {...props}
      >
        <Spinner size="lg" />
      </div>
    </div>
  );
};

export default Spinner;