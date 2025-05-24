// src/components/ui/Badge.jsx
import React from 'react';
import { cn } from '../../utils/cn';

const badgeVariants = {
  default: 'bg-neutral-100 text-neutral-800',
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-secondary-100 text-secondary-800',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
  outline: 'bg-transparent border border-current',
};

export const Badge = ({
  children,
  variant = 'default',
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;