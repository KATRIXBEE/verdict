import React from "react";
import { cn } from "@/lib/utils";

interface BrutalistCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  badge?: string;
  badgeColor?: "green" | "yellow" | "red" | "orange" | "cyan" | "pink" | "default";
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
  headerBg?: string;
  showWindowControls?: boolean;
  statusLight?: "green" | "red" | "yellow" | "none";
  statusLightLabel?: string;
}

export default function BrutalistCard({
  children,
  className,
  title,
  badge,
  badgeColor = "default",
  shadow = "md",
  headerBg = "bg-surface-muted",
  showWindowControls = true,
  statusLight = "none",
  statusLightLabel,
  ...props
}: BrutalistCardProps) {
  const shadowStyles = {
    none: "",
    sm: "shadow-hard-sm",
    md: "shadow-hard-md",
    lg: "shadow-hard-lg",
    xl: "shadow-hard-xl",
  };

  const badgeColorStyles = {
    green: "bg-brand-green text-black border-ink",
    yellow: "bg-brand-yellow text-black border-ink",
    red: "bg-brand-red text-white border-ink",
    orange: "bg-brand-orange text-white border-ink",
    cyan: "bg-brand-cyan text-black border-ink",
    pink: "bg-brand-pink text-black border-ink",
    default: "bg-surface text-ink border-ink",
  };

  return (
    <div
      className={cn(
        "bg-surface border-2.5 border-ink relative overflow-hidden flex flex-col",
        shadowStyles[shadow],
        className
      )}
      {...props}
    >
      {(title || showWindowControls || badge) && (
        <div
          className={cn(
            "border-b-2.5 border-ink px-3 py-2 flex items-center justify-between select-none font-mono text-xs",
            headerBg
          )}
        >
          {/* Left: Window Controls or Title */}
          <div className="flex items-center space-x-2 truncate">
            {showWindowControls && (
              <div className="flex items-center space-x-1.5 mr-2">
                <span className="w-2.5 h-2.5 rounded-full border border-black bg-brand-red inline-block" />
                <span className="w-2.5 h-2.5 rounded-full border border-black bg-brand-yellow inline-block" />
                <span className="w-2.5 h-2.5 rounded-full border border-black bg-brand-green inline-block" />
              </div>
            )}
            {title && (
              <span className="font-bold uppercase tracking-wider text-ink truncate">
                {title}
              </span>
            )}
          </div>

          {/* Right: Live Status Light or Badge */}
          <div className="flex items-center space-x-2 shrink-0">
            {statusLight !== "none" && (
              <div className="flex items-center space-x-1.5 font-mono text-[10px] uppercase font-bold bg-white/80 px-2 py-0.5 border border-ink">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full border border-black inline-block animate-pulse",
                    statusLight === "green" && "bg-brand-green",
                    statusLight === "red" && "bg-brand-red",
                    statusLight === "yellow" && "bg-brand-yellow"
                  )}
                />
                <span>{statusLightLabel || (statusLight === "green" ? "LIVE SYNC" : "ALERT")}</span>
              </div>
            )}

            {badge && (
              <span
                className={cn(
                  "font-mono text-[10px] font-bold uppercase px-2 py-0.5 border",
                  badgeColorStyles[badgeColor]
                )}
              >
                {badge}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">{children}</div>
    </div>
  );
}
