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

  // All navigation links in priority order
  const allNavLinks = [
    { href: "/", label: "DASHBOARD", icon: Scale },
    { href: "/leaderboard", label: "MOST WANTED", icon: Target },
    { href: "/tax-money", label: "TAX MONEY", icon: Coins },
    { href: "/compare", label: "NETA FACE-OFF", icon: GitCompare },
    { href: "/money-trail", label: "MONEY TRAIL", icon: Banknote },
    { href: "/ground-truth", label: "GROUND TRUTH", icon: Newspaper },
    { href: "/india-rankings", label: "INDIA RANKINGS", icon: Globe2 },
    { href: "/method", label: "METHODOLOGY", icon: BookOpen },
  ];

  // Priority 1: Always visible on desktop (lg+)
  const priority1Links = allNavLinks.slice(0, 2); // Dashboard, Most Wanted
  // Priority 2: Visible on xl+
  const priority2Links = allNavLinks.slice(2, 4); // Tax Money, Neta Face-Off
  // Priority 3: Visible on 2xl+
  const priority3Links = allNavLinks.slice(4);    // Money Trail, Ground Truth, India Rankings, Methodology

  // Overflow links shown in the "••• MORE" menu
  const overflowLinks = allNavLinks.slice(2); // Everything except Priority 1
  const isOverflowActive = overflowLinks.some((link) => pathname === link.href);

  return (
    <header
      className={cn(
        "navbar sticky top-0 z-[1000] transition-all duration-300 w-full max-w-full px-3 md:px-6 py-2 flex items-center justify-between gap-2 overflow-x-hidden min-h-[56px] sm:min-h-[64px]",
        scrolled
          ? "bg-surface/95 border-b-2 border-ink backdrop-blur-sm shadow-hard-md"
          : "bg-surface border-b-3 border-ink shadow-hard-md"
      )}
    >
      {/* Brand Logo */}
      <Link href="/" className="flex items-center space-x-2 sm:space-x-2.5 group shrink-0">
        <div className="bg-brand-red text-white p-1.5 sm:p-2 border-2.5 border-ink shadow-hard-sm group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0">
          <Scale className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className="font-display text-lg sm:text-2xl font-black tracking-tight text-ink uppercase">
              VERDICT
            </span>
            <span className="bg-brand-green text-ink font-mono text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 border border-ink shadow-hard-xs hidden sm:inline-block">
              v1.0
            </span>
          </div>
          <span className="font-mono text-[8px] uppercase font-bold text-gray-600 tracking-wider hidden xs:inline">
            CIVIC-TECH TRANSPARENCY
          </span>
        </div>
      </Link>

      {/* Desktop Navigation Links (Inner flex wrapper) */}
      <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-shrink min-w-0">
        {/* Priority 1 Links: Always visible on lg+ */}
        {priority1Links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "navbar-nav-link flex items-center space-x-1 px-2 py-1 text-xs font-mono font-bold uppercase tracking-wider border-2 transition-all shrink-0 whitespace-nowrap",
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

        {/* Priority 2 Links: Visible on xl+ */}
        <div className="hidden xl:flex items-center gap-1 xl:gap-1.5">
          {priority2Links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "navbar-nav-link flex items-center space-x-1 px-2 py-1 text-xs font-mono font-bold uppercase tracking-wider border-2 transition-all shrink-0 whitespace-nowrap",
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

        {/* Priority 3 Links: Visible on 2xl+ */}
        <div className="hidden 2xl:flex items-center gap-1 xl:gap-1.5">
          {priority3Links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "navbar-nav-link flex items-center space-x-1 px-2 py-1 text-xs font-mono font-bold uppercase tracking-wider border-2 transition-all shrink-0 whitespace-nowrap",
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

        {/* Overflow "••• MORE" Menu Trigger: Visible when some links are collapsed (hidden on 2xl) */}
        <div className="2xl:hidden relative shrink-0" ref={overflowRef}>
          <button
            type="button"
            onClick={() => setOverflowOpen(!overflowOpen)}
            className={cn(
              "navbar-nav-link flex items-center space-x-1 px-2 py-1 text-xs font-mono font-bold uppercase tracking-wider border-2 transition-all shrink-0 whitespace-nowrap",
              isOverflowActive
                ? "bg-brand-yellow text-black border-ink shadow-hard-xs"
                : "border-ink bg-surface hover:bg-surface-muted text-ink shadow-hard-xs"
            )}
            aria-label="More navigation links"
            aria-expanded={overflowOpen}
          >
            <MoreHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>MORE</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform duration-150", overflowOpen && "rotate-180")} />
          </button>

          {/* Overflow Dropdown Menu */}
          {overflowOpen && (
            <div className="absolute top-full mt-1.5 left-0 w-56 bg-surface border-3 border-ink shadow-hard-xl z-[1050] p-1.5 font-mono">
              <div className="text-[10px] font-extrabold uppercase px-2 py-0.5 text-gray-500 border-b border-ink/20 mb-1">
                EXPLORE VERDICT
              </div>
              {overflowLinks.map((link, idx) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                const isHiddenOnXl = idx < 2;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOverflowOpen(false)}
                    className={cn(
                      "flex items-center space-x-2 px-2 py-1.5 border border-transparent transition-all uppercase text-[11px] font-bold",
                      isHiddenOnXl && "xl:hidden",
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
      <div className="flex items-center space-x-2 shrink-0">
        {/* Global Search Bar (Responsive flex-shrink container) */}
        <GlobalSearch />

        {/* Mobile Menu Button (hidden on lg and above) */}
        <div className="lg:hidden flex items-center shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 border-2 border-ink bg-surface shadow-hard-xs text-ink cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 border-b-3 border-ink bg-canvas p-3 sm:p-4 space-y-1.5 font-mono shadow-hard-xl max-h-[calc(100vh-4rem)] overflow-y-auto z-[1050]">
          {allNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "min-h-[42px] flex items-center space-x-3 px-3.5 py-2.5 border-2 border-ink font-bold text-xs sm:text-sm shadow-hard-xs transition-all",
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
