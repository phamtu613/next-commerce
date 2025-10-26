'use client';

import * as React from 'react';

export function Form({ children, ...props }: React.HTMLAttributes<HTMLFormElement>) {
  return <form {...props}>{children}</form>;
}
