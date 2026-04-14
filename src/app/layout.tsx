import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const heading = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HiC Finans — BIST Temel Analiz Platformu",
  description:
    "Borsa İstanbul hisseleri için temel analiz, snowflake skorları, hisse tarama ve KAP haberleri.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${heading.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-primary text-text-primary">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/30 px-6 py-8">
          <div className="mx-auto max-w-7xl flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-md bg-gradient-to-br from-accent to-blue-700 flex items-center justify-center text-[8px] font-bold text-white">H</div>
              <span className="text-xs font-medium text-text-muted">HiC Finans &copy; {new Date().getFullYear()} focusoda.com</span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src="/founder.jpg"
                alt="Fatih — Kurucu"
                className="h-8 w-8 rounded-full object-cover ring-2 ring-accent/30"
              />
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-text-secondary">Fatih</span>
                <span className="text-[9px] text-text-muted">Kurucu &middot; focusoda.com</span>
              </div>
            </div>
            <p className="text-[10px] text-text-muted/60 text-center">
              Yatırım tavsiyesi niteliği taşımaz. Veriler bilgilendirme amaçlıdır ve gecikme içerebilir.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
