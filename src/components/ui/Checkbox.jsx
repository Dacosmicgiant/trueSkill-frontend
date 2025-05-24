// src/components/ui/Checkbox.jsx
import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

const Checkbox = forwardRef(({ className, label, description, error, ...props }, ref) => {
  const checkboxClass = cn(
    'peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    'data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600',
    error && 'border-red-300 focus:ring-red-500',
    className
  );

  if (label) {
    return (
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <CheckboxPrimitive.Root
            ref={ref}
            className={checkboxClass}
            {...props}
          >
            <CheckboxPrimitive.Indicator className="flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
        </div>
        <div className="ml-3 text-sm">
          <label 
            htmlFor={props.id} 
            className={cn("font-medium text-gray-700", props.disabled && "opacity-50")}
          >
            {label}
          </label>
          {description && (
            <p className={cn("text-gray-500", props.disabled && "opacity-50")}>
              {description}
            </p>
          )}
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <CheckboxPrimitive.Root
        ref={ref}
        className={checkboxClass}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
export default Checkbox;