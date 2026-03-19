"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--text-tertiary)] focus-visible:border-[var(--accent)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--accent-soft)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
