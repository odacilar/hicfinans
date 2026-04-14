# Ekonomik Takvim Sayfasi

## Amac

Turkiye ekonomisini etkileyen makroekonomik veri aciklamalarini takvim formatinda gosterir. TCMB faiz kararlari, TUFE/UFE enflasyon verileri, GSYIH buyume, istihdam, dis ticaret, sanayi uretimi gibi temel ekonomik gostergeleri tarih sirasina gore listeler.

## Dosyalar

- **Sayfa:** `src/app/takvim/page.tsx` (client component)
- **Mock veri:** `src/lib/mock-economic-data.ts`

## Veri Modeli

### EconomicEvent
| Alan | Tip | Aciklama |
|------|-----|----------|
| id | string | Benzersiz tanimlayici |
| date | string | ISO tarih (YYYY-MM-DD) |
| time | string | Saat ("14:00") veya "\u2014" |
| title | string | Veri adi ("TCMB Faiz Karari") |
| category | EventCategory | faiz, enflasyon, buyume, istihdam, dis_ticaret, sanayi, guven, diger |
| importance | EventImportance | yuksek, orta, dusuk |
| source | string | Kaynak kurum (TCMB, TUIK, Hazine, vb.) |
| previous | string | Onceki donem degeri |
| forecast | string \| null | Konsensus beklenti |
| actual | string \| null | Gerceklesen deger (henuz aciklanmadiysa null) |
| impact | string | Kisa etki aciklamasi |
| affectedSectors | string[] | Etkilenen sektorler |

## Sayfa Bolümleri

### 1. Header
Gradient baslik ve aciklama metni.

### 2. Bu Hafta Onemli Veriler
Onumuzdeki 7 gun icindeki yuksek onemli verileri gosterir. Geri sayim etiketi (Bugun, Yarin, X gun sonra).

### 3. Filtre Cubugu
- **Ay tablari:** Nisan, Mayis, Haziran
- **Onem filtresi:** Tumunu Goster, Yuksek (kirmizi), Orta (sari), Dusuk (gri)
- **Kategori filtresi:** Tumunu Goster, Faiz, Enflasyon, Buyume, Istihdam, Dis Ticaret, Sanayi, Guven, Diger

### 4. Takvim Zaman Cizgisi
Tarihe gore gruplanmis etkinlikler. Her grup:
- Tarih basligi (gun adi ile)
- Etkinlik kartlari: saat, baslik, onem noktasi, kaynak badge, onceki/beklenti/gerceklesen degerleri, etki metni, etkilenen sektor badge'leri
- Gerceklesen deger beklentiden iyiyse yesil, kotuyse kirmizi
- Gecmis etkinlikler soluk, gelecek parlak

### 5. Etki Matrisi
Ekonomik veri kategorileri (satirlar) x sektorler (sutunlar) tablosu. Hucrelerde "Yuksek", "Orta", "Dusuk" etiketleri renkli olarak gosterilir.

## Kullanim Ornekleri

Sayfa `/takvim` adresinden erisilebilir. Navbar'da "Takvim" linki eklenmistir.

## Edge Case'ler

- Filtrelere uygun veri yoksa bos durum mesaji gosterilir
- Gerceklesen degeri olmayan (henuz aciklanmamis) etkinlikler icin "\u2014" gosterilir
- Bu hafta yuksek onemli veri yoksa highlight bolumu gizlenir
- Mobil cihazlarda etki matrisi yatay kaydirma ile gosterilir
