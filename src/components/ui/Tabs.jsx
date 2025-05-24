// src/components/ui/Tabs.jsx
import React from 'react';
import { cn } from '../../utils/cn';

const Tabs = React.forwardRef(({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleValueChange = React.useCallback(
    (newValue) => {
      if (value === undefined) {
        setActiveTab(newValue);
      }
      if (onValueChange) {
        onValueChange(newValue);
      }
    },
    [onValueChange, value]
  );

  return (
    <div className={cn('', className)} ref={ref} {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        if (child.type === TabsList || child.type === TabsContent) {
          return React.cloneElement(child, {
            activeTab,
            onValueChange: handleValueChange,
          });
        }

        return child;
      })}
    </div>
  );
});

Tabs.displayName = 'Tabs';

const TabsList = React.forwardRef(({ className, activeTab, onValueChange, children, ...props }, ref) => {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500',
        className
      )}
      ref={ref}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        if (child.type === TabsTrigger) {
          return React.cloneElement(child, {
            active: activeTab === child.props.value,
            onClick: () => onValueChange?.(child.props.value),
          });
        }

        return child;
      })}
    </div>
  );
});

TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef(({ className, active, value, onClick, children, ...props }, ref) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        active
          ? 'bg-white text-primary-700 shadow-sm'
          : 'text-gray-600 hover:text-gray-900',
        className
      )}
      onClick={onClick}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef(({ className, activeTab, value, onValueChange, children, ...props }, ref) => {
  // Don't pass the onValueChange to the div element since HTML divs don't support this prop
  // This fixes the "Unknown event handler property `onValueChange`" warning
  const { onValueChange: _, ...restProps } = props;
  
  if (activeTab !== value) return null;

  return (
    <div
      className={cn(
        'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        className
      )}
      ref={ref}
      {...restProps}
    >
      {children}
    </div>
  );
});

TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };