// src/components/ui/PageHeader.jsx
import React from 'react';
import { cn } from '../../utils/cn';

export const PageHeader = ({
  title,
  description,
  children,
  actions,
  backButton,
  className,
  ...props
}) => {
  return (
    <div 
      className={cn(
        "mb-6",
        className
      )}
      {...props}
    >
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          {backButton && (
            <div className="mb-4">{backButton}</div>
          )}
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {title}
          </h1>
          
          {description && (
            typeof description === 'string' ? (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            ) : (
              <div className="mt-1 text-sm text-gray-500">{description}</div>
            )
          )}
        </div>
        
        {actions && (
          <div className="mt-4 flex md:ml-4 md:mt-0 space-x-3">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default PageHeader;