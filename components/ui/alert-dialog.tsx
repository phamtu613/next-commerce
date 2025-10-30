"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as React from "react";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;
export const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay ref={ref} className={className} {...props} />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

export const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogOverlay className="fixed inset-0 z-50 bg-black/50" />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={
        "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg focus:outline-none" +
        (className ? ` ${className}` : "")
      }
      {...props}
    />
  </AlertDialogPrimitive.Portal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

export const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={
      "flex flex-col space-y-2 text-center sm:text-left" +
      (className ? ` ${className}` : "")
    }
    {...props}
  />
);

export const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2" +
      (className ? ` ${className}` : "")
    }
    {...props}
  />
);

export const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={"text-lg font-semibold" + (className ? ` ${className}` : "")}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

export const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={
      "text-sm text-muted-foreground" + (className ? ` ${className}` : "")
    }
    {...props}
  />
));
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

export const AlertDialogAction = AlertDialogPrimitive.Action;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;
