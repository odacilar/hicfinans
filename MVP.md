# MVP.md — BistWall Minimum Viable Product İnşa Planı

> Versiyon: 1.0
> Tarih: 11 Nisan 2026
> Tahmini Süre: 3 hafta (yarı zamanlı çalışma ile)

---

## 🎯 MVP Kapsamı

### Dahil Olan (MVP)
- [x] BIST-100 hisseleri (fiyat + temel veriler)
- [x] Snowflake (5 boyutlu) skor sistemi
- [x] Hisse tarama (screener) — 10+ filtre kriteri
- [x] Hisse detay sayfası (grafik, finansal tablo, skorlar)
- [x] KAP haberleri akışı (RSS bazlı)
- [x] Analist hedef fiyat konsensüsü
- [x] Günlük otomatik veri güncelleme
- [x] Responsive tasarım (mobile-first)
- [x] Türkçe arayüz

### Dahil Olmayan (Post-MVP)
- [ ] Portföy takip sistemi
- [ ] Kullanıcı hesap/kayıt sistemi
- [ ] Watchlist & alarm sistemi
- [ ] Temettü takvimi
- [ ] Sektör karşılaştırma sayfası
- [ ] AI destekli doğal dil sorgu ("Düşük borçlu büyüyen teknoloji şirketleri göster")
- [ ] Excel/PDF rapor export
- [ ] Push notification
- [ ] Karanlık/aydınlık tema toggle

---

## 🗓️ Sprint Planı (3 Hafta)

---

### SPRINT 1 — Temel & Veri Katmanı (Gün 1-7)

#### Gün 1-2: Proje İskelet ve Veritabanı

**Adım 1.1 — Proje Kurulumu**
```bash
npx create-next-app@latest bistwall --typescript --tailwind --app --src-dir
cd bistwall
npm install prisma @prisma/client recharts zustand
npm install -D @types/node
npx prisma init
```

**Adım 1.2 — Veritabanı Bağlantısı**
- Supabase'de yeni PostgreSQL veritabanı oluştur
- `.env.local` dosyasına `DATABASE_URL` ekle
- Prisma schema'yı CLAUDE.md'deki modele göre oluştur
- `npx prisma db push` ile migration yap

**Adım 1.3 — Seed Data**
- BIST-100 şirket listesini JSON olarak hazırla
- `scripts/seed.ts` — Şirket bilgilerini (ticker, isim, sektör) veritabanına yaz
- Kaynak: Bigpara API'den hisse listesi çekilecek

```typescript
// scripts/seed.ts temel yapısı
// 1. Bigpara API'den BIST-100 listesini çek
// 2. Her şirket için Company kaydı oluştur
// 3. Sektör eşleştirmesi yap
```

**Çıktı:** Çalışan Next.js projesi, bağlı veritabanı, 100 şirket seed edilmiş.

---

#### Gün 3-4: Veri Toplama Servisleri

**Adım 2.1 — Bigpara Fiyat Servisi**
```typescript
// src/services/bigpara.ts
// - fetchStockList(): Tüm hisse listesi
// - fetchStockDetail(ticker): Tek hisse detay verisi
// - fetchAllPrices(): Tüm fiyatları toplu çek
// Rate limit: 1 istek/saniye, retry logic
```

**Adım 2.2 — Yahoo Finance Servisi**
```typescript
// src/services/yahoo.ts
// - fetchQuote(ticker): Anlık fiyat + piyasa değeri
// - fetchFinancials(ticker): Finansal tablolar
// - fetchHistoricalPrices(ticker, period): Tarihsel fiyatlar
// Ticker format: "THYAO.IS"
// Error handling: Yahoo bazen 429 döner, exponential backoff uygula
```

**Adım 2.3 — KAP Haber Servisi**
```typescript
// src/services/kap.ts
// - fetchRssFeed(): KAP RSS'den son bildirimleri çek
// - parseKapNotification(item): RSS item'ı parse et
// - categorizeNotification(title): Bildirim türünü belirle
//   Kategoriler: "bilanço", "temettü", "genel_kurul", "özel_durum",
//                "sermaye_artırımı", "yönetim", "diğer"
// - saveToDb(notifications): Veritabanına kaydet
```

**Adım 2.4 — Analist Veri Servisi**
```typescript
// src/services/analyst.ts
// Kaynak seçenekleri (kolaydan zora):
// 1. TradingView widget embed (en kolay, ama bağımlılık)
// 2. Aracı kurum sitelerinden scraping (yasal risk)
// 3. Manuel veri girişi + Claude API ile güncelleme
//
// MVP için: Basit bir JSON dosyasından başla
// Post-MVP: Otomatik scraping pipeline
```

**Çıktı:** 4 veri servisi çalışır durumda, test edilmiş.

---

#### Gün 5-6: Cron Worker'lar ve İlk Veri Doldurma

**Adım 3.1 — Günlük Fiyat Güncelleme Worker**
```typescript
// workers/daily-prices.ts
// Çalışma zamanı: Her gün 18:30 (borsa kapanışından sonra)
// 1. Bigpara API'den tüm BIST-100 fiyatlarını çek
// 2. PriceData tablosuna upsert et
// 3. Company.marketCap güncelle
// 4. Log: başarılı/başarısız ticker sayısı
```

**Adım 3.2 — Finansal Tablo Güncelleme Worker**
```typescript
// workers/quarterly-financials.ts
// Çalışma zamanı: Günlük kontrol, yeni bilanço varsa güncelle
// 1. Yahoo Finance'dan finansal tabloları çek
// 2. FinancialData tablosuna upsert et
// 3. Oran hesaplamalarını yap (F/K, PD/DD, ROE vb.)
// 4. StockScore tablosunu güncelle (Snowflake skorları)
```

**Adım 3.3 — KAP Monitor Worker**
```typescript
// workers/kap-monitor.ts
// Çalışma zamanı: Her 30 dakikada bir (borsa saatlerinde)
// 1. KAP RSS feed'i kontrol et
// 2. Yeni bildirimleri parse et
// 3. Ticker eşleştirmesi yap
// 4. Claude API ile özet oluştur (opsiyonel, maliyete dikkat)
// 5. KapNews tablosuna kaydet
```

**Adım 3.4 — İlk Toplu Veri Doldurma**
```bash
# Sıralı çalıştır:
npx ts-node scripts/seed.ts                    # Şirket listesi
npx ts-node workers/daily-prices.ts            # Son fiyatlar
npx ts-node workers/quarterly-financials.ts    # Finansal tablolar
npx ts-node workers/kap-monitor.ts             # KAP haberleri
```

**Çıktı:** Veritabanında 100 şirketin fiyat, finansal ve KAP verileri dolu.

---

#### Gün 7: Skor Hesaplama Motoru

**Adım 4.1 — Snowflake Skor Hesaplama**
```typescript
// src/lib/scoring.ts

export function calculateValueScore(financial: FinancialData, sectorAvg: SectorAverages): number {
  // F/K: Sektör ortalamasının altındaysa yüksek puan
  // PD/DD: < 1 ise yüksek puan
  // FD/FAVÖK: Sektör ortalamasının altındaysa yüksek puan
  // Return: 0-5 arası float
}

export function calculateFutureScore(financials: FinancialData[], analysts: AnalystRating[]): number {
  // Gelir büyüme trendi (son 3 yıl)
  // Kar büyüme trendi (son 3 yıl)
  // Analist konsensüs upside %
  // Return: 0-5 arası float
}

export function calculatePastScore(financials: FinancialData[]): number {
  // Ortalama ROE (5 yıl)
  // Gelir büyümesi (5 yıl CAGR)
  // Karlılık istikrarı
  // Return: 0-5 arası float
}

export function calculateHealthScore(financial: FinancialData): number {
  // Borç/Özkaynak < 1 ise yüksek
  // Cari oran > 1.5 ise yüksek
  // Faiz karşılama oranı > 3 ise yüksek
  // FCF pozitif ise bonus
  // Return: 0-5 arası float
}

export function calculateDividendScore(financials: FinancialData[]): number {
  // Temettü verimi
  // Son 5 yılda kaç kez temettü ödemiş
  // Payout ratio < 70% ise sürdürülebilir
  // Return: 0-5 arası float
}
```

**Adım 4.2 — Sektör Ortalamaları Hesaplama**
```typescript
// src/lib/sector-averages.ts
// Her sektör için medyan F/K, PD/DD, FD/FAVÖK, ROE hesapla
// Bu değerler scoring'de benchmark olarak kullanılacak
```

**Çıktı:** Her şirket için 5 boyutlu skor hesaplanmış ve DB'ye yazılmış.

---

### SPRINT 2 — Frontend & UI (Gün 8-14)

#### Gün 8-9: Layout ve Ana Sayfa

**Adım 5.1 — Global Layout**
```typescript
// src/app/layout.tsx
// - Dark theme (varsayılan)
// - Font yükleme (Plus Jakarta Sans, DM Sans, JetBrains Mono)
// - Navbar: Logo, Hisseler, Tarayıcı, KAP, (gelecek: Portföy)
// - Footer: Disclaimer, Focusoda branding
// - Meta tags: SEO, Open Graph
```

**Adım 5.2 — Ana Sayfa Dashboard**
```typescript
// src/app/page.tsx
// Bölümler:
// 1. Piyasa Özeti Kartları
//    - BIST 100 endeksi + değişim %
//    - BIST 30 endeksi + değişim %
//    - Dolar/TL kuru
//    - Toplam piyasa değeri
//
// 2. Günün Öne Çıkanları (3 kart)
//    - En çok yükselen 5 hisse
//    - En çok düşen 5 hisse
//    - En yüksek hacimli 5 hisse
//
// 3. Son KAP Haberleri (compact liste, son 10)
//
// 4. En Yüksek Skorlu Hisseler (Snowflake)
//    - Top 10 genel skor ile, mini snowflake chart ile
```

**Çıktı:** Çalışan ana sayfa, gerçek veriyle.

---

#### Gün 10-11: Hisse Listesi ve Tarayıcı

**Adım 6.1 — Hisse Listesi Sayfası**
```typescript
// src/app/hisseler/page.tsx
// - Tablo görünümü (varsayılan)
// - Kart görünümü (toggle)
// - Sıralama: Piyasa değeri, F/K, değişim %, skor
// - Arama: Ticker veya şirket adı ile
// - Sektör filtresi (dropdown)
// - Sayfalama (25 hisse/sayfa)
```

**Adım 6.2 — Gelişmiş Tarayıcı (Screener)**
```typescript
// src/app/tarayici/page.tsx
// Filtre Kriterleri (min-max range slider):
//
// Değerleme:
//   - F/K oranı
//   - PD/DD oranı
//   - FD/FAVÖK
//   - Piyasa değeri
//
// Karlılık:
//   - Net kar marjı (%)
//   - Brüt kar marjı (%)
//   - ROE (%)
//   - ROA (%)
//
// Büyüme:
//   - Gelir büyümesi (YoY %)
//   - Net kar büyümesi (YoY %)
//
// Finansal Sağlık:
//   - Borç/Özkaynak
//   - Cari oran
//
// Temettü:
//   - Temettü verimi (%)
//
// Skor:
//   - Genel skor (0-5)
//   - Değerleme skoru (0-5)
//   - Sağlık skoru (0-5)
//
// Diğer:
//   - Sektör (multi-select)
//   - Analist tavsiyesi (AL/TUT/SAT)
//
// Sonuç: Filtrelenen hisseler tablo + export CSV
```

**Adım 6.3 — Filter Panel Bileşeni**
```typescript
// src/components/screener/FilterPanel.tsx
// - Accordion tarzı kategori grupları
// - Range slider (min-max) her kriter için
// - Multi-select dropdown (sektör, analist tavsiyesi)
// - "Filtreleri Temizle" butonu
// - Aktif filtre sayısı badge
// - Filtre değiştiğinde URL query params güncelle (bookmark edilebilir)
```

**Çıktı:** Çalışan hisse listesi ve filtreleme sistemi.

---

#### Gün 12-13: Hisse Detay Sayfası

**Adım 7.1 — Detay Sayfası Ana Yapısı**
```typescript
// src/app/hisseler/[ticker]/page.tsx
// URL: /hisseler/THYAO
//
// Sayfa Bölümleri (yukarıdan aşağıya):
//
// 1. BAŞLIK BANDI
//    - Şirket adı + ticker
//    - Güncel fiyat + değişim (renk kodlu)
//    - Piyasa değeri
//    - Sektör badge
//    - Snowflake mini chart (sağ üst)
//
// 2. SNOWFLAKE CHART (büyük, merkezi)
//    - 5 boyutlu radar chart
//    - Her boyutun skoru + renk kodu
//    - Hover'da detay tooltip
//
// 3. DEĞERLEME BÖLÜMÜ
//    - F/K, PD/DD, FD/FAVÖK kartları
//    - Sektör ortalaması ile karşılaştırma bar
//    - Basit DCF değerleme (opsiyonel)
//
// 4. FİNANSAL TABLOLAR
//    - Tab: Gelir Tablosu | Bilanço | Nakit Akışı
//    - Son 5 yıl/çeyrek toggle
//    - Bar chart + tablo
//
// 5. ANALİST TAVSİYELERİ
//    - Konsensüs bar (AL/TUT/SAT dağılımı)
//    - Hedef fiyat aralığı (min/ortalama/max)
//    - Upside/downside yüzde
//    - Son analist raporları listesi
//
// 6. KAP HABERLERİ
//    - Bu hisseye ait son 20 KAP bildirimi
//    - AI özet (varsa)
//    - Link ile KAP'a yönlendirme
//
// 7. RİSK VE ÖDÜL
//    - Risk faktörleri listesi (kırmızı)
//    - Fırsat faktörleri listesi (yeşil)
//    - AI tarafından oluşturulmuş
```

**Adım 7.2 — Snowflake Radar Chart Bileşeni**
```typescript
// src/components/charts/SnowflakeChart.tsx
// - Recharts RadarChart kullan
// - 5 eksen: Value, Future, Past, Health, Dividend
// - Her eksen farklı renk
// - Hover'da tooltip
// - Responsive (mobilde küçülür)
// - Animasyonlu giriş
```

**Adım 7.3 — Finansal Tablo Bileşeni**
```typescript
// src/components/stock/FinancialTable.tsx
// - Yıllık / Çeyreklik toggle
// - Satırlar: Hasılat, Brüt Kar, FAVÖK, Net Kar, vb.
// - Sütunlar: Son 5 dönem
// - Renk kodlu değişim (YoY)
// - Sayılar TL formatında (milyar/milyon kısaltma)
```

**Çıktı:** Tam fonksiyonel hisse detay sayfası.

---

#### Gün 14: KAP Sayfası ve Analist Bölümü

**Adım 8.1 — KAP Haberleri Sayfası**
```typescript
// src/app/kap/page.tsx
// - Zaman akışı (timeline) görünümü
// - Filtreler: Sektör, kategori (bilanço, temettü, vb.), tarih aralığı
// - Hisse bazlı filtre (arama)
// - Her haberde: Tarih, ticker, başlık, kategori badge, AI özet (kısa)
// - Tıklanınca KAP'a yönlendirme
```

**Adım 8.2 — Analist Konsensüs Bileşeni**
```typescript
// src/components/stock/AnalystConsensus.tsx
// - Yatay bar: AL (yeşil) | TUT (sarı) | SAT (kırmızı) oranları
// - Hedef fiyat göstergesi:
//   [MIN -------- ORTALAMA -------- MAX]
//            ↑ Güncel Fiyat
// - Upside/Downside yüzde (büyük font)
// - Son 5 analist raporu listesi (tarih, kaynak, hedef fiyat, tavsiye)
```

**Çıktı:** KAP sayfası ve analist bileşeni tamamlanmış.

---

### SPRINT 3 — Entegrasyon & Deploy (Gün 15-21)

#### Gün 15-16: API Routes ve Veri Akışı

**Adım 9.1 — API Route'ları**
```typescript
// src/app/api/stocks/route.ts
// GET /api/stocks?sector=Banka&minPE=5&maxPE=15&sort=marketCap&order=desc&page=1
// - Tüm filtre parametrelerini kabul et
// - Prisma query builder ile dinamik sorgu
// - Sayfalama (25/sayfa)
// - Cache: 5 dakika (ISR veya API cache)

// src/app/api/stocks/[ticker]/route.ts
// GET /api/stocks/THYAO
// - Şirket bilgisi + son fiyat + finansal tablolar + skorlar + KAP + analist
// - Tek sorguda tüm ilişkili verileri join et
// - Cache: 5 dakika

// src/app/api/kap/route.ts
// GET /api/kap?ticker=THYAO&category=bilanco&limit=20
// - KAP haberleri listesi
// - Filtrele: ticker, kategori, tarih aralığı

// src/app/api/screener/route.ts
// POST /api/screener
// Body: { filters: { peMin: 5, peMax: 15, sector: ["Banka"], ... } }
// - Gelişmiş filtreleme sorgusu
// - Sonuç: Eşleşen hisse listesi + temel veriler
```

**Adım 9.2 — Frontend API Helper**
```typescript
// src/lib/api.ts
// - fetchStocks(filters): Hisse listesi
// - fetchStockDetail(ticker): Hisse detay
// - fetchKapNews(filters): KAP haberleri
// - runScreener(filters): Tarama
// - SWR veya TanStack Query ile cache management
```

**Çıktı:** Frontend ile backend tam entegre.

---

#### Gün 17-18: Polishing ve UX İyileştirmeleri

**Adım 10.1 — Loading States**
- Skeleton loader'lar (her bileşen için)
- Suspense boundary'ler
- Error boundary'ler ve fallback UI'lar

**Adım 10.2 — Responsive Tasarım Kontrolü**
- Mobile (375px): Tek kolon, hamburger menü, swipeable kartlar
- Tablet (768px): 2 kolon grid, sidebar filtre
- Desktop (1280px+): Full layout, sticky sidebar

**Adım 10.3 — SEO ve Meta**
```typescript
// Her sayfa için:
// - Dynamic title: "THYAO - Türk Hava Yolları | BistWall"
// - Meta description: Şirket + skor özeti
// - Open Graph image (dinamik, opsiyonel)
// - Structured data (JSON-LD)
// - Sitemap.xml (tüm hisse sayfaları)
// - robots.txt
```

**Adım 10.4 — Disclaimer**
```
⚠️ Bu platform yatırım tavsiyesi niteliği taşımamaktadır.
Sunulan veriler bilgilendirme amaçlıdır. Yatırım kararlarınızı
almadan önce lisanslı yatırım danışmanınıza danışınız.
Veriler 15 dakika gecikmeli olabilir.
```

**Çıktı:** Production-ready UI.

---

#### Gün 19-20: Deployment

**Adım 11.1 — Vercel Deployment**
```bash
# 1. GitHub repo oluştur
git init && git remote add origin git@github.com:focusoda/bistwall.git

# 2. Vercel'e bağla
npx vercel link

# 3. Environment variables ayarla (Vercel dashboard'dan):
#    DATABASE_URL
#    CLAUDE_API_KEY
#    NEXT_PUBLIC_APP_URL

# 4. Deploy
npx vercel --prod

# 5. Custom domain: bistwall.focusoda.com
#    Vercel dashboard → Domains → Add
```

**Adım 11.2 — AWS EC2 Worker Setup**
```bash
# Mevcut EC2 instance'ında (Windows Server 2022):
# 1. Node.js yükle (zaten var)
# 2. Worker scriptlerini kopyala
# 3. Windows Task Scheduler ile cron ayarla:
#    - daily-prices.ts → Her gün 18:30
#    - quarterly-financials.ts → Her gün 06:00
#    - kap-monitor.ts → Her 30 dakika (09:00-18:00)
#    - analyst-scraper.ts → Haftalık Pazartesi 07:00

# Alternatif: Linux EC2 + systemd timer veya crontab
```

**Adım 11.3 — Monitoring**
```typescript
// Basit health check endpoint:
// GET /api/health
// Response: { status: "ok", lastPriceUpdate: "...", stockCount: 100, ... }
//
// n8n workflow: Her saat /api/health çek, hata varsa Telegram/email bildirim
```

**Çıktı:** Canlı, erişilebilir, günlük güncellenen platform.

---

#### Gün 21: Test ve Lansman

**Adım 12.1 — Smoke Test Checklist**
```
□ Ana sayfa yükleniyor, piyasa verileri doğru
□ Hisse listesi 100 hisse gösteriyor
□ Filtreler çalışıyor (F/K, sektör, piyasa değeri)
□ Tarayıcı multi-filtre destekliyor
□ Hisse detay sayfası tüm bölümleri gösteriyor
□ Snowflake chart doğru render ediliyor
□ Finansal tablolar doğru (spot check: THYAO, GARAN, ASELS)
□ KAP haberleri akıyor
□ Analist tavsiyeleri görünüyor
□ Mobil responsive çalışıyor
□ Sayfa yüklenme süresi < 3 saniye
□ Disclaimer her sayfada görünüyor
□ bistwall.focusoda.com erişilebilir
```

**Adım 12.2 — Soft Launch**
- LinkedIn'de duyuru postu (Türkçe)
- focusoda.com blog yazısı
- 5-10 yakın yatırımcı arkadaşa beta testi

---

## 📊 Teknik Mimari Diyagramı

```
┌─────────────────────────────────────────────────────────┐
│                    KULLANICI (Tarayıcı)                  │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐ │
│  │ Ana Sayfa│  │ Hisseler │  │Tarayıcı │  │   KAP    │ │
│  └────┬─────┘  └────┬─────┘  └────┬────┘  └────┬─────┘ │
└───────┼──────────────┼────────────┼─────────────┼───────┘
        │              │            │             │
        ▼              ▼            ▼             ▼
┌─────────────────────────────────────────────────────────┐
│              VERCEL (Next.js App)                        │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              API Routes (/api/*)                     │ │
│  │  /stocks  /stocks/[ticker]  /screener  /kap  /health│ │
│  └───────────────────────┬─────────────────────────────┘ │
└──────────────────────────┼──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              POSTGRESQL (Supabase / AWS RDS)             │
│                                                          │
│  Company | PriceData | FinancialData | StockScore        │
│  KapNews | AnalystRating                                 │
└──────────────────────────┬──────────────────────────────┘
                           ▲
                           │
┌──────────────────────────┼──────────────────────────────┐
│              AWS EC2 (Worker'lar)                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Günlük Fiyat │  │ Çeyreklik    │  │ KAP Monitor   │  │
│  │ Worker       │  │ Finansal     │  │ (30dk cycle)  │  │
│  │ (18:30)      │  │ Worker (06:00│  │               │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                 │                   │          │
│         ▼                 ▼                   ▼          │
│  ┌────────────┐    ┌────────────┐      ┌────────────┐   │
│  │ Bigpara    │    │ Yahoo      │      │ KAP RSS    │   │
│  │ API        │    │ Finance    │      │ Feed       │   │
│  └────────────┘    └────────────┘      └────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Claude API — KAP Özetleme & Skor Hesaplama       │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 💰 Maliyet Tahmini (Aylık)

| Kalem | Fiyat | Not |
|-------|-------|-----|
| Vercel (Hobby) | $0 | MVP için yeterli |
| Supabase (Free) | $0 | 500MB DB, 2GB bandwidth |
| AWS EC2 (mevcut) | ~$0 | Zaten çalışıyor |
| Claude API | ~$5-15 | KAP özetleme, günlük ~100 çağrı |
| Domain (subdomain) | $0 | focusoda.com altında |
| **TOPLAM** | **~$5-15/ay** | |

> Ölçekleme gerektiğinde: Supabase Pro ($25/ay), Vercel Pro ($20/ay)

---

## 🔄 Post-MVP Yol Haritası

### v1.1 (Hafta 4-5)
- Kullanıcı hesap sistemi (NextAuth.js)
- Watchlist (izleme listesi)
- Hisse bazlı fiyat alarmı

### v1.2 (Hafta 6-8)
- Portföy takip sistemi
- Temettü takvimi
- Sektör karşılaştırma sayfası
- PDF rapor export

### v1.3 (Hafta 9-12)
- AI doğal dil sorgu ("Düşük F/K'lı teknoloji hisselerini göster")
- Detaylı DCF değerleme modeli
- Insider trading takibi
- Push notification (web)

### v2.0 (Ay 4+)
- Mobil uygulama (React Native / Expo)
- Premium üyelik sistemi (Stripe)
- Gelişmiş AI analiz raporları
- API açma (3. parti geliştiriciler için)

---

## ✅ Başlangıç Kontrol Listesi

Claude Code'da ilk oturumda yapılacaklar:

```
1. [ ] Bu CLAUDE.md ve MVP.md dosyalarını proje root'una koy
2. [ ] next-app oluştur (npx create-next-app)
3. [ ] Prisma + Supabase bağlantısı kur
4. [ ] Schema'yı migrate et
5. [ ] Bigpara API'yi test et (curl ile)
6. [ ] Seed script çalıştır
7. [ ] İlk sayfa: /hisseler listesi (mock data ile)
8. [ ] İlk bileşen: SnowflakeChart (Recharts)
```

---

> **Not:** Bu MVP planı iteratif çalışmaya uygundur. Her gün sonunda çalışan bir şey olmalı.
> "Done is better than perfect" — MVP'de mükemmellik değil, çalışan ürün hedefliyoruz.
