"use client";
import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-accent-dim flex items-center justify-center mb-4">
        <Icon size={32} strokeWidth={1.5} className="text-accent" />
      </div>
      <h3 className="font-display font-bold text-xl text-vtext mb-2">
        {title}
      </h3>
      <p className="text-muted text-sm max-w-xs mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-xl px-6 shadow-sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
