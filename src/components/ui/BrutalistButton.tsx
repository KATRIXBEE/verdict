import React from "react";
import { cn } from "@/lib/utils";

interface BrutalistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning" | "cyan" | "outline";
  size?: "sm" | "md" | "lg";
  shadow?: "sm" | "md" | "lg" | "none";
}

export default function BrutalistButton({
  children,
  className,
  variant = "primary",
  size = "md",
  shadow = "md",
  ...props
}: BrutalistButtonProps) {
  const variantStyles = {
    primary: "bg-brand-green text-black hover:bg-[#20ff78]",
    secondary: "bg-brand-yellow text-black hover:bg-[#ffe16b]",
    danger: "bg-brand-red text-white hover:bg-[#ff5a50]",
    warning: "bg-brand-orange text-white hover:bg-[#ff9d26]",
    cyan: "bg-brand-cyan text-black hover:bg-[#8ee0ff]",
    outline: "bg-surface text-ink hover:bg-surface-muted",
  };

  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs font-bold font-mono",
    md: "px-4 py-2 text-sm font-bold font-mono",
    lg: "px-6 py-3 text-base font-extrabold font-display tracking-wide",
  };

  const shadowStyles = {
    none: "",
    sm: "shadow-hard-sm",
    md: "shadow-hard-md",
    lg: "shadow-hard-lg",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center border-2.5 border-ink uppercase transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        shadowStyles[shadow],
        shadow !== "none" && "hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
