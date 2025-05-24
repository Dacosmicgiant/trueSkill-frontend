// src/components/ui/Select.jsx
import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = forwardRef(({ children, className, label, error, ...props }, ref) => {
  const triggerClass = cn(
    'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
    'flex h-10 items-center justify-between gap-1 px-3 py-2 data-[placeholder]:text-gray-400',
    error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
    className
  );

  return (
    <div className="w-full space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <SelectPrimitive.Trigger ref={ref} className={triggerClass} {...props}>
        <SelectValue placeholder={props.placeholder || "Select an option"} />
        <SelectPrimitive.Icon>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = forwardRef(({ className, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md animate-in fade-in-80',
        position === 'popper' && 'translate-y-1',
        className
      )}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {props.children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-primary-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-primary-600" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectLabel = forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectSeparator = forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-gray-100', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
};