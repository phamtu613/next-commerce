'use client';

import * as React from 'react';

export const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ children, ...props }, ref) => <label ref={ref} {...props}>{children}</label>
);
FormLabel.displayName = 'FormLabel';
