"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, Search, GitCompare, BookOpen, Newspaper, Menu, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import BrutalistButton from "@/components/ui/BrutalistButton";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "DASHBOARD", icon: Scale },
    { href: "/ground-truth", label: "GROUND TRUTH", icon: Newspaper },
    { href: "/compare", label: "NETA FACE-OFF", icon: GitCompare },
    { href: "/method", label: "METHODOLOGY & IPC", icon: BookOpen },
  ];

  return (
    <header className="bg-surface border-b-3 border-ink sticky top-0 z-40 shadow-hard-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="bg-brand-red text-white p-2 border-2.5 border-ink shadow-hard-sm group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              <Scale className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-ink uppercase">
                  VERDICT
                </span>
                <span className="bg-brand-green text-ink font-mono text-[10px] font-extrabold px-1.5 py-0.5 border border-ink shadow-hard-xs hidden sm:inline-block">
                  v1.0 BETA
                </span>
              </div>
              <span className="font-mono text-[9px] sm:text-[10px] uppercase font-bold text-gray-600 tracking-wider">
                CIVIC-TECH TRANSPARENCY DASHBOARD
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-2 font-mono text-xs font-bold">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center space-x-1.5 px-3 py-2 border-2 border-transparent transition-all uppercase tracking-wider",
                    isActive
                      ? "bg-brand-yellow text-black border-ink shadow-hard-sm"
                      : "hover:bg-surface-muted hover:border-ink"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Status Pill & Live Indicator */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-surface-muted border-2 border-ink px-3 py-1.5 font-mono text-xs shadow-hard-xs">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse border border-black" />
              <span className="font-bold text-ink">18TH LOK SABHA</span>
              <span className="text-gray-500">|</span>
              <span className="text-[11px] text-gray-700">VERIFIED RECORDS</span>
            </div>

            <Link href="/compare">
              <BrutalistButton variant="primary" size="sm">
                COMPARE NETAS
              </BrutalistButton>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-2.5 border-ink bg-surface shadow-hard-sm text-ink"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2.5 border-ink bg-canvas p-4 space-y-3 font-mono">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 border-2.5 border-ink font-bold text-sm shadow-hard-sm",
                  isActive ? "bg-brand-yellow text-black" : "bg-surface text-ink"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2">
            <Link href="/compare" onClick={() => setMobileMenuOpen(false)}>
              <BrutalistButton variant="primary" size="md" className="w-full">
                NETA FACE-OFF (COMPARE)
              </BrutalistButton>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
