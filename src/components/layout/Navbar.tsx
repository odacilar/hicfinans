"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const MAIN_NAV = [
  { href: "/", label: "Piyasa", icon: "◈" },
  { href: "/hisseler", label: "Hisseler", icon: "◆" },
  { href: "/harita", label: "Harita", icon: "▦" },
  { href: "/stratejiler", label: "Stratejiler", icon: "△" },
  { href: "/kap", label: "KAP", icon: "◇" },
  { href: "/fonlar", label: "Fonlar", icon: "◎" },
];

const MORE_NAV = [
  { href: "/tarayici", label: "Hisse Tarayıcı", icon: "⬡" },
  { href: "/hisseler/karsilastir", label: "Hisse Karşılaştır", icon: "⊞" },
  { href: "/temettu", label: "Temettü Takvimi", icon: "◉" },
  { href: "/portfoy", label: "Portföy Takibi", icon: "▣" },
  { href: "/takvim", label: "Ekonomik Takvim", icon: "▤" },
  { href: "/sektorler", label: "Sektör Analizi", icon: "◫" },
  { href: "/iceriden", label: "İçeriden İşlemler", icon: "◈" },
  { href: "/ai-tavsiye", label: "AI Tavsiye", icon: "✦" },
  { href: "/watchlist", label: "Watchlist", icon: "♡" },
  { href: "/backtest", label: "Backtest", icon: "↺" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isMoreActive = MORE_NAV.some((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [moreOpen]);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-primary/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <img
            src="/founder.jpg"
            alt="HiC Finans"
            className="h-10 w-10 rounded-full object-cover object-top shadow-lg shadow-accent/20 ring-2 ring-accent/30 transition-transform group-hover:scale-105"
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-base font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              HiC Finans
            </span>
            <span className="text-[9px] font-medium tracking-widest text-text-muted uppercase">
              Temel Analiz
            </span>
          </div>
        </Link>

        {/* Main nav */}
        <div className="flex items-center gap-0.5 rounded-xl bg-surface/50 p-1 overflow-x-auto scrollbar-none">
          {MAIN_NAV.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-accent/15 text-accent shadow-sm shadow-accent/10"
                    : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
                }`}
              >
                <span className="text-[10px]">{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}

          {/* More dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isMoreActive
                  ? "bg-accent/15 text-accent shadow-sm shadow-accent/10"
                  : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              <span className="text-[10px]">⋯</span>
              <span className="hidden md:inline">Daha</span>
              <svg className={`h-3 w-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-surface shadow-xl overflow-hidden">
                {MORE_NAV.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                      }`}
                    >
                      <span className="text-sm w-5 text-center">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <div className="flex items-center gap-1.5 rounded-lg bg-surface/50 px-3 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-up pulse-dot" />
            <span className="text-[10px] font-medium text-text-muted">Canlı</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
