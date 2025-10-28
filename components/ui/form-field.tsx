'use client';

import * as React from 'react';
import { Controller, Control } from 'react-hook-form';

interface FormFieldProps<T> {
  name: keyof T;
  control: Control<T>;
  render: (props: { field: any }) => React.ReactNode;
}

export function FormField<T>({ name, control, render }: FormFieldProps<T>) {
  return <Controller name={name as any} control={control} render={render} />;
}
