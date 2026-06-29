"use client";
import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto swipe-container p-1 bg-surface/50 border border-border rounded-xl backdrop-blur-sm", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "swipe-item px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap touch-target",
              isActive 
                ? "bg-accent text-white shadow-sm" 
                : "text-muted hover:text-vtext hover:bg-surface2"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
