# Portfoy Takibi Sayfasi

## Amac

Kullanicilarin BIST hisselerinden olusturdugu portfoyu takip etmelerine, kar/zarar analizini goruntulemelrine ve risk degerlendirmesi yapmalarini saglar. Tum veriler client-side state'te tutulur, backend bagimliligi yoktur.

## Dosya

`src/app/portfoy/page.tsx` -- "use client" interactive component

## Ozellikler

### A) Pozisyon Ekleme Formu
- Hisse arama/secme dropdown'u (MOCK_STOCKS'tan filtreleme)
- Adet ve alis fiyati input'lari
- Secilen hissenin guncel fiyati alis fiyati olarak on-doldurulur

### B) Demo Portfoy
Sayfa 6 ornek pozisyon ile baslar: THYAO, GARAN, ASELS, BIMAS, KCHOL, TUPRS

### C) Ozet Kartlari (6 kart)
- Toplam Deger, Toplam Maliyet, Toplam Kar/Zarar (TL + %), Gunluk Degisim (TL + %), Pozisyon Sayisi, En Karli / En Zararli Hisse

### D) Pozisyonlar Tablosu
- Sutunlar: Ticker, Ad, Adet, Alis Fiyati, Guncel Fiyat, K/Z (TL), K/Z (%), Gunluk, Agirlik (%), Sil
- Tum sutunlardan siralama destegi
- Agirlik progress bar ile gosterilir
- Pozisyon silme butonu

### E) Gorsellestirmeler (pure CSS)
1. **Sektor dagilimi** -- conic-gradient donut chart
2. **Hisse dagilimi** -- yatay cubuk grafik
3. **Kar/Zarar dagilimi** -- merkezden yayilan yatay cubuklar (yesil/kirmizi)
4. **Portfoy skoru** -- agirlikli ortalama snowflake skoru, score-ring ile gosterilir

### F) Risk Analizi
- Cesitlendirme skoru (0-100, sektor cesitliligine gore)
- En buyuk pozisyon agirligi (konsantrasyon riski)
- Sektor yogunlasmasi
- Otomatik oneriler (konsantrasyon uyarisi, cesitlendirme tavsiyesi vb.)

## Parametreler / Props

Yok -- standalone page component. Tum state `useState` ile yonetilir.

## Kullanim

`/portfoy` URL'sine gidildiginde otomatik render edilir. Navbar'da "Portfoy" linki eklenmistir.

## Edge Case'ler

- Portfoy bos oldugunda bos durum mesaji gosterilir
- MOCK_STOCKS'ta bulunmayan ticker eklenmesine izin verilmez (dropdown'dan secim zorunlu)
- Sifir veya negatif adet/fiyat engellenir
- Tek pozisyon kaldiginda risk analizi uyari verir
