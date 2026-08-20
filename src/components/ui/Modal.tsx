"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  badge?: string;
  badgeColor?: "green" | "yellow" | "red" | "cyan";
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  badge,
  badgeColor = "cyan",
  children,
  maxWidth = "lg",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={cn(
          "relative bg-surface border-3 border-ink w-full shadow-hard-xl z-10 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150",
          maxWidthClasses[maxWidth]
        )}
      >
        {/* Title Bar */}
        <div className="bg-ink text-white px-4 py-2.5 flex items-center justify-between border-b-2.5 border-ink select-none">
          <div className="flex items-center space-x-2 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-red inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-brand-green inline-block" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider ml-2 truncate">
              {title || "SYSTEM DIALOG"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {badge && (
              <span
                className={cn(
                  "font-mono text-[10px] font-bold uppercase px-2 py-0.5 border border-white text-black",
                  badgeColor === "green" && "bg-brand-green",
                  badgeColor === "yellow" && "bg-brand-yellow",
                  badgeColor === "red" && "bg-brand-red text-white",
                  badgeColor === "cyan" && "bg-brand-cyan"
                )}
              >
                {badge}
              </span>
            )}
            <button
              onClick={onClose}
              className="text-white hover:text-brand-red transition-colors p-0.5 focus:outline-none"
              title="Close modal"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
