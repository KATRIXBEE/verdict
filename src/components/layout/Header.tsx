"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Globe2,
  Banknote,
  Target,
  MoreHorizontal,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import GlobalSearch from "@/components/GlobalSearch";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setOverflowOpen(false);
  }, [pathname]);

  // Click outside to dismiss overflow menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setOverflowOpen(false);
      }
    };
    if (overflowOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [overflowOpen]);

  // Escape key to dismiss menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOverflowOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Scroll-aware sticky header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const primaryNavLinks = [
    { href: "/", label: "DASHBOARD", icon: Scale },
  ];

  const secondaryNavLinks = [
    { href: "/leaderboard", label: "MOST WANTED", icon: Target },
    { href: "/tax-money", label: "TAX MONEY", icon: Coins },
    { href: "/money-trail", label: "MONEY TRAIL", icon: Banknote },
    { href: "/ground-truth", label: "GROUND TRUTH", icon: Newspaper },
    { href: "/india-rankings", label: "INDIA RANKINGS", icon: Globe2 },
    { href: "/compare", label: "NETA FACE-OFF", icon: GitCompare },
    { href: "/method", label: "METHODOLOGY & IPC", icon: BookOpen },
  ];

  const allNavLinks = [...primaryNavLinks, ...secondaryNavLinks];
  const isSecondaryActive = secondaryNavLinks.some((link) => pathname === link.href);

  return (
    <header
      className={cn(
        "navbar sticky top-0 z-[1000] transition-all duration-300 min-h-[56px] sm:min-h-[64px]",
        scrolled
          ? "bg-surface/95 border-b-2 border-ink backdrop-blur-sm shadow-hard-md"
          : "bg-surface border-b-3 border-ink shadow-hard-md"
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-4">
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
          <nav className="hidden lg:flex items-center gap-1 font-mono text-xs font-bold">
            {/* Horizontal Links Container */}
            <div className="navbar-container flex items-center gap-1">
              {/* Primary Link: Dashboard */}
              {primaryNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "navbar-nav-link flex items-center space-x-1 px-2.5 py-1.5 border-2 transition-all uppercase tracking-wider text-[11px] shrink-0 whitespace-nowrap",
                      isActive
                        ? "bg-brand-yellow text-black border-ink shadow-hard-xs"
                        : "border-transparent hover:bg-surface-muted hover:border-ink text-ink"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Secondary Links: Visible only on wide desktop (> 1450px) */}
              <div className="navbar-secondary-links flex items-center gap-1">
                {secondaryNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "navbar-nav-link flex items-center space-x-1 px-2.5 py-1.5 border-2 transition-all uppercase tracking-wider text-[11px] shrink-0 whitespace-nowrap",
                        isActive
                          ? "bg-brand-yellow text-black border-ink shadow-hard-xs"
                          : "border-transparent hover:bg-surface-muted hover:border-ink text-ink"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Overflow "•••" Menu Trigger: Visible on screens <= 1450px */}
            <div className="navbar-overflow-menu-trigger relative" ref={overflowRef}>
              <button
                type="button"
                onClick={() => setOverflowOpen(!overflowOpen)}
                className={cn(
                  "navbar-nav-link flex items-center space-x-1.5 px-2.5 py-1.5 border-2 transition-all uppercase tracking-wider text-[11px] shrink-0 whitespace-nowrap font-bold",
                  isSecondaryActive
                    ? "bg-brand-yellow text-black border-ink shadow-hard-xs"
                    : "border-ink bg-surface hover:bg-surface-muted text-ink shadow-hard-xs"
                )}
                aria-label="More navigation links"
                aria-expanded={overflowOpen}
              >
                <MoreHorizontal className="w-4 h-4 stroke-[2.5]" />
                <span>MORE</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-150", overflowOpen && "rotate-180")} />
              </button>

              {/* Overflow Dropdown Menu */}
              {overflowOpen && (
                <div className="absolute top-full mt-2 left-0 w-60 bg-surface border-3 border-ink shadow-hard-xl z-[1050] p-1.5 font-mono">
                  <div className="text-[10px] font-extrabold uppercase px-2.5 py-1 text-gray-500 border-b border-ink/20 mb-1">
                    EXPLORE VERDICT
                  </div>
                  {secondaryNavLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOverflowOpen(false)}
                        className={cn(
                          "flex items-center space-x-2.5 px-2.5 py-2 border border-transparent transition-all uppercase text-[11px] font-bold",
                          isActive
                            ? "bg-brand-yellow text-black border-ink shadow-hard-xs"
                            : "hover:bg-surface-muted hover:border-ink text-ink"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action: Global Search & Mobile Hamburger */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Global Search Bar (All pages) */}
            <GlobalSearch />

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 border-2.5 border-ink bg-surface shadow-hard-xs text-ink cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2.5 border-ink bg-canvas p-3 sm:p-4 space-y-2 font-mono shadow-hard-lg max-h-[calc(100vh-5rem)] overflow-y-auto">
          {allNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "min-h-[44px] flex items-center space-x-3 px-3.5 py-3 border-2 border-ink font-bold text-xs sm:text-sm shadow-hard-xs transition-all",
                  isActive 
                    ? "bg-brand-yellow text-black -translate-x-0.5 -translate-y-0.5 shadow-hard-sm" 
                    : "bg-surface text-ink hover:bg-surface-muted"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
