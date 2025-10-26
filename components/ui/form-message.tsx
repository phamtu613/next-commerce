'use client';

import * as React from 'react';

export const FormMessage = ({ children }: { children?: React.ReactNode }) => {
  return <p className="text-sm text-red-500">{children}</p>;
};
