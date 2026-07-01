"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "font-body font-semibold rounded-[11px] cursor-pointer text-center inline-flex items-center justify-center gap-1.5 transition-all border-none",
        size === "sm" ? "text-[11px] py-[7px] px-[12px]" : "text-[13px] py-[11px] px-[18px]",
        fullWidth ? "w-full" : "",
        variant === "primary" && "bg-accent text-bg shadow-[0_0_18px_var(--accent-border)]",
        variant === "outline" && "bg-transparent border border-border text-vtext",
        variant === "ghost" && "bg-transparent text-muted",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function BigButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "w-full bg-accent text-bg font-body font-semibold text-[13px] p-[13px] rounded-xl border-none shadow-[0_0_18px_var(--accent-border)] cursor-pointer transition-all",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function OutlineButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "w-full bg-transparent border border-border text-vtext font-body text-[12px] p-[11px] rounded-xl cursor-pointer transition-all",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
