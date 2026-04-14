"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const ROW1 = [
  { href: "/", label: "Piyasa", icon: "◈" },
  { href: "/hisseler", label: "Hisseler", icon: "◆" },
  { href: "/harita", label: "Harita", icon: "▦" },
  { href: "/stratejiler", label: "Stratejiler", icon: "△" },
  { href: "/kap", label: "KAP", icon: "◇" },
  { href: "/fonlar", label: "Fonlar", icon: "◎" },
  { href: "/tarayici", label: "Tarayıcı", icon: "⬡" },
  { href: "/hisseler/karsilastir", label: "Karşılaştır", icon: "⊞" },
];

const ROW2 = [
  { href: "/temettu", label: "Temettü", icon: "◉" },
  { href: "/portfoy", label: "Portföy", icon: "▣" },
  { href: "/takvim", label: "Takvim", icon: "▤" },
  { href: "/sektorler", label: "Sektörler", icon: "◫" },
  { href: "/iceriden", label: "İçeriden", icon: "◈" },
  { href: "/ai-tavsiye", label: "AI Tavsiye", icon: "✦" },
  { href: "/watchlist", label: "Watchlist", icon: "♡" },
  { href: "/backtest", label: "Backtest", icon: "↺" },
];

function NavRow({ items, pathname }: { items: typeof ROW1; pathname: string }) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-surface/50 p-1">
      {items.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              isActive
                ? "bg-accent/15 text-accent shadow-sm shadow-accent/10"
                : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            <span className="text-xs">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-primary/70 backdrop-blur-xl">
      {/* Top row: Logo + Row 1 + Controls */}
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <img
            src="/founder.jpg"
            alt="HiC Finans"
            className="h-11 w-11 rounded-full object-cover object-top shadow-lg shadow-accent/20 ring-2 ring-accent/30 transition-transform group-hover:scale-105"
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

        <div className="flex-1 overflow-x-auto scrollbar-none">
          <NavRow items={ROW1} pathname={pathname} />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <div className="flex items-center gap-1.5 rounded-lg bg-surface/50 px-2.5 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-up pulse-dot" />
            <span className="text-[10px] font-medium text-text-muted">Canlı</span>
          </div>
        </div>
      </div>

      {/* Bottom row: Row 2 centered */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-1.5">
        <div className="overflow-x-auto scrollbar-none">
          <NavRow items={ROW2} pathname={pathname} />
        </div>
      </div>
    </nav>
  );
}
