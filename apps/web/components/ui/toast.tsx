"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
        {toasts.map((t) => {
          const Icon = t.type === "success" ? CheckCircle : t.type === "error" ? AlertTriangle : Info;
          return (
            <div
              key={t.id}
              className={cn(
                "flex items-center justify-between gap-3 p-4 rounded-xl border glass shadow-lg animate-slideUp transition-all duration-200",
                t.type === "success" && "border-vgreen/30 bg-vgreen/10 text-vgreen",
                t.type === "error" && "border-vred/30 bg-vred/10 text-vred",
                t.type === "info" && "border-accent/30 bg-accent-dim text-accent"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={20} strokeWidth={2} className="shrink-0" />
                <span className="text-sm font-semibold leading-snug">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg hover:bg-white/10 active:scale-95 transition"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
