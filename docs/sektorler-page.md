# Sektor Analizi Sayfasi

## Amac

BIST sektorlerinin karsilastirmali analizi, performans takibi ve rotasyon goruntuleme sayfasi. Kullanici sektorler arasi farklari gorebilir, siralamalari degistirebilir ve iki sektoru yan yana karsilastirabilir.

## Dosyalar

| Dosya | Aciklama |
|-------|----------|
| `src/app/sektorler/page.tsx` | Sayfa bileseni ("use client") |
| `src/lib/mock-sector-data.ts` | Mock sektor verileri ve rotasyon datasi |

## Veri Modeli

### SectorData
- `name` -- Sektor adi (ornek: "Bankacilik")
- `stockCount` -- Sektordeki hisse sayisi
- `totalMarketCap` -- Toplam piyasa degeri (TL)
- `avgChange` -- Ortalama gunluk degisim yuzde
- `avgPE`, `avgPB`, `avgROE`, `avgDividendYield`, `avgNetMargin` -- Ortalama finansal oranlar
- `weeklyPerformance`, `monthlyPerformance`, `ytdPerformance` -- Donem performanslari
- `topStock`, `worstStock` -- En iyi ve en kotu hisse ticker'i
- `marketCapShare` -- BIST toplam piyasa degerindeki pay yuzde
- `momentum` -- "guclu" | "yukselen" | "notr" | "zayifliyor" | "dususte"

### SectorRotation
- `period` -- Ceyrek donemi (ornek: "2025-Q4")
- `sectors[]` -- Her sektor icin donem performansi

## Sayfa Bolumleri

### A) Header
Gradient baslik "Sektor Analizi" ve aciklama metni.

### B) Sektor Kartlari
- Grid gorunumde glass-card'lar (responsive: 1/2/3/4 kolon)
- Momentum badge'i renkli (guclu=yesil, dususte=kirmizi)
- Siralama secenekleri: Performans, Piyasa Degeri, F/K
- Her kartta: sektor adi, hisse sayisi, ort. degisim, piy. degeri, F/K, en iyi hisse, BIST payi progress bar

### C) Karsilastirma Tablosu
- Tum sektorler satirlarda, metrikler sutunlarda
- Sutun basligina tiklayarak siralama (asc/desc toggle)
- En iyi deger yesil, en kotu deger kirmizi ile vurgulanir

### D) Sektor Rotasyon Isitma Haritasi
- Satirlar: Sektorler (en buyuk 12 tanesi)
- Sutunlar: Son 6 ceyrek
- Hucre rengi: Yesil=pozitif, kirmizi=negatif performans
- Yuzde degerleri hucre icinde gosterilir

### E) Sektor vs Sektor Karsilastirma
- Iki dropdown ile sektor secimi
- Yan yana istatistik kartlari (12 metrik)
- Her sektordeki hisseler ticker + degisim ile listelenir
- Hisse ticker'lari hisse detay sayfasina link verir

## Edge Case'ler

- Tek hisseli sektorlerde topStock == worstStock olur
- Dropdown'da ayni sektor secildiginde her iki kart ayni veriyi gosterir
- Cok uzun sektor isimleri `truncate` ile kesilir
- Mobilde tablo yatay scroll yapar (min-width constraint)

## Kullanim

Sayfa `/sektorler` URL'inde erisilir. Navbar'a "Sektorler" linki eklenmistir.
