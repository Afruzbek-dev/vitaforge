"use client";
import React from "react";
import { Modal } from "./modal";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Tasdiqlash",
  cancelText = "Bekor qilish",
  variant = "danger",
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-muted leading-relaxed">{description}</p>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={onClose} className="rounded-xl">
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "destructive" : "default"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={variant === "warning" ? "bg-warning text-bg hover:bg-warning/90 rounded-xl" : "rounded-xl"}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
