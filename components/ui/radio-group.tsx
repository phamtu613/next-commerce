'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { CircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RadioGroupProps extends React.ComponentProps<typeof RadioGroupPrimitive.Root> {}
interface RadioGroupItemProps extends React.ComponentProps<typeof RadioGroupPrimitive.Item> {}

export const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, RadioGroupProps>(
  ({ className, ...props }, ref) => (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn('grid gap-2', className)}
      {...props}
    />
  )
)
RadioGroup.displayName = 'RadioGroup'

export const RadioGroupItem = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, RadioGroupItemProps>(
  ({ className, ...props }, ref) => (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator>
        <div className="w-3 h-3 bg-blue-500 rounded-full" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
)
RadioGroupItem.displayName = 'RadioGroupItem'
