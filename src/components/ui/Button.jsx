// src/components/ui/Button.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const buttonVariants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500',
  outline: 'bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
};

const buttonSizes = {
  xs: 'py-1 px-2 text-xs',
  sm: 'py-1.5 px-2.5 text-sm',
  md: 'py-2 px-4 text-sm',
  lg: 'py-2.5 px-5 text-base',
  xl: 'py-3 px-6 text-lg',
};

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  to,
  isLoading = false,
  leftIcon,
  rightIcon,
  asChild,
  ...props
}, ref) => {
  const baseStyles = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    buttonVariants[variant],
    buttonSizes[size],
    className
  );

  const content = (
    <>
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </>
  );

  // Handle the asChild prop properly
  if (asChild) {
    // Return the first child element with the props merged
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      className: baseStyles,
      ref,
      ...props,
    });
  }

  // Otherwise, handle normal navigation and button cases
  if (to) {
    return (
      <Link to={to} className={baseStyles} ref={ref} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={baseStyles} ref={ref} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button className={baseStyles} type={props.type || 'button'} ref={ref} {...props}>
      {content}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;