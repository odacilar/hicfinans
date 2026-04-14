# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Mimari Özet

BistWall: Next.js App Router (Vercel) + Prisma → PostgreSQL (Supabase). AWS EC2'deki Node worker'ları cron ile Bigpara/Yahoo/KAP'tan veri çekip DB'ye **yazar**. Next.js API route'ları DB'den **sadece okur** — yazma-okuma yolları ayrıktır. Skor hesaplama `lib/scoring.ts`'de senkron çalışır, KAP özetleme `services/claude.ts` üzerinden Claude API ile async yapılır. Frontend: Server Components varsayılan, Zustand sadece interaktif state için, Recharts grafiklerde.

> Sprint planı ve görev kırılımı için [MVP.md](MVP.md) dosyasına bak.

---

## Komutlar

```bash
# İlk kurulum (proje henüz scaffold edilmediyse)
npx create-next-app@latest bistwall --typescript --tailwind --app --src-dir
cd bistwall
npm install prisma @prisma/client recharts zustand
npm install -D @types/node

# Veritabanı
npx prisma init
npx prisma db push          # Schema'yı DB'ye uygula
npx prisma generate          # Client oluştur
npx prisma studio            # DB browser aç

# Geliştirme
npm run dev                  # localhost:3000
npm run build                # Production build
npm run lint                 # ESLint

# Seed & test
npx ts-node scripts/seed.ts        # BIST-100 şirket listesi seed
npx ts-node scripts/test-apis.ts   # API bağlantı testi
```

---

## Veri Akışı

```
Worker (EC2 cron) → Bigpara/Yahoo/KAP → services/* → Prisma → PostgreSQL
                                                                  ↓
Next.js API route (app/api/*) ← lib/db.ts ← Prisma ← ───────────┘
                ↓
Server Component (ISR 5dk) → Client Component (Zustand) → Recharts
```

**Kural:** API route'lar sadece okur, worker'lar sadece yazar. Bu ayrımı bozmayın.

---

## Ortam Değişkenleri (.env.local)

```
DATABASE_URL=              # Supabase PostgreSQL bağlantı string'i
ANTHROPIC_API_KEY=         # Claude API (KAP özetleme)
GEMINI_API_KEY=            # Google Gemini API (KAP rapor özetleme, ücretsiz katman)
NOSYAPI_KEY=               # NosyAPI (opsiyonel, ücretli)
```

---

## İsimlendirme Kuralı

Türkçe UI string'leri, İngilizce kod:
- `const valueScore` ✅ / `const degerlemeSkoru` ❌
- UI'da `"Değerleme Skoru"` ✅
- Commit mesajları Türkçe conventional commits: `feat: hisse detay sayfası eklendi`

---

## Proje Özeti

**BistWall** — Borsa İstanbul (BIST) için SimplyWall.St tarzı bir temel analiz ve hisse tarama platformu.
Türk bireysel yatırımcılarına yönelik, görsel ağırlıklı, filtrelenebilir, günlük güncellenen bir web uygulaması.

- **Domain:** bistwall.focusoda.com
- **Sahibi:** Fatih (focusoda.com)
- **Hedef Kitle:** Türk bireysel yatırımcılar, temel analiz yapanlar
- **Dil:** Türkçe UI, İngilizce kod/yorumlar
- **Rakipler:** Fintables, F-Ray, FastWeb, MatriksData

---

## 🏗️ Teknoloji Stack'i

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI:** React + Tailwind CSS
- **Grafikler:** Recharts (snowflake radar chart, bar/line charts)
- **State:** Zustand (hafif, basit)
- **Dil:** TypeScript

### Backend
- **Runtime:** Node.js (Next.js API Routes)
- **Veritabanı:** PostgreSQL (Supabase veya AWS RDS)
- **ORM:** Prisma
- **Cache:** Redis (opsiyonel, MVP sonrası)

### Veri Toplama
- **Otomasyon:** n8n (self-hosted on AWS EC2) veya cron jobs
- **Scraping:** Puppeteer / Cheerio
- **API Kaynakları:** Bigpara API, Foreks API, Yahoo Finance, KAP RSS

### AI Katmanı
- **Model:** Claude API (claude-sonnet-4-20250514)
- **Kullanım:** KAP rapor özetleme, hisse skoru hesaplama, analist konsensüs analizi

### Altyapı
- **Hosting:** Vercel (frontend) + AWS EC2 (veri toplama worker'ları)
- **CI/CD:** GitHub Actions
- **Monitoring:** Vercel Analytics + basit health check

---

## 📁 Proje Yapısı

```
bistwall/
├── CLAUDE.md                    # Bu dosya
├── MVP.md                       # MVP tanım dokümanı
├── README.md                    # Proje açıklaması
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── prisma/
│   └── schema.prisma            # Veritabanı şeması
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout (font, meta, navbar)
│   │   ├── page.tsx             # Ana sayfa — piyasa özeti dashboard
│   │   ├── hisseler/
│   │   │   ├── page.tsx         # Hisse listesi + filtre sayfası
│   │   │   └── [ticker]/
│   │   │       └── page.tsx     # Hisse detay sayfası
│   │   ├── tarayici/
│   │   │   └── page.tsx         # Gelişmiş hisse tarayıcı (screener)
│   │   ├── kap/
│   │   │   └── page.tsx         # KAP haberleri akışı
│   │   └── api/
│   │       ├── stocks/
│   │       │   ├── route.ts     # GET /api/stocks — liste + filtre
│   │       │   └── [ticker]/
│   │       │       └── route.ts # GET /api/stocks/[ticker] — detay
│   │       ├── kap/
│   │       │   └── route.ts     # GET /api/kap — KAP haberleri
│   │       ├── screener/
│   │       │   └── route.ts     # POST /api/screener — tarama
│   │       └── cron/
│   │           ├── prices.ts    # Fiyat güncelleme
│   │           ├── financials.ts# Finansal tablo güncelleme
│   │           └── kap.ts       # KAP haber çekme
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── charts/
│   │   │   ├── SnowflakeChart.tsx    # 5 boyutlu radar chart
│   │   │   ├── PriceChart.tsx        # Fiyat grafiği
│   │   │   ├── FinancialBarChart.tsx  # Gelir/kar bar chart
│   │   │   └── ValuationGauge.tsx    # Değerleme göstergesi
│   │   ├── stock/
│   │   │   ├── StockCard.tsx         # Liste kartı
│   │   │   ├── StockDetail.tsx       # Detay sayfası içerik
│   │   │   ├── AnalystConsensus.tsx  # Analist tavsiyeleri
│   │   │   ├── FinancialTable.tsx    # Bilanço/Gelir tablosu
│   │   │   └── RiskReward.tsx        # Risk/Ödül kartı
│   │   ├── screener/
│   │   │   ├── FilterPanel.tsx       # Filtre paneli
│   │   │   ├── FilterChip.tsx        # Aktif filtre badge
│   │   │   └── ResultsTable.tsx      # Sonuç tablosu
│   │   └── kap/
│   │       ├── KapFeed.tsx           # KAP haber akışı
│   │       └── KapCard.tsx           # Tek KAP haberi kartı
│   ├── lib/
│   │   ├── db.ts                # Prisma client
│   │   ├── api.ts               # Frontend API helper
│   │   ├── scoring.ts           # Snowflake skor hesaplama
│   │   ├── formatters.ts        # Para, oran, tarih formatlama
│   │   └── constants.ts         # Sektör kodları, filtre limitleri
│   ├── services/
│   │   ├── bigpara.ts           # Bigpara API client
│   │   ├── kap.ts               # KAP scraper/RSS
│   │   ├── yahoo.ts             # Yahoo Finance client
│   │   ├── analyst.ts           # Analist veri toplama
│   │   └── claude.ts            # Claude API entegrasyonu
│   └── types/
│       ├── stock.ts             # Hisse tipleri
│       ├── financial.ts         # Finansal tablo tipleri
│       ├── kap.ts               # KAP haber tipleri
│       └── screener.ts          # Filtre tipleri
├── workers/                     # AWS EC2'de çalışacak worker'lar
│   ├── daily-prices.ts          # Günlük fiyat güncelleme
│   ├── quarterly-financials.ts  # Çeyreklik bilanço güncelleme
│   ├── kap-monitor.ts           # KAP RSS izleme
│   └── analyst-scraper.ts       # Analist hedef fiyat toplama
├── scripts/
│   ├── seed.ts                  # Veritabanı seed (BIST şirket listesi)
│   ├── migrate.ts               # Migration helper
│   └── test-apis.ts             # API bağlantı testi
└── public/
    ├── favicon.ico
    └── og-image.png
```

---

## 📊 Veri Modeli (Prisma Schema)

```prisma
model Company {
  id            String   @id @default(cuid())
  ticker        String   @unique          // "THYAO"
  name          String                     // "Türk Hava Yolları A.O."
  sector        String                     // "Ulaştırma"
  subSector     String?                    // "Havayolu Taşımacılığı"
  marketCap     Float?                     // Piyasa değeri (TL)
  listingDate   DateTime?                  // Halka arz tarihi
  website       String?
  logo          String?                    // Logo URL

  // İlişkiler
  prices        PriceData[]
  financials    FinancialData[]
  scores        StockScore[]
  kapNews       KapNews[]
  analystRatings AnalystRating[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model PriceData {
  id            String   @id @default(cuid())
  companyId     String
  company       Company  @relation(fields: [companyId], references: [id])
  date          DateTime
  open          Float
  high          Float
  low           Float
  close         Float
  volume        BigInt
  adjustedClose Float?

  @@unique([companyId, date])
  @@index([companyId])
  @@index([date])
}

model FinancialData {
  id                String   @id @default(cuid())
  companyId         String
  company           Company  @relation(fields: [companyId], references: [id])
  period            String                  // "2024-Q4", "2024-FY"
  periodEndDate     DateTime

  // Gelir Tablosu
  revenue           Float?                  // Hasılat
  grossProfit       Float?                  // Brüt Kar
  operatingProfit   Float?                  // Faaliyet Karı (EBIT)
  ebitda            Float?                  // FAVÖK
  netIncome         Float?                  // Net Kar
  eps               Float?                  // Hisse Başına Kar

  // Bilanço
  totalAssets       Float?                  // Toplam Varlıklar
  totalLiabilities  Float?                  // Toplam Yükümlülükler
  totalEquity       Float?                  // Özkaynaklar
  cash              Float?                  // Nakit ve Nakit Benzerleri
  totalDebt         Float?                  // Toplam Borç
  netDebt           Float?                  // Net Borç

  // Nakit Akışı
  operatingCashFlow Float?                  // İşletme Faaliyetlerinden Nakit
  capex             Float?                  // Yatırım Harcamaları
  freeCashFlow      Float?                  // Serbest Nakit Akışı
  dividendPaid      Float?                  // Ödenen Temettü

  // Oranlar (hesaplanmış)
  peRatio           Float?                  // F/K
  pbRatio           Float?                  // PD/DD
  evToEbitda        Float?                  // FD/FAVÖK
  debtToEquity      Float?                  // Borç/Özkaynak
  currentRatio      Float?                  // Cari Oran
  roe               Float?                  // Özkaynak Karlılığı
  roa               Float?                  // Aktif Karlılığı
  grossMargin       Float?                  // Brüt Kar Marjı
  netMargin         Float?                  // Net Kar Marjı
  dividendYield     Float?                  // Temettü Verimi

  @@unique([companyId, period])
  @@index([companyId])
}

model StockScore {
  id            String   @id @default(cuid())
  companyId     String
  company       Company  @relation(fields: [companyId], references: [id])
  calculatedAt  DateTime @default(now())

  // Snowflake Skorları (0-5 arası)
  valueScore    Float                      // Değerleme skoru
  futureScore   Float                      // Gelecek büyüme skoru
  pastScore     Float                      // Geçmiş performans skoru
  healthScore   Float                      // Finansal sağlık skoru
  dividendScore Float                      // Temettü skoru
  overallScore  Float                      // Genel skor (ortalama)

  // Skor detayları (JSON)
  scoreDetails  Json?                      // Alt kırılım açıklamaları

  @@index([companyId])
}

model KapNews {
  id            String   @id @default(cuid())
  companyId     String?
  company       Company? @relation(fields: [companyId], references: [id])
  kapId         String   @unique           // KAP bildirim ID
  title         String
  content       String?                    // Ham içerik
  summary       String?                    // AI özet
  category      String?                    // "bilanco", "temettü", "genel_kurul", vb.
  publishedAt   DateTime
  url           String

  @@index([companyId])
  @@index([publishedAt])
  @@index([category])
}

model AnalystRating {
  id            String   @id @default(cuid())
  companyId     String
  company       Company  @relation(fields: [companyId], references: [id])
  source        String                     // "İş Yatırım", "Yapı Kredi Yatırım", vb.
  rating        String                     // "AL", "TUT", "SAT", "EndeksÜstü"
  targetPrice   Float?                     // Hedef fiyat (TL)
  currentPrice  Float?                     // Raporlama anındaki fiyat
  upside        Float?                     // Yükseliş potansiyeli (%)
  reportDate    DateTime
  reportUrl     String?
  analystName   String?

  @@index([companyId])
  @@index([reportDate])
}
```

---

## 🎨 Tasarım Sistemi

### Renk Paleti
```css
:root {
  /* Ana Renkler */
  --color-primary: #0F172A;        /* Koyu lacivert — ana arka plan */
  --color-secondary: #1E293B;      /* Koyu gri — kart arka planları */
  --color-accent: #3B82F6;         /* Mavi — vurgu, butonlar */
  --color-accent-hover: #2563EB;

  /* Skor Renkleri (Snowflake) */
  --color-value: #10B981;          /* Yeşil — Değerleme */
  --color-future: #3B82F6;         /* Mavi — Gelecek */
  --color-past: #8B5CF6;           /* Mor — Geçmiş */
  --color-health: #F59E0B;         /* Turuncu — Sağlık */
  --color-dividend: #EF4444;       /* Kırmızı — Temettü */

  /* Durum Renkleri */
  --color-up: #10B981;             /* Yükseliş */
  --color-down: #EF4444;           /* Düşüş */
  --color-neutral: #6B7280;        /* Nötr */

  /* Yüzey */
  --color-surface: #1E293B;
  --color-surface-hover: #334155;
  --color-border: #334155;
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #94A3B8;
  --color-text-muted: #64748B;
}
```

### Tipografi
- **Başlıklar:** "Plus Jakarta Sans" (Google Fonts)
- **Gövde:** "DM Sans" (Google Fonts)
- **Monospace (sayılar):** "JetBrains Mono" (Google Fonts)

### Bileşen İlkeleri
- Dark theme varsayılan (finans uygulaması standardı)
- Kartlar: rounded-xl, subtle border, hover glow efekti
- Sayılar sağa hizalı, monospace font
- Yükseliş yeşil, düşüş kırmızı (evrensel)
- Mobile-first responsive tasarım

---

## 🔢 Snowflake Skor Hesaplama Algoritması

```typescript
// Her kategori 0-5 arası puan alır

// 1. VALUE SCORE (Değerleme)
// - F/K oranı sektör ortalamasına göre → 0-5
// - PD/DD oranı → 0-5
// - FD/FAVÖK → 0-5
// - DCF bazlı içsel değer vs piyasa fiyatı → 0-5
// Ağırlıklı ortalama

// 2. FUTURE SCORE (Gelecek Büyüme)
// - Son 3 yıl gelir büyüme trendi → 0-5
// - Son 3 yıl kar büyüme trendi → 0-5
// - Analist konsensüs hedef fiyat upside → 0-5
// Ağırlıklı ortalama

// 3. PAST SCORE (Geçmiş Performans)
// - 5 yıllık ROE ortalaması → 0-5
// - 5 yıllık gelir büyümesi → 0-5
// - Karlılık istikrarı (standart sapma) → 0-5
// Ağırlıklı ortalama

// 4. HEALTH SCORE (Finansal Sağlık)
// - Borç/Özkaynak oranı → 0-5
// - Cari oran → 0-5
// - Faiz karşılama oranı → 0-5
// - Serbest nakit akışı pozitifliği → 0-5
// Ağırlıklı ortalama

// 5. DIVIDEND SCORE (Temettü)
// - Temettü verimi → 0-5
// - Temettü ödeme istikrarı (son 5 yıl) → 0-5
// - Payout ratio sürdürülebilirliği → 0-5
// Ağırlıklı ortalama
```

---

## 🔌 API Kaynakları ve Erişim

### Bigpara (Hürriyet) — Ücretsiz
```
Hisse Listesi:  GET http://bigpara.hurriyet.com.tr/api/v1/hisse/list
Hisse Detay:    GET http://bigpara.hurriyet.com.tr/api/v1/borsa/hisseyuzeysel/{TICKER}
Endeks:         GET https://web-paragaranti-pubsub.foreks.com/web-services/securities/exchanges/BIST/groups/E
```

### Yahoo Finance — Ücretsiz
```
Fiyat Verisi:   GET https://query1.finance.yahoo.com/v8/finance/chart/{TICKER}.IS
Finansal:       GET https://query1.finance.yahoo.com/v10/finance/quoteSummary/{TICKER}.IS?modules=financialData,balanceSheetHistory
```
> Not: .IS suffix = Istanbul Stock Exchange

### KAP (Kamuyu Aydınlatma Platformu)
```
RSS Feed:       https://www.kap.org.tr/tr/rss/bildirim
Bildirim Detay: https://www.kap.org.tr/tr/Bildirim/{ID}
```
> Not: Scraping gerekli, resmi API yok. Rate limiting'e dikkat.

### NosyAPI — Düşük Maliyetli
```
BIST Fiyatları: https://www.nosyapi.com/api/bist-hisse-senetleri-fiyatlari
```
> 50 ücretsiz kredi, sonra ücretli.

---

## ⚙️ Geliştirme Kuralları

### Kod Stili
- TypeScript strict mode
- ESLint + Prettier
- Component dosya adları PascalCase: `StockCard.tsx`
- Utility dosya adları camelCase: `formatters.ts`
- API route'lar kebab-case dizinlerde
- Her component'te `"use client"` veya `"use server"` direktifi açık olacak

### Git Branching
- `main` → production (Vercel auto-deploy)
- `develop` → geliştirme
- `feature/xxx` → özellik branch'leri
- Commit mesajları Türkçe, conventional commits: `feat: hisse detay sayfası eklendi`

### Performans
- Server Components varsayılan, client sadece interaktif parçalar
- Fiyat verisi ISR (Incremental Static Regeneration) ile 5dk cache
- Finansal tablolar günlük regenerate
- Görseller next/image ile optimize

### Güvenlik
- API key'ler .env.local'de, asla commit'lenmeyen
- Rate limiting API route'larında
- KAP scraping'de respectful crawling (1-2 saniye delay)

---

## 🚀 Deployment Akışı

```
1. Geliştirme    → localhost:3000
2. Git push      → GitHub
3. Vercel        → Otomatik build & deploy (frontend + API routes)
4. AWS EC2       → Worker'lar (cron ile çalışır, DB'ye yazar)
5. Supabase/RDS  → PostgreSQL (hem Vercel hem EC2 erişir)
```

---

## 📝 Önemli Notlar

- Bu proje Fatih'in focusoda.com markası altında yayınlanacak
- Yatırım tavsiyesi niteliği taşımaz, bilgilendirme amaçlıdır — disclaimer her sayfada olmalı
- BIST veri lisansı konusu: Gecikmelidir (15dk) ve ticari kullanımda lisans gerekebilir — MVP'de problem değil, ölçeklenirken dikkat
- Türkçe UI, kodda İngilizce değişken/fonksiyon adları
- Mobile-first tasarım (yatırımcıların %70+'ı mobil kullanıyor)
