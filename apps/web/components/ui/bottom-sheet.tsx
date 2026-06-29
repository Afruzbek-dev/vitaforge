"use client";
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-md bg-surface border-t border-border sm:border sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slideUp z-10 pb-safe">
        <div className="sticky top-0 bg-surface/90 backdrop-blur pt-3 pb-2 px-5 z-20 flex flex-col items-center border-b border-border/50">
          <div className="w-10 h-1 rounded-full bg-muted/30 mb-4 shrink-0" />
          {title && (
            <h2 className="font-display font-bold text-lg text-vtext w-full text-center leading-none pb-2">
              {title}
            </h2>
          )}
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
