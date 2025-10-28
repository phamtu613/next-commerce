'use client';

import * as React from 'react';

export const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>
);
FormControl.displayName = 'FormControl';
