"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-accent/10 text-accent",
        success: "bg-vgreen/10 text-vgreen",
        warning: "bg-warning/10 text-warning",
        danger: "bg-vred/10 text-vred",
        info: "bg-vblue/10 text-vblue",
        secondary: "bg-surface2 text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export function PaymentStatusBadge({ status, className }: { status: string; className?: string }) {
  let variant: "warning" | "info" | "success" | "danger" | "default" = "default";
  let label = status;

  switch (status.toLowerCase()) {
    case "pending":
      variant = "warning";
      label = "Kutilmoqda";
      break;
    case "submitted":
      variant = "info";
      label = "Yuborilgan";
      break;
    case "confirmed":
      variant = "success";
      label = "Tasdiqlangan";
      break;
    case "overdue":
      variant = "danger";
      label = "Muddati o'tgan";
      break;
    case "rejected":
      variant = "danger";
      label = "Rad etilgan";
      break;
  }

  return <Badge variant={variant} className={className}>{label}</Badge>;
}
