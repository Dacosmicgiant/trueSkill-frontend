// src/components/ui/Input.jsx
import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Input = forwardRef(({ 
  className, 
  type = 'text',
  label,
  error,
  leftIcon,
  rightIcon,
  ...props 
}, ref) => {
  const inputClass = cn(
    'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
    error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    className
  );

  if (label) {
    return (
      <div className="w-full">
        <label 
          htmlFor={props.id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {leftIcon}
            </div>
          )}
          <input 
            ref={ref}
            type={type} 
            className={inputClass} 
            {...props} 
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {leftIcon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {leftIcon}
        </div>
      )}
      <input 
        ref={ref}
        type={type} 
        className={inputClass} 
        {...props} 
      />
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {rightIcon}
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;