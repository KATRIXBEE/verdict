import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "green" | "yellow" | "red" | "orange" | "cyan" | "pink" | "purple" | "default" | "dark";
  size?: "sm" | "md";
}

export default function Badge({
  children,
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  const variantStyles = {
    green: "bg-brand-green text-black border-ink",
    yellow: "bg-brand-yellow text-black border-ink",
    red: "bg-brand-red text-white border-ink",
    orange: "bg-brand-orange text-white border-ink",
    cyan: "bg-brand-cyan text-black border-ink",
    pink: "bg-brand-pink text-black border-ink",
    purple: "bg-brand-purple text-black border-ink",
    default: "bg-surface text-ink border-ink",
    dark: "bg-ink text-white border-ink",
  };

  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-bold uppercase tracking-wider border-1.5 shadow-hard-xs select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
