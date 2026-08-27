"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Scale, 
  Search, 
  GitCompare, 
  BookOpen, 
  Newspaper, 
  Menu, 
  X, 
  Coins, 
  Globe2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import BrutalistButton from "@/components/ui/BrutalistButton";
import GlobalSearch from "@/components/GlobalSearch";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "DASHBOARD", icon: Scale },
    { href: "/ground-truth", label: "GROUND TRUTH", icon: Newspaper },
    { href: "/india-rankings", label: "INDIA RANKINGS", icon: Globe2 },
    { href: "/tax-money", label: "TAX MONEY", icon: Coins },
    { href: "/compare", label: "NETA FACE-OFF", icon: GitCompare },
    { href: "/method", label: "METHODOLOGY & IPC", icon: BookOpen },
  ];

  return (
    <header className="bg-surface border-b-3 border-ink sticky top-0 z-40 shadow-hard-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0">
            <div className="bg-brand-red text-white p-1.5 sm:p-2 border-2.5 border-ink shadow-hard-sm group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-ink uppercase">
                  VERDICT
                </span>
                <span className="bg-brand-green text-ink font-mono text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 border border-ink shadow-hard-xs hidden sm:inline-block">
                  v1.0
                </span>
              </div>
              <span className="font-mono text-[8px] sm:text-[9px] uppercase font-bold text-gray-600 tracking-wider hidden xs:inline">
                CIVIC-TECH TRANSPARENCY
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center space-x-1 font-mono text-xs font-bold">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center space-x-1 px-2.5 py-1.5 border-2 border-transparent transition-all uppercase tracking-wider text-[11px]",
                    isActive
                      ? "bg-brand-yellow text-black border-ink shadow-hard-xs"
                      : "hover:bg-surface-muted hover:border-ink"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Global Search & Mobile Hamburger */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Global Search Bar (All pages) */}
            <GlobalSearch />

            {/* Compare Netas Quick CTA (hidden on smallest screens) */}
            <div className="hidden lg:block">
              <Link href="/compare">
                <BrutalistButton variant="primary" size="sm" shadow="sm">
                  NETA FACE-OFF
                </BrutalistButton>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="xl:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 sm:p-2 border-2.5 border-ink bg-surface shadow-hard-xs text-ink"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t-2.5 border-ink bg-canvas p-4 space-y-2 font-mono shadow-hard-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3.5 py-2.5 border-2 border-ink font-bold text-xs sm:text-sm shadow-hard-xs",
                  isActive ? "bg-brand-yellow text-black" : "bg-surface text-ink"
                )}
              >
                <Icon className="w-4 h-4" />
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
