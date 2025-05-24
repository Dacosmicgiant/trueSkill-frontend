// src/components/ui/Alert.jsx
import React from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

const alertVariants = {
  default: 'bg-neutral-50 border-neutral-200 text-neutral-700',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  primary: 'bg-primary-50 border-primary-200 text-primary-800',
};

const alertIconMap = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  primary: Info,
};

export const Alert = ({
  children,
  variant = 'default',
  title,
  className,
  onClose,
  ...props
}) => {
  const IconComponent = alertIconMap[variant];
  
  return (
    <div
      className={cn(
        'rounded-md border p-4 relative flex',
        alertVariants[variant],
        className
      )}
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent
            className={cn(
              'h-5 w-5',
              variant === 'default' && 'text-neutral-400',
              variant === 'info' && 'text-blue-400',
              variant === 'success' && 'text-green-400',
              variant === 'warning' && 'text-yellow-400',
              variant === 'error' && 'text-red-400',
              variant === 'primary' && 'text-primary-400'
            )}
          />
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className={cn("text-sm", title && "mt-2")}>
            {children}
          </div>
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          className={cn(
            'absolute top-4 right-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
            variant === 'default' && 'focus:ring-neutral-500',
            variant === 'info' && 'focus:ring-blue-500',
            variant === 'success' && 'focus:ring-green-500',
            variant === 'warning' && 'focus:ring-yellow-500',
            variant === 'error' && 'focus:ring-red-500',
            variant === 'primary' && 'focus:ring-primary-500'
          )}
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;