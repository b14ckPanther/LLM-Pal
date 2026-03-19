"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-[48px] w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--text-tertiary)] focus-visible:border-[var(--accent)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--accent-soft)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
