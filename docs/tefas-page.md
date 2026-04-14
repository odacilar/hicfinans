# TEFAS Fon Analizi Sayfasi

## Amac

TEFAS (Turkiye Elektronik Fon Alim Satim Platformu) fonlarinin detayli analizini ve yatirimci profiline gore portfoy onerilerini sunan sayfa.

## Dosyalar

- `src/lib/mock-tefas-data.ts` -- Mock veri dosyasi (TefasFund, PortfolioRecommendation tipleri ve ornekleri)
- `src/app/fonlar/tefas/page.tsx` -- TEFAS analiz sayfasi (client component)
- `src/app/fonlar/page.tsx` -- Fon Yoneticileri sayfasi (sub-nav eklendi)

## Veri Modeli

### TefasFund

| Alan | Tip | Aciklama |
|------|-----|----------|
| code | string | Fon kodu (ornek: TI2, IPB) |
| name | string | Fon tam adi |
| manager | string | Portfoy yonetim sirketi |
| type | FundType | Fon tipi (Hisse Senedi, Borclanma Araclari, Altin, vb.) |
| price | number | Birim pay degeri |
| returnDaily/Weekly/Monthly/Ytd/1y/3y | number | Getiri yuzdesi |
| aum | number | Fon buyuklugu (TL) |
| investorCount | number | Yatirimci sayisi |
| managementFee | number | Yonetim ucreti (%) |
| riskLevel | 1-7 | Risk seviyesi |
| sharpeRatio | number | Sharpe orani |
| volatility | number | Yillik volatilite (%) |
| maxDrawdown | number | Maksimum dusus (%) |
| composition | array | Portfoy dagilimi (label + weight) |
| topHoldings | array? | Buyuk pozisyonlar (hisse fonlari icin) |
| strategyFit | object | Strateji uyum skorlari (0-100) |

### PortfolioRecommendation

4 hazir portfoy onerisi: Muhafazakar, Dengeli, Buyume, Agresif.
Her biri fon kodlari, agirliklar, gerekceler ve uyarilar icerir.

## Sayfa Bolümleri

1. **Ozet Kartlar** -- Toplam fon, AUM, ort. YTD getiri, en iyi performans
2. **Filtre/Siralama** -- Fon tipi filtreleri (pill-shaped), siralama dropdown
3. **Fon Kartlari** -- Her fon icin detay karti (getiri, risk, kompozisyon bar)
4. **Portfoy Oneri Motoru** -- 4 strateji karti (donut chart, fon dagilimi, uyarilar)
5. **Strateji Kirilganlik Analizi** -- Makroekonomik senaryo matrisi

## Kullanim Ornekleri

Sayfa `/fonlar/tefas` adresinden erisilebilir. `/fonlar` sayfasindan sub-nav tab'lari ile gecis yapilabilir.

## Edge Cases

- Fon tipi filtresinde sonuc yoksa "Bu kategoride fon bulunamadi" mesaji gosterilir
- Tum getiri degerleri pozitif/negatif renklendirmeli (yesil/kirmizi)
- Top holdings sadece ilgili fonlarda gosterilir (expandable)
- Mobil gorunumde kirilganlik matrisi stacked kart formatinda gosterilir
