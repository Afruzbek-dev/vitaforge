"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-surface2 rounded-lg", className)}
      {...props}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="pt-4 flex gap-3">
           <Skeleton className="h-10 w-24 rounded-xl" />
           <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonText({ className, width = "100%" }: { className?: string; width?: string | number }) {
  return <Skeleton className={cn("h-4", className)} style={{ width }} />;
}
