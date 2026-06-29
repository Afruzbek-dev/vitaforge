"use client";
import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Content */}
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn z-10">
        <div className="flex items-center justify-between p-5 border-b border-border">
          {title ? (
            <h2 className="font-display font-bold text-lg text-vtext leading-none">{title}</h2>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted hover:text-vtext hover:bg-surface2 active:scale-95 transition touch-target flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
