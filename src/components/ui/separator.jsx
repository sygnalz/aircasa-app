import React from 'react';

const Separator = React.forwardRef(({ className = '', orientation = 'horizontal', ...props }, ref) => {
  const orientationClass = orientation === 'vertical' 
    ? 'h-full w-px' 
    : 'h-px w-full';
    
  return (
    <div
      ref={ref}
      className={`bg-gray-200 ${orientationClass} ${className}`}
      {...props}
    />
  );
});

Separator.displayName = 'Separator';

export { Separator };