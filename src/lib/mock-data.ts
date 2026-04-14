import type { StockListItem, StockDetail } from "@/types/stock";
import type { KapNewsItem } from "@/types/kap";
import type { FinancialPeriod } from "@/types/financial";

export const MOCK_STOCKS: StockListItem[] = [
  // ── Bankacılık ──
  { ticker: "GARAN", name: "Türkiye Garanti Bankası A.Ş.", sector: "Bankacılık", price: 132.4, change: 3.8, changePercent: 2.95, volume: 38_700_000, marketCap: 556_080_000_000, overallScore: 4.3 },
  { ticker: "AKBNK", name: "Akbank T.A.Ş.", sector: "Bankacılık", price: 62.35, change: 1.15, changePercent: 1.88, volume: 41_200_000, marketCap: 325_000_000_000, overallScore: 4.0 },
  { ticker: "YKBNK", name: "Yapı ve Kredi Bankası A.Ş.", sector: "Bankacılık", price: 32.48, change: 0.62, changePercent: 1.95, volume: 68_400_000, marketCap: 282_000_000_000, overallScore: 3.8 },
  { ticker: "ISCTR", name: "Türkiye İş Bankası A.Ş.", sector: "Bankacılık", price: 16.92, change: -0.18, changePercent: -1.05, volume: 95_300_000, marketCap: 253_800_000_000, overallScore: 3.6 },
  { ticker: "HALKB", name: "Türkiye Halk Bankası A.Ş.", sector: "Bankacılık", price: 19.84, change: 0.34, changePercent: 1.74, volume: 52_100_000, marketCap: 99_200_000_000, overallScore: 3.1 },
  { ticker: "VAKBN", name: "Türkiye Vakıflar Bankası T.A.O.", sector: "Bankacılık", price: 22.16, change: -0.28, changePercent: -1.25, volume: 47_800_000, marketCap: 110_800_000_000, overallScore: 3.2 },
  { ticker: "ALBRK", name: "Albaraka Türk Katılım Bankası A.Ş.", sector: "Bankacılık", price: 4.52, change: 0.08, changePercent: 1.80, volume: 35_200_000, marketCap: 11_300_000_000, overallScore: 2.6 },
  { ticker: "SKBNK", name: "Şekerbank T.A.Ş.", sector: "Bankacılık", price: 7.94, change: -0.12, changePercent: -1.49, volume: 18_600_000, marketCap: 9_920_000_000, overallScore: 2.4 },
  { ticker: "ICBCT", name: "ICBC Turkey Bank A.Ş.", sector: "Bankacılık", price: 8.76, change: 0.14, changePercent: 1.62, volume: 5_400_000, marketCap: 7_680_000_000, overallScore: 2.3 },

  // ── Holding ve Yatırım ──
  { ticker: "KCHOL", name: "Koç Holding A.Ş.", sector: "Holding ve Yatırım", price: 188.3, change: -2.7, changePercent: -1.41, volume: 15_600_000, marketCap: 478_200_000_000, overallScore: 3.9 },
  { ticker: "SAHOL", name: "Hacı Ömer Sabancı Holding A.Ş.", sector: "Holding ve Yatırım", price: 82.6, change: 1.4, changePercent: 1.72, volume: 19_800_000, marketCap: 168_500_000_000, overallScore: 3.7 },
  { ticker: "DOHOL", name: "Doğan Holding A.Ş.", sector: "Holding ve Yatırım", price: 10.24, change: 0.18, changePercent: 1.79, volume: 42_300_000, marketCap: 25_600_000_000, overallScore: 2.8 },
  { ticker: "AGHOL", name: "Anadolu Grubu Holding A.Ş.", sector: "Holding ve Yatırım", price: 108.5, change: -1.3, changePercent: -1.18, volume: 4_200_000, marketCap: 34_720_000_000, overallScore: 3.5 },
  { ticker: "ISMEN", name: "İş Yatırım Menkul Değerler A.Ş.", sector: "Holding ve Yatırım", price: 12.86, change: 0.22, changePercent: 1.74, volume: 14_500_000, marketCap: 15_430_000_000, overallScore: 3.0 },
  { ticker: "ATAGY", name: "ATA Yatırım Ortaklığı A.Ş.", sector: "Holding ve Yatırım", price: 5.18, change: -0.06, changePercent: -1.15, volume: 3_200_000, marketCap: 4_150_000_000, overallScore: 2.3 },

  // ── Ulaştırma ──
  { ticker: "THYAO", name: "Türk Hava Yolları A.O.", sector: "Ulaştırma", price: 312.5, change: 6.25, changePercent: 2.04, volume: 45_200_000, marketCap: 431_250_000_000, overallScore: 4.1 },
  { ticker: "PGSUS", name: "Pegasus Hava Taşımacılığı A.Ş.", sector: "Ulaştırma", price: 1125.0, change: 25.0, changePercent: 2.27, volume: 2_100_000, marketCap: 115_875_000_000, overallScore: 3.9 },
  { ticker: "TAVHL", name: "TAV Havalimanları Holding A.Ş.", sector: "Ulaştırma", price: 98.4, change: 1.6, changePercent: 1.65, volume: 6_800_000, marketCap: 35_780_000_000, overallScore: 3.4 },
  { ticker: "CLEBI", name: "Çelebi Hava Servisi A.Ş.", sector: "Ulaştırma", price: 245.0, change: -3.5, changePercent: -1.41, volume: 1_200_000, marketCap: 6_125_000_000, overallScore: 3.2 },
  { ticker: "DOAS", name: "Doğuş Otomotiv Servis ve Ticaret A.Ş.", sector: "Otomotiv", price: 268.5, change: 4.2, changePercent: 1.59, volume: 3_500_000, marketCap: 59_070_000_000, overallScore: 3.6 },

  // ── Savunma ve Teknoloji ──
  { ticker: "ASELS", name: "Aselsan Elektronik Sanayi ve Ticaret A.Ş.", sector: "Savunma", price: 78.9, change: -1.2, changePercent: -1.5, volume: 32_100_000, marketCap: 157_800_000_000, overallScore: 3.8 },
  { ticker: "LOGO", name: "Logo Yazılım Sanayi ve Ticaret A.Ş.", sector: "Teknoloji", price: 312.0, change: 5.8, changePercent: 1.89, volume: 1_800_000, marketCap: 7_800_000_000, overallScore: 3.5 },
  { ticker: "INDES", name: "İndeks Bilgisayar Sistemleri Müh. San. ve Tic. A.Ş.", sector: "Teknoloji", price: 78.6, change: 1.4, changePercent: 1.81, volume: 2_400_000, marketCap: 4_716_000_000, overallScore: 3.1 },
  { ticker: "NETAS", name: "Netaş Telekomünikasyon A.Ş.", sector: "Teknoloji", price: 92.3, change: -0.8, changePercent: -0.86, volume: 1_600_000, marketCap: 3_692_000_000, overallScore: 2.9 },
  { ticker: "ASTOR", name: "Astor Enerji A.Ş.", sector: "Teknoloji", price: 195.0, change: 3.2, changePercent: 1.67, volume: 5_200_000, marketCap: 19_500_000_000, overallScore: 3.3 },
  { ticker: "KONTR", name: "Kontrolmatik Teknoloji Enerji ve Müh. A.Ş.", sector: "Teknoloji", price: 142.5, change: -2.1, changePercent: -1.45, volume: 3_800_000, marketCap: 14_250_000_000, overallScore: 3.0 },
  { ticker: "PENTA", name: "Penta Teknoloji Ürünleri Dağıtım Tic. A.Ş.", sector: "Teknoloji", price: 56.4, change: 0.9, changePercent: 1.62, volume: 2_100_000, marketCap: 5_640_000_000, overallScore: 2.8 },

  // ── Telekomünikasyon ──
  { ticker: "TCELL", name: "Turkcell İletişim Hizmetleri A.Ş.", sector: "Telekomünikasyon", price: 96.5, change: 0.3, changePercent: 0.31, volume: 14_500_000, marketCap: 212_300_000_000, overallScore: 3.3 },
  { ticker: "TTKOM", name: "Türk Telekomünikasyon A.Ş.", sector: "Telekomünikasyon", price: 52.8, change: 0.65, changePercent: 1.25, volume: 18_400_000, marketCap: 184_800_000_000, overallScore: 3.4 },

  // ── Enerji ──
  { ticker: "TUPRS", name: "Tüpraş-Türkiye Petrol Rafinerileri A.Ş.", sector: "Enerji", price: 172.8, change: -4.2, changePercent: -2.37, volume: 12_400_000, marketCap: 172_800_000_000, overallScore: 3.5 },
  { ticker: "AYGAZ", name: "Aygaz A.Ş.", sector: "Enerji", price: 152.0, change: 2.8, changePercent: 1.87, volume: 3_600_000, marketCap: 45_600_000_000, overallScore: 3.3 },
  { ticker: "AKSEN", name: "Aksa Enerji Üretim A.Ş.", sector: "Enerji", price: 42.5, change: -0.55, changePercent: -1.28, volume: 8_200_000, marketCap: 25_500_000_000, overallScore: 3.0 },
  { ticker: "ENJSA", name: "Enerjisa Enerji A.Ş.", sector: "Enerji", price: 48.9, change: 0.72, changePercent: 1.49, volume: 7_600_000, marketCap: 57_370_000_000, overallScore: 3.4 },
  { ticker: "EUPWR", name: "Europower Enerji ve Otomasyon Teknolojileri A.Ş.", sector: "Enerji", price: 68.2, change: 1.1, changePercent: 1.64, volume: 4_100_000, marketCap: 6_820_000_000, overallScore: 2.7 },
  { ticker: "ODAS", name: "Odaş Elektrik Üretim San. Tic. A.Ş.", sector: "Enerji", price: 8.64, change: -0.14, changePercent: -1.59, volume: 22_500_000, marketCap: 8_640_000_000, overallScore: 2.5 },

  // ── Perakende Ticaret ──
  { ticker: "BIMAS", name: "BİM Birleşik Mağazalar A.Ş.", sector: "Perakende Ticaret", price: 540.0, change: 12.5, changePercent: 2.37, volume: 8_300_000, marketCap: 327_240_000_000, overallScore: 3.6 },
  { ticker: "MGROS", name: "Migros Ticaret A.Ş.", sector: "Perakende Ticaret", price: 480.0, change: -6.5, changePercent: -1.34, volume: 2_800_000, marketCap: 86_400_000_000, overallScore: 3.5 },
  { ticker: "SOKM", name: "Şok Marketler Ticaret A.Ş.", sector: "Perakende Ticaret", price: 28.4, change: 0.42, changePercent: 1.50, volume: 15_200_000, marketCap: 57_940_000_000, overallScore: 3.2 },
  { ticker: "MAVI", name: "Mavi Giyim Sanayi ve Ticaret A.Ş.", sector: "Perakende Ticaret", price: 118.5, change: 2.3, changePercent: 1.98, volume: 2_600_000, marketCap: 11_850_000_000, overallScore: 3.3 },
  { ticker: "ADEL", name: "Adel Kalemcilik Ticaret ve Sanayi A.Ş.", sector: "Perakende Ticaret", price: 285.0, change: -3.8, changePercent: -1.32, volume: 800_000, marketCap: 5_700_000_000, overallScore: 3.0 },

  // ── Gıda ve İçecek ──
  { ticker: "AEFES", name: "Anadolu Efes Biracılık ve Malt Sanayii A.Ş.", sector: "Gıda ve İçecek", price: 310.0, change: 4.5, changePercent: 1.47, volume: 3_200_000, marketCap: 183_900_000_000, overallScore: 3.4 },
  { ticker: "ULKER", name: "Ülker Bisküvi Sanayi A.Ş.", sector: "Gıda ve İçecek", price: 172.5, change: -1.8, changePercent: -1.03, volume: 4_100_000, marketCap: 59_060_000_000, overallScore: 3.2 },
  { ticker: "CCOLA", name: "Coca-Cola İçecek A.Ş.", sector: "Gıda ve İçecek", price: 780.0, change: 8.5, changePercent: 1.10, volume: 1_400_000, marketCap: 198_120_000_000, overallScore: 3.7 },
  { ticker: "BANVT", name: "Banvit Bandırma Vitaminli Yem San. A.Ş.", sector: "Gıda ve İçecek", price: 92.4, change: 1.2, changePercent: 1.31, volume: 1_800_000, marketCap: 9_240_000_000, overallScore: 2.7 },
  { ticker: "ULUUN", name: "Ulusoy Un Sanayi ve Ticaret A.Ş.", sector: "Gıda ve İçecek", price: 38.6, change: -0.45, changePercent: -1.15, volume: 3_200_000, marketCap: 3_860_000_000, overallScore: 2.5 },

  // ── Demir, Çelik ve Metal ──
  { ticker: "EREGL", name: "Ereğli Demir ve Çelik Fabrikaları T.A.Ş.", sector: "Demir, Çelik ve Metal", price: 48.72, change: 0.48, changePercent: 0.99, volume: 52_300_000, marketCap: 171_000_000_000, overallScore: 3.2 },
  { ticker: "KORDS", name: "Kordsa Teknik Tekstil A.Ş.", sector: "Demir, Çelik ve Metal", price: 118.0, change: 1.8, changePercent: 1.55, volume: 2_400_000, marketCap: 22_820_000_000, overallScore: 3.1 },
  { ticker: "CEMTS", name: "Çemtaş Çelik Makina Sanayi ve Ticaret A.Ş.", sector: "Demir, Çelik ve Metal", price: 56.2, change: -0.7, changePercent: -1.23, volume: 1_800_000, marketCap: 4_496_000_000, overallScore: 2.6 },
  { ticker: "CEMAS", name: "Çemaş Döküm Sanayi A.Ş.", sector: "Demir, Çelik ve Metal", price: 7.82, change: 0.12, changePercent: 1.56, volume: 5_600_000, marketCap: 2_346_000_000, overallScore: 2.2 },

  // ── Cam ──
  { ticker: "SISE", name: "Türkiye Şişe ve Cam Fabrikaları A.Ş.", sector: "Cam", price: 53.15, change: 0.85, changePercent: 1.63, volume: 28_500_000, marketCap: 133_000_000_000, overallScore: 3.4 },

  // ── Kimya, Petrol ve Plastik ──
  { ticker: "PETKM", name: "Petkim Petrokimya Holding A.Ş.", sector: "Kimya, Petrol ve Plastik", price: 18.92, change: -0.24, changePercent: -1.25, volume: 36_800_000, marketCap: 56_760_000_000, overallScore: 2.8 },
  { ticker: "SASA", name: "SASA Polyester Sanayi A.Ş.", sector: "Kimya, Petrol ve Plastik", price: 42.8, change: 0.68, changePercent: 1.61, volume: 24_600_000, marketCap: 45_360_000_000, overallScore: 3.0 },
  { ticker: "AKSA", name: "Aksa Akrilik Kimya Sanayii A.Ş.", sector: "Kimya, Petrol ve Plastik", price: 62.4, change: -0.82, changePercent: -1.30, volume: 3_800_000, marketCap: 12_480_000_000, overallScore: 2.9 },
  { ticker: "BRISA", name: "Brisa Bridgestone Sabancı Lastik San. ve Tic. A.Ş.", sector: "Kimya, Petrol ve Plastik", price: 195.0, change: 2.5, changePercent: 1.30, volume: 1_200_000, marketCap: 13_650_000_000, overallScore: 3.1 },
  { ticker: "GUBRF", name: "Gübre Fabrikaları T.A.Ş.", sector: "Kimya, Petrol ve Plastik", price: 164.0, change: 3.2, changePercent: 1.99, volume: 5_400_000, marketCap: 24_600_000_000, overallScore: 3.4 },
  { ticker: "HEKTS", name: "Hektaş Ticaret T.A.Ş.", sector: "Kimya, Petrol ve Plastik", price: 82.6, change: -1.1, changePercent: -1.31, volume: 2_800_000, marketCap: 10_325_000_000, overallScore: 2.9 },

  // ── Otomotiv ──
  { ticker: "TOASO", name: "Tofaş Türk Otomobil Fabrikası A.Ş.", sector: "Otomotiv", price: 218.0, change: -2.4, changePercent: -1.09, volume: 6_400_000, marketCap: 109_000_000_000, overallScore: 3.4 },
  { ticker: "FROTO", name: "Ford Otomotiv Sanayi A.Ş.", sector: "Otomotiv", price: 1050.0, change: 15.0, changePercent: 1.45, volume: 1_600_000, marketCap: 368_550_000_000, overallScore: 4.2 },
  { ticker: "OTKAR", name: "Otokar Otomotiv ve Savunma Sanayi A.Ş.", sector: "Otomotiv", price: 850.0, change: -8.5, changePercent: -0.99, volume: 800_000, marketCap: 20_400_000_000, overallScore: 3.7 },
  { ticker: "TTRAK", name: "Türk Traktör ve Ziraat Makineleri A.Ş.", sector: "Otomotiv", price: 1480.0, change: 22.0, changePercent: 1.51, volume: 600_000, marketCap: 79_920_000_000, overallScore: 4.0 },

  // ── İnşaat ve Bayındırlık ──
  { ticker: "ENKAI", name: "Enka İnşaat ve Sanayi A.Ş.", sector: "İnşaat ve Bayındırlık", price: 42.6, change: 0.55, changePercent: 1.31, volume: 22_400_000, marketCap: 213_000_000_000, overallScore: 3.6 },
  { ticker: "TKFEN", name: "Tekfen Holding A.Ş.", sector: "İnşaat ve Bayındırlık", price: 128.0, change: -1.6, changePercent: -1.23, volume: 3_200_000, marketCap: 47_360_000_000, overallScore: 3.3 },
  { ticker: "KLRHO", name: "Kiler Holding A.Ş.", sector: "İnşaat ve Bayındırlık", price: 3.24, change: 0.06, changePercent: 1.89, volume: 28_600_000, marketCap: 3_240_000_000, overallScore: 2.1 },

  // ── Çimento ──
  { ticker: "CIMSA", name: "Çimsa Çimento Sanayi ve Ticaret A.Ş.", sector: "Çimento", price: 52.8, change: 0.72, changePercent: 1.38, volume: 4_600_000, marketCap: 14_256_000_000, overallScore: 3.0 },
  { ticker: "OYAKC", name: "Oyak Çimento Fabrikaları A.Ş.", sector: "Çimento", price: 38.4, change: -0.48, changePercent: -1.23, volume: 3_200_000, marketCap: 7_296_000_000, overallScore: 2.7 },
  { ticker: "BUCIM", name: "Bursa Çimento Fabrikası A.Ş.", sector: "Çimento", price: 48.2, change: 0.65, changePercent: 1.37, volume: 1_600_000, marketCap: 4_338_000_000, overallScore: 2.5 },
  { ticker: "BTCIM", name: "Batıçim Batı Anadolu Çimento Sanayii A.Ş.", sector: "Çimento", price: 42.6, change: -0.52, changePercent: -1.21, volume: 1_400_000, marketCap: 3_834_000_000, overallScore: 2.4 },

  // ── Madencilik ──
  { ticker: "KOZAL", name: "Koza Altın İşletmeleri A.Ş.", sector: "Madencilik", price: 145.0, change: 2.8, changePercent: 1.97, volume: 8_600_000, marketCap: 42_050_000_000, overallScore: 3.6 },
  { ticker: "KOZAA", name: "Koza Anadolu Metal Madencilik İşletmeleri A.Ş.", sector: "Madencilik", price: 52.4, change: 1.05, changePercent: 2.04, volume: 12_400_000, marketCap: 24_104_000_000, overallScore: 3.2 },
  { ticker: "IPEKE", name: "İpek Doğal Enerji Kaynakları Araş. ve Üret. A.Ş.", sector: "Madencilik", price: 28.6, change: -0.35, changePercent: -1.21, volume: 6_200_000, marketCap: 14_300_000_000, overallScore: 2.6 },

  // ── Gayrimenkul Yatırım Ortaklığı ──
  { ticker: "EKGYO", name: "Emlak Konut Gayrimenkul Yatırım Ortaklığı A.Ş.", sector: "Gayrimenkul Yatırım Ortaklığı", price: 12.48, change: 0.18, changePercent: 1.46, volume: 45_200_000, marketCap: 47_424_000_000, overallScore: 2.9 },
  { ticker: "ISGYO", name: "İş Gayrimenkul Yatırım Ortaklığı A.Ş.", sector: "Gayrimenkul Yatırım Ortaklığı", price: 14.92, change: -0.22, changePercent: -1.45, volume: 8_400_000, marketCap: 14_920_000_000, overallScore: 2.7 },
  { ticker: "TRGYO", name: "Torunlar Gayrimenkul Yatırım Ortaklığı A.Ş.", sector: "Gayrimenkul Yatırım Ortaklığı", price: 8.46, change: 0.12, changePercent: 1.44, volume: 12_600_000, marketCap: 8_460_000_000, overallScore: 2.5 },
  { ticker: "HLGYO", name: "Halk Gayrimenkul Yatırım Ortaklığı A.Ş.", sector: "Gayrimenkul Yatırım Ortaklığı", price: 5.24, change: -0.08, changePercent: -1.50, volume: 6_800_000, marketCap: 5_240_000_000, overallScore: 2.3 },
  { ticker: "KZBGY", name: "Kızılbük Gayrimenkul Yatırım Ortaklığı A.Ş.", sector: "Gayrimenkul Yatırım Ortaklığı", price: 3.86, change: 0.04, changePercent: 1.05, volume: 2_200_000, marketCap: 1_544_000_000, overallScore: 2.0 },

  // ── Sigorta ──
  { ticker: "TURSG", name: "Türkiye Sigorta A.Ş.", sector: "Sigorta", price: 14.28, change: 0.24, changePercent: 1.71, volume: 16_400_000, marketCap: 71_400_000_000, overallScore: 3.2 },
  { ticker: "ANHYT", name: "Anadolu Hayat Emeklilik A.Ş.", sector: "Sigorta", price: 42.6, change: -0.55, changePercent: -1.27, volume: 4_800_000, marketCap: 25_560_000_000, overallScore: 3.0 },

  // ── Tekstil ve Deri ──
  { ticker: "ARCLK", name: "Arçelik A.Ş.", sector: "Dayanıklı Tüketim", price: 192.5, change: -2.8, changePercent: -1.43, volume: 8_200_000, marketCap: 130_100_000_000, overallScore: 3.5 },
  { ticker: "VESTL", name: "Vestel Elektronik Sanayi ve Ticaret A.Ş.", sector: "Dayanıklı Tüketim", price: 46.8, change: 0.72, changePercent: 1.56, volume: 12_400_000, marketCap: 14_508_000_000, overallScore: 2.8 },

  // ── Kağıt ve Ambalaj ──
  { ticker: "KARTN", name: "Kartonsan Karton Sanayi ve Ticaret A.Ş.", sector: "Kağıt ve Ambalaj", price: 720.0, change: 8.5, changePercent: 1.19, volume: 400_000, marketCap: 3_600_000_000, overallScore: 3.1 },
  { ticker: "KUTPO", name: "Kütahya Porselen Sanayi A.Ş.", sector: "Kağıt ve Ambalaj", price: 38.2, change: -0.45, changePercent: -1.16, volume: 1_800_000, marketCap: 3_056_000_000, overallScore: 2.4 },

  // ── Turizm ──
  { ticker: "MPARK", name: "MLP Sağlık Hizmetleri A.Ş.", sector: "Sağlık", price: 145.0, change: 2.2, changePercent: 1.54, volume: 3_600_000, marketCap: 21_750_000_000, overallScore: 3.4 },

  // ── Sağlık ──
  { ticker: "RGYAS", name: "Reygan Sağlık Yönetim ve Teknoloji A.Ş.", sector: "Sağlık", price: 28.4, change: -0.38, changePercent: -1.32, volume: 4_200_000, marketCap: 4_260_000_000, overallScore: 2.6 },

  // ── Elektrik ve Elektronik ──
  { ticker: "GESAN", name: "Giresun Enerji Sanayi ve Ticaret A.Ş.", sector: "Enerji", price: 54.2, change: 0.85, changePercent: 1.59, volume: 2_800_000, marketCap: 5_420_000_000, overallScore: 2.7 },
  { ticker: "ALARK", name: "Alarko Holding A.Ş.", sector: "Holding ve Yatırım", price: 72.8, change: -0.92, changePercent: -1.25, volume: 2_400_000, marketCap: 14_560_000_000, overallScore: 3.1 },

  // ── Tarım ve Hayvancılık ──
  { ticker: "TMSN", name: "Tümosan Motor ve Traktör Sanayi A.Ş.", sector: "Otomotiv", price: 52.6, change: 0.78, changePercent: 1.50, volume: 5_200_000, marketCap: 7_890_000_000, overallScore: 2.7 },
  { ticker: "KATMR", name: "Katmerciler Araç Üstü Ekipman San. ve Tic. A.Ş.", sector: "Otomotiv", price: 112.5, change: 1.8, changePercent: 1.63, volume: 3_400_000, marketCap: 11_250_000_000, overallScore: 3.0 },

  // ── Diğer Büyük Şirketler ──
  { ticker: "EGEEN", name: "Ege Endüstri ve Ticaret A.Ş.", sector: "Otomotiv", price: 1680.0, change: -18.0, changePercent: -1.06, volume: 200_000, marketCap: 10_080_000_000, overallScore: 3.8 },
  { ticker: "BRYAT", name: "Borusan Yatırım ve Pazarlama A.Ş.", sector: "Holding ve Yatırım", price: 78.4, change: 1.2, changePercent: 1.55, volume: 1_800_000, marketCap: 7_056_000_000, overallScore: 3.0 },
  { ticker: "MIATK", name: "MIA Teknoloji A.Ş.", sector: "Teknoloji", price: 24.6, change: 0.38, changePercent: 1.57, volume: 8_200_000, marketCap: 4_920_000_000, overallScore: 2.5 },
  { ticker: "QUAGR", name: "QUA Granite Hayal Yapı ve Ürünleri San. Tic. A.Ş.", sector: "İnşaat ve Bayındırlık", price: 6.84, change: -0.08, changePercent: -1.16, volume: 12_400_000, marketCap: 3_420_000_000, overallScore: 2.2 },
  { ticker: "MAALT", name: "Maa-Altı Gayrimenkul ve İnşaat A.Ş.", sector: "İnşaat ve Bayındırlık", price: 14.2, change: 0.22, changePercent: 1.57, volume: 4_600_000, marketCap: 2_840_000_000, overallScore: 2.3 },
  { ticker: "BOBET", name: "Boğaziçi Beton Sanayi ve Ticaret A.Ş.", sector: "Çimento", price: 18.6, change: -0.24, changePercent: -1.27, volume: 3_800_000, marketCap: 1_860_000_000, overallScore: 2.1 },
  { ticker: "CANTE", name: "Çan2 Termik A.Ş.", sector: "Enerji", price: 9.82, change: 0.14, changePercent: 1.45, volume: 8_400_000, marketCap: 4_910_000_000, overallScore: 2.4 },
  { ticker: "YEOTK", name: "Yeo Teknoloji Enerji ve Endüstri A.Ş.", sector: "Teknoloji", price: 35.4, change: -0.48, changePercent: -1.34, volume: 6_200_000, marketCap: 7_080_000_000, overallScore: 2.6 },
  { ticker: "GOLTS", name: "Göltaş Göller Bölgesi Çimento San. ve Tic. A.Ş.", sector: "Çimento", price: 182.0, change: 2.4, changePercent: 1.34, volume: 600_000, marketCap: 4_550_000_000, overallScore: 2.8 },
  { ticker: "KRPLS", name: "Koroplast Temizlik Ambalaj Ürünleri San. ve Tic. A.Ş.", sector: "Kimya, Petrol ve Plastik", price: 52.8, change: -0.65, changePercent: -1.22, volume: 1_400_000, marketCap: 5_280_000_000, overallScore: 2.6 },
  { ticker: "BERA", name: "Bera Holding A.Ş.", sector: "Holding ve Yatırım", price: 10.85, change: 0.16, changePercent: 1.50, volume: 18_400_000, marketCap: 5_425_000_000, overallScore: 2.3 },
];

export const MOCK_STOCK_DETAIL: StockDetail = {
  ticker: "THYAO",
  name: "Türk Hava Yolları A.O.",
  sector: "Ulaştırma",
  subSector: "Havayolu Taşımacılığı",
  marketCap: 431_250_000_000,
  website: "https://www.turkishairlines.com",
  logo: null,
  listingDate: "1990-01-02",
  latestPrice: {
    close: 312.5,
    change: 6.25,
    changePercent: 2.04,
    volume: 45_200_000,
    date: "2026-04-11",
  },
  scores: {
    valueScore: 4.2,
    futureScore: 3.8,
    pastScore: 4.5,
    healthScore: 3.6,
    dividendScore: 4.4,
    overallScore: 4.1,
  },
};

export const MOCK_PRICE_HISTORY = Array.from({ length: 90 }, (_, i) => {
  const date = new Date("2026-01-12");
  date.setDate(date.getDate() + i);
  const base = 280 + Math.sin(i / 10) * 20 + i * 0.35;
  return {
    date: date.toISOString().split("T")[0],
    close: Math.round(base * 100) / 100,
    volume: Math.floor(30_000_000 + Math.random() * 30_000_000),
  };
});

export const MOCK_FINANCIALS: FinancialPeriod[] = [
  { period: "2025-Q4", periodEndDate: "2025-12-31", revenue: 285_000_000_000, grossProfit: 71_250_000_000, operatingProfit: 52_000_000_000, ebitda: 68_000_000_000, netIncome: 42_000_000_000, eps: 30.43, totalAssets: 520_000_000_000, totalLiabilities: 340_000_000_000, totalEquity: 180_000_000_000, cash: 45_000_000_000, totalDebt: 120_000_000_000, netDebt: 75_000_000_000, operatingCashFlow: 55_000_000_000, freeCashFlow: 28_000_000_000 },
  { period: "2025-Q3", periodEndDate: "2025-09-30", revenue: 310_000_000_000, grossProfit: 80_600_000_000, operatingProfit: 62_000_000_000, ebitda: 78_000_000_000, netIncome: 51_000_000_000, eps: 36.96, totalAssets: 510_000_000_000, totalLiabilities: 335_000_000_000, totalEquity: 175_000_000_000, cash: 42_000_000_000, totalDebt: 115_000_000_000, netDebt: 73_000_000_000, operatingCashFlow: 62_000_000_000, freeCashFlow: 35_000_000_000 },
  { period: "2025-Q2", periodEndDate: "2025-06-30", revenue: 275_000_000_000, grossProfit: 66_000_000_000, operatingProfit: 47_000_000_000, ebitda: 60_000_000_000, netIncome: 36_000_000_000, eps: 26.09, totalAssets: 490_000_000_000, totalLiabilities: 325_000_000_000, totalEquity: 165_000_000_000, cash: 38_000_000_000, totalDebt: 110_000_000_000, netDebt: 72_000_000_000, operatingCashFlow: 48_000_000_000, freeCashFlow: 22_000_000_000 },
  { period: "2025-Q1", periodEndDate: "2025-03-31", revenue: 240_000_000_000, grossProfit: 55_200_000_000, operatingProfit: 38_000_000_000, ebitda: 50_000_000_000, netIncome: 28_000_000_000, eps: 20.29, totalAssets: 475_000_000_000, totalLiabilities: 318_000_000_000, totalEquity: 157_000_000_000, cash: 35_000_000_000, totalDebt: 108_000_000_000, netDebt: 73_000_000_000, operatingCashFlow: 40_000_000_000, freeCashFlow: 18_000_000_000 },
  { period: "2024-Q4", periodEndDate: "2024-12-31", revenue: 260_000_000_000, grossProfit: 62_400_000_000, operatingProfit: 44_000_000_000, ebitda: 58_000_000_000, netIncome: 34_000_000_000, eps: 24.64, totalAssets: 460_000_000_000, totalLiabilities: 310_000_000_000, totalEquity: 150_000_000_000, cash: 32_000_000_000, totalDebt: 105_000_000_000, netDebt: 73_000_000_000, operatingCashFlow: 42_000_000_000, freeCashFlow: 20_000_000_000 },
  { period: "2024-Q3", periodEndDate: "2024-09-30", revenue: 290_000_000_000, grossProfit: 72_500_000_000, operatingProfit: 55_000_000_000, ebitda: 70_000_000_000, netIncome: 44_000_000_000, eps: 31.88, totalAssets: 450_000_000_000, totalLiabilities: 305_000_000_000, totalEquity: 145_000_000_000, cash: 30_000_000_000, totalDebt: 100_000_000_000, netDebt: 70_000_000_000, operatingCashFlow: 52_000_000_000, freeCashFlow: 28_000_000_000 },
  { period: "2024-Q2", periodEndDate: "2024-06-30", revenue: 250_000_000_000, grossProfit: 57_500_000_000, operatingProfit: 40_000_000_000, ebitda: 52_000_000_000, netIncome: 30_000_000_000, eps: 21.74, totalAssets: 440_000_000_000, totalLiabilities: 300_000_000_000, totalEquity: 140_000_000_000, cash: 28_000_000_000, totalDebt: 98_000_000_000, netDebt: 70_000_000_000, operatingCashFlow: 38_000_000_000, freeCashFlow: 16_000_000_000 },
  { period: "2024-Q1", periodEndDate: "2024-03-31", revenue: 220_000_000_000, grossProfit: 48_400_000_000, operatingProfit: 33_000_000_000, ebitda: 44_000_000_000, netIncome: 24_000_000_000, eps: 17.39, totalAssets: 430_000_000_000, totalLiabilities: 295_000_000_000, totalEquity: 135_000_000_000, cash: 25_000_000_000, totalDebt: 95_000_000_000, netDebt: 70_000_000_000, operatingCashFlow: 32_000_000_000, freeCashFlow: 12_000_000_000 },
];

export const MOCK_ANALYST_RATINGS = [
  { source: "İş Yatırım", rating: "AL", targetPrice: 370, currentPrice: 312.5, upside: 18.4, reportDate: "2026-04-08" },
  { source: "Yapı Kredi Yatırım", rating: "AL", targetPrice: 355, currentPrice: 312.5, upside: 13.6, reportDate: "2026-04-05" },
  { source: "Garanti BBVA Yatırım", rating: "Endeks Üstü", targetPrice: 345, currentPrice: 312.5, upside: 10.4, reportDate: "2026-03-28" },
  { source: "Ak Yatırım", rating: "AL", targetPrice: 360, currentPrice: 312.5, upside: 15.2, reportDate: "2026-03-22" },
  { source: "Deniz Yatırım", rating: "TUT", targetPrice: 320, currentPrice: 312.5, upside: 2.4, reportDate: "2026-03-15" },
  { source: "QNB Finans Yatırım", rating: "AL", targetPrice: 365, currentPrice: 312.5, upside: 16.8, reportDate: "2026-03-10" },
];

export const MOCK_KAP_NEWS: KapNewsItem[] = [
  { id: "1", kapId: "1234567", ticker: "THYAO", companyName: "Türk Hava Yolları", title: "THYAO - Finansal Tabloların Kamuya Açıklanması", summary: "Şirket 2025 yılı 4. çeyrek finansal tablolarını açıkladı. Net kar %18 artışla 42 milyar TL olarak gerçekleşti.", category: "bilanco", publishedAt: "2026-04-10T14:30:00Z", url: "https://www.kap.org.tr/tr/Bildirim/1234567" },
  { id: "2", kapId: "1234566", ticker: "GARAN", companyName: "Garanti BBVA", title: "GARAN - Temettü Dağıtım Kararı", summary: "Yönetim kurulu hisse başına 8.50 TL brüt temettü dağıtılmasını önerdi.", category: "temettü", publishedAt: "2026-04-10T11:15:00Z", url: "https://www.kap.org.tr/tr/Bildirim/1234566" },
  { id: "3", kapId: "1234565", ticker: "ASELS", companyName: "Aselsan", title: "ASELS - Yeni Savunma Sözleşmesi İmzalandı", summary: "Şirket Savunma Sanayi Başkanlığı ile 2.8 milyar USD tutarında yeni bir sözleşme imzaladı.", category: "diger", publishedAt: "2026-04-09T16:45:00Z", url: "https://www.kap.org.tr/tr/Bildirim/1234565" },
  { id: "4", kapId: "1234564", ticker: "BIMAS", companyName: "BİM", title: "BIMAS - Genel Kurul Toplantı Sonucu", summary: "Olağan genel kurul toplantısında tüm gündem maddeleri kabul edildi.", category: "genel_kurul", publishedAt: "2026-04-09T12:00:00Z", url: "https://www.kap.org.tr/tr/Bildirim/1234564" },
  { id: "5", kapId: "1234563", ticker: "SISE", companyName: "Şişecam", title: "SISE - Ortaklık Yapısı Değişikliği", summary: "T.C. Varlık Fonu'nun şirketteki payı %5 sınırını aştı.", category: "ortaklik", publishedAt: "2026-04-08T09:30:00Z", url: "https://www.kap.org.tr/tr/Bildirim/1234563" },
  { id: "6", kapId: "1234562", ticker: "EREGL", companyName: "Ereğli Demir Çelik", title: "EREGL - Finansal Tabloların Kamuya Açıklanması", summary: "2025 yılı 4. çeyrek finansal tabloları açıklandı. Gelir %12 artışla 48 milyar TL'ye ulaştı.", category: "bilanco", publishedAt: "2026-04-07T15:20:00Z", url: "https://www.kap.org.tr/tr/Bildirim/1234562" },
  { id: "7", kapId: "1234561", ticker: "KCHOL", companyName: "Koç Holding", title: "KCHOL - Temettü Dağıtım Kararı", summary: "Hisse başına 12.00 TL brüt temettü dağıtılması kararlaştırıldı.", category: "temettü", publishedAt: "2026-04-07T10:00:00Z", url: "https://www.kap.org.tr/tr/Bildirim/1234561" },
  { id: "8", kapId: "1234560", ticker: "TUPRS", companyName: "Tüpraş", title: "TUPRS - Kapasite Artırım Yatırımı", summary: "İzmit rafinerisinde 1.2 milyar USD tutarında kapasite artırım yatırımı başlatıldı.", category: "diger", publishedAt: "2026-04-06T13:45:00Z", url: "https://www.kap.org.tr/tr/Bildirim/1234560" },
];

export const MOCK_MARKET_SUMMARY = {
  bist100: { value: 10_245.32, change: 1.24 },
  bist30: { value: 11_892.15, change: 1.48 },
  usdTry: { value: 38.42, change: -0.15 },
  eurTry: { value: 41.85, change: 0.08 },
  goldTry: { value: 3_245.0, change: 0.52 },
};

// ── Deep Analysis Mock Data ──

export const MOCK_VALUATION = {
  peRatio: 8.2,
  pbRatio: 2.4,
  evToEbitda: 5.1,
  psFatio: 1.2,
  pegRatio: 0.65,
  sectorAvgPE: 12.5,
  sectorAvgPB: 3.1,
  sectorAvgEvEbitda: 7.8,
  dcfFairValue: 385,
  currentPrice: 312.5,
  dcfUpside: 23.2,
  historicalPE: [
    { period: "2022", value: 5.1 },
    { period: "2023-Q1", value: 6.2 },
    { period: "2023-Q2", value: 7.8 },
    { period: "2023-Q3", value: 9.1 },
    { period: "2023-Q4", value: 8.4 },
    { period: "2024-Q1", value: 7.5 },
    { period: "2024-Q2", value: 8.9 },
    { period: "2024-Q3", value: 7.2 },
    { period: "2024-Q4", value: 8.8 },
    { period: "2025-Q1", value: 9.5 },
    { period: "2025-Q2", value: 8.7 },
    { period: "2025-Q3", value: 7.9 },
    { period: "2025-Q4", value: 8.2 },
  ],
  peerComparison: [
    { ticker: "THYAO", pe: 8.2, pb: 2.4, evEbitda: 5.1 },
    { ticker: "PGSUS", pe: 12.5, pb: 4.1, evEbitda: 8.2 },
    { ticker: "CLEBI", pe: 15.3, pb: 3.5, evEbitda: 9.8 },
    { ticker: "TAVHL", pe: 11.8, pb: 2.9, evEbitda: 7.1 },
    { ticker: "Sektör Ort.", pe: 12.5, pb: 3.1, evEbitda: 7.8 },
  ],
};

export const MOCK_GROWTH = {
  revenueGrowthYoY: [
    { period: "2021", value: 95.2 },
    { period: "2022", value: 112.8 },
    { period: "2023", value: 62.4 },
    { period: "2024", value: 38.1 },
    { period: "2025", value: 22.5 },
  ],
  netIncomeGrowthYoY: [
    { period: "2021", value: 180.5 },
    { period: "2022", value: 145.2 },
    { period: "2023", value: 72.1 },
    { period: "2024", value: 28.4 },
    { period: "2025", value: 18.7 },
  ],
  epsGrowthYoY: [
    { period: "2021", value: 180.5 },
    { period: "2022", value: 145.2 },
    { period: "2023", value: 72.1 },
    { period: "2024", value: 28.4 },
    { period: "2025", value: 18.7 },
  ],
  revenueCAGR3y: 38.5,
  netIncomeCAGR3y: 32.1,
  forecastRevenue: [
    { period: "2026E", value: 1_360_000_000_000 },
    { period: "2027E", value: 1_520_000_000_000 },
  ],
  forecastEps: [
    { period: "2026E", value: 42.5 },
    { period: "2027E", value: 48.2 },
  ],
};

export const MOCK_PROFITABILITY = {
  margins: [
    { period: "2024-Q1", grossMargin: 22.0, operatingMargin: 15.0, netMargin: 10.9 },
    { period: "2024-Q2", grossMargin: 23.0, operatingMargin: 16.0, netMargin: 12.0 },
    { period: "2024-Q3", grossMargin: 25.0, operatingMargin: 19.0, netMargin: 15.2 },
    { period: "2024-Q4", grossMargin: 24.0, operatingMargin: 16.9, netMargin: 13.1 },
    { period: "2025-Q1", grossMargin: 23.0, operatingMargin: 15.8, netMargin: 11.7 },
    { period: "2025-Q2", grossMargin: 24.0, operatingMargin: 17.1, netMargin: 13.1 },
    { period: "2025-Q3", grossMargin: 26.0, operatingMargin: 20.0, netMargin: 16.5 },
    { period: "2025-Q4", grossMargin: 25.0, operatingMargin: 18.2, netMargin: 14.7 },
  ],
  roe: 28.4,
  roa: 8.9,
  roic: 18.2,
  roe5yAvg: 24.2,
  sectorAvgROE: 16.5,
  roeHistory: [
    { period: "2021", value: 18.5 },
    { period: "2022", value: 32.1 },
    { period: "2023", value: 26.8 },
    { period: "2024", value: 24.2 },
    { period: "2025", value: 28.4 },
  ],
};

export const MOCK_HEALTH = {
  debtToEquity: 0.67,
  currentRatio: 1.32,
  quickRatio: 1.08,
  interestCoverage: 5.8,
  netDebtToEbitda: 1.1,
  cashToDebt: 0.375,
  debtMaturity: [
    { year: "2026", amount: 25_000_000_000 },
    { year: "2027", amount: 35_000_000_000 },
    { year: "2028", amount: 20_000_000_000 },
    { year: "2029", amount: 15_000_000_000 },
    { year: "2030+", amount: 25_000_000_000 },
  ],
  cashFlowTrend: [
    { period: "2024-Q1", operating: 32, investing: -20, financing: -8, free: 12 },
    { period: "2024-Q2", operating: 38, investing: -22, financing: -10, free: 16 },
    { period: "2024-Q3", operating: 52, investing: -24, financing: -12, free: 28 },
    { period: "2024-Q4", operating: 42, investing: -22, financing: -8, free: 20 },
    { period: "2025-Q1", operating: 40, investing: -22, financing: -10, free: 18 },
    { period: "2025-Q2", operating: 48, investing: -26, financing: -8, free: 22 },
    { period: "2025-Q3", operating: 62, investing: -27, financing: -12, free: 35 },
    { period: "2025-Q4", operating: 55, investing: -27, financing: -10, free: 28 },
  ],
  altmanZ: 2.8,
  piotroskiF: 7,
};

export const MOCK_DIVIDEND = {
  currentYield: 3.8,
  payoutRatio: 32,
  dividendPerShare: 11.88,
  exDividendDate: "2026-05-15",
  paymentDate: "2026-06-02",
  history: [
    { year: "2021", dps: 4.50, yield: 2.1, payout: 22 },
    { year: "2022", dps: 7.20, yield: 2.8, payout: 18 },
    { year: "2023", dps: 9.50, yield: 3.2, payout: 25 },
    { year: "2024", dps: 10.80, yield: 3.5, payout: 28 },
    { year: "2025", dps: 11.88, yield: 3.8, payout: 32 },
  ],
  growthRate5y: 21.4,
  consecutiveYears: 5,
  sectorAvgYield: 2.9,
};

// ── Fon Yöneticileri ──

export interface FundManager {
  id: string;
  name: string;
  fund: string;
  aum: number;
  returnYtd: number;
  return1y: number;
  return3y: number;
  style: string;
  topHoldings: {
    ticker: string;
    name: string;
    weight: number;
    change: "arttırdı" | "azalttı" | "yeni" | "sabit";
  }[];
  lastUpdate: string;
}

export const MOCK_FUND_MANAGERS: FundManager[] = [
  {
    id: "fm-1",
    name: "Burak Cem Ece",
    fund: "İş Portföy",
    aum: 48_500_000_000,
    returnYtd: 18.4,
    return1y: 52.3,
    return3y: 38.7,
    style: "Karma",
    topHoldings: [
      { ticker: "THYAO", name: "Türk Hava Yolları", weight: 14.2, change: "arttırdı" },
      { ticker: "GARAN", name: "Garanti Bankası", weight: 11.8, change: "sabit" },
      { ticker: "ASELS", name: "Aselsan", weight: 9.5, change: "arttırdı" },
      { ticker: "KCHOL", name: "Koç Holding", weight: 8.3, change: "azalttı" },
      { ticker: "BIMAS", name: "BİM Mağazalar", weight: 7.1, change: "sabit" },
      { ticker: "TUPRS", name: "Tüpraş", weight: 6.4, change: "yeni" },
    ],
    lastUpdate: "2026-04-11",
  },
  {
    id: "fm-2",
    name: "Alper Akçam",
    fund: "Yapı Kredi Portföy",
    aum: 35_200_000_000,
    returnYtd: 22.1,
    return1y: 61.8,
    return3y: 42.5,
    style: "Büyüme",
    topHoldings: [
      { ticker: "FROTO", name: "Ford Otosan", weight: 12.5, change: "sabit" },
      { ticker: "THYAO", name: "Türk Hava Yolları", weight: 10.8, change: "arttırdı" },
      { ticker: "SAHOL", name: "Sabancı Holding", weight: 9.2, change: "sabit" },
      { ticker: "TOASO", name: "Tofaş Oto. Fab.", weight: 8.6, change: "yeni" },
      { ticker: "AKBNK", name: "Akbank", weight: 7.9, change: "azalttı" },
      { ticker: "SISE", name: "Şişecam", weight: 6.3, change: "sabit" },
      { ticker: "EREGL", name: "Ereğli Demir Çelik", weight: 5.8, change: "arttırdı" },
    ],
    lastUpdate: "2026-04-10",
  },
  {
    id: "fm-3",
    name: "Cem Özdemir",
    fund: "Ak Portföy",
    aum: 32_800_000_000,
    returnYtd: 15.7,
    return1y: 47.2,
    return3y: 35.1,
    style: "Değer",
    topHoldings: [
      { ticker: "GARAN", name: "Garanti Bankası", weight: 13.4, change: "arttırdı" },
      { ticker: "YKBNK", name: "Yapı Kredi Bankası", weight: 10.1, change: "sabit" },
      { ticker: "KCHOL", name: "Koç Holding", weight: 9.8, change: "sabit" },
      { ticker: "TUPRS", name: "Tüpraş", weight: 8.2, change: "azalttı" },
      { ticker: "TCELL", name: "Turkcell", weight: 7.5, change: "yeni" },
      { ticker: "ISCTR", name: "İş Bankası", weight: 6.9, change: "sabit" },
    ],
    lastUpdate: "2026-04-09",
  },
  {
    id: "fm-4",
    name: "Murat Güler",
    fund: "Garanti Portföy",
    aum: 28_400_000_000,
    returnYtd: 20.3,
    return1y: 55.6,
    return3y: 40.2,
    style: "Büyüme",
    topHoldings: [
      { ticker: "ASELS", name: "Aselsan", weight: 15.1, change: "arttırdı" },
      { ticker: "THYAO", name: "Türk Hava Yolları", weight: 12.3, change: "sabit" },
      { ticker: "PGSUS", name: "Pegasus", weight: 8.7, change: "yeni" },
      { ticker: "BIMAS", name: "BİM Mağazalar", weight: 7.4, change: "sabit" },
      { ticker: "FROTO", name: "Ford Otosan", weight: 6.8, change: "azalttı" },
      { ticker: "SAHOL", name: "Sabancı Holding", weight: 6.2, change: "arttırdı" },
      { ticker: "LOGO", name: "Logo Yazılım", weight: 4.5, change: "yeni" },
    ],
    lastUpdate: "2026-04-12",
  },
  {
    id: "fm-5",
    name: "Serkan Turgut",
    fund: "QNB Finans Portföy",
    aum: 19_600_000_000,
    returnYtd: 24.8,
    return1y: 64.1,
    return3y: 44.3,
    style: "Agresif Büyüme",
    topHoldings: [
      { ticker: "THYAO", name: "Türk Hava Yolları", weight: 16.2, change: "arttırdı" },
      { ticker: "TOASO", name: "Tofaş Oto. Fab.", weight: 11.4, change: "yeni" },
      { ticker: "ASELS", name: "Aselsan", weight: 10.1, change: "sabit" },
      { ticker: "EREGL", name: "Ereğli Demir Çelik", weight: 8.9, change: "arttırdı" },
      { ticker: "DOAS", name: "Doğuş Otomotiv", weight: 7.3, change: "sabit" },
    ],
    lastUpdate: "2026-04-11",
  },
  {
    id: "fm-6",
    name: "Ayşe Kılınç",
    fund: "TEB Portföy",
    aum: 14_200_000_000,
    returnYtd: 12.9,
    return1y: 41.5,
    return3y: 32.8,
    style: "Değer",
    topHoldings: [
      { ticker: "AKBNK", name: "Akbank", weight: 14.6, change: "sabit" },
      { ticker: "GARAN", name: "Garanti Bankası", weight: 12.2, change: "arttırdı" },
      { ticker: "TTKOM", name: "Türk Telekom", weight: 9.8, change: "sabit" },
      { ticker: "ENJSA", name: "Enerjisa Enerji", weight: 8.1, change: "yeni" },
      { ticker: "TUPRS", name: "Tüpraş", weight: 7.5, change: "azalttı" },
      { ticker: "SISE", name: "Şişecam", weight: 6.4, change: "sabit" },
    ],
    lastUpdate: "2026-04-08",
  },
  {
    id: "fm-7",
    name: "Hakan Aydın",
    fund: "Deniz Portföy",
    aum: 11_800_000_000,
    returnYtd: 19.6,
    return1y: 53.4,
    return3y: 37.9,
    style: "Karma",
    topHoldings: [
      { ticker: "KCHOL", name: "Koç Holding", weight: 13.7, change: "arttırdı" },
      { ticker: "SAHOL", name: "Sabancı Holding", weight: 11.2, change: "sabit" },
      { ticker: "THYAO", name: "Türk Hava Yolları", weight: 9.4, change: "sabit" },
      { ticker: "BIMAS", name: "BİM Mağazalar", weight: 8.6, change: "azalttı" },
      { ticker: "FROTO", name: "Ford Otosan", weight: 7.1, change: "arttırdı" },
      { ticker: "AYGAZ", name: "Aygaz", weight: 5.3, change: "yeni" },
    ],
    lastUpdate: "2026-04-10",
  },
  {
    id: "fm-8",
    name: "Elif Tanrıverdi",
    fund: "Ziraat Portföy",
    aum: 22_100_000_000,
    returnYtd: 16.5,
    return1y: 48.9,
    return3y: 36.4,
    style: "Karma",
    topHoldings: [
      { ticker: "GARAN", name: "Garanti Bankası", weight: 11.9, change: "sabit" },
      { ticker: "THYAO", name: "Türk Hava Yolları", weight: 10.5, change: "arttırdı" },
      { ticker: "ASELS", name: "Aselsan", weight: 9.3, change: "sabit" },
      { ticker: "ISCTR", name: "İş Bankası", weight: 8.7, change: "arttırdı" },
      { ticker: "AKBNK", name: "Akbank", weight: 7.8, change: "azalttı" },
      { ticker: "TCELL", name: "Turkcell", weight: 6.2, change: "sabit" },
      { ticker: "EREGL", name: "Ereğli Demir Çelik", weight: 5.1, change: "yeni" },
    ],
    lastUpdate: "2026-04-12",
  },
];

// ── KAP AI Summary Mock Data ──

export const MOCK_KAP_SUMMARIES: Record<
  string,
  {
    summary: string;
    impact: "pozitif" | "negatif" | "nötr";
    impactScore: number;
    keyPoints: string[];
    financialHighlights?: { metric: string; value: string; change?: string }[];
    recommendation: string;
  }
> = {
  "1": {
    summary:
      "THY 2025 4. çeyrek finansal sonuçlarını açıkladı. Net kar bir önceki yılın aynı dönemine göre %18 artışla 42 milyar TL seviyesine ulaştı. Güçlü yolcu talebi ve kapasite artışı karlılığı destekledi.",
    impact: "pozitif",
    impactScore: 4,
    keyPoints: [
      "Net kar %18 artışla 42 milyar TL olarak gerçekleşti",
      "Yolcu sayısı rekor seviyeye ulaştı",
      "Uluslararası uçuş ağı genişlemeye devam ediyor",
      "Yakıt maliyetlerindeki düşüş marjları olumlu etkiledi",
    ],
    financialHighlights: [
      { metric: "Net Kar", value: "₺42 Milyar", change: "+%18" },
      { metric: "Hasılat", value: "₺198 Milyar", change: "+%22" },
      { metric: "FAVÖK Marjı", value: "%28.5", change: "+2.1 puan" },
    ],
    recommendation:
      "Güçlü operasyonel performans ve artan karlılık hisseyi cazip kılıyor. Mevcut F/K seviyesi sektör ortalamasının altında.",
  },
  "2": {
    summary:
      "Garanti BBVA yönetim kurulu hisse başına 8.50 TL brüt temettü dağıtılmasını genel kurula önerdi. Bu, %6.2 temettü verimine karşılık geliyor ve bankacılık sektöründe en yüksek temettü verimlerinden biri.",
    impact: "pozitif",
    impactScore: 3,
    keyPoints: [
      "Hisse başına 8.50 TL brüt temettü önerisi",
      "Temettü verimi %6.2 seviyesinde",
      "Dağıtım oranı %35 ile sürdürülebilir seviyede",
      "Genel kurul onayı bekleniyor",
    ],
    financialHighlights: [
      { metric: "Hisse Başına Temettü", value: "₺8.50", change: "+%15" },
      { metric: "Temettü Verimi", value: "%6.2" },
      { metric: "Dağıtım Oranı", value: "%35" },
    ],
    recommendation:
      "Yüksek temettü verimi gelir odaklı yatırımcılar için çekici. Temettü tarihi yaklaşırken hissede talep artabilir.",
  },
  "3": {
    summary:
      "Aselsan, Savunma Sanayi Başkanlığı ile 2.8 milyar USD tutarında yeni bir savunma sözleşmesi imzaladı. Sözleşme şirketin sipariş defterini önemli ölçüde güçlendiriyor ve önümüzdeki 5 yıl için gelir görünürlüğü sağlıyor.",
    impact: "pozitif",
    impactScore: 5,
    keyPoints: [
      "2.8 milyar USD tutarında yeni savunma sözleşmesi",
      "Sipariş defteri rekor seviyeye ulaştı",
      "Sözleşme 5 yıllık teslimat süresine yayılıyor",
      "Yerli savunma sanayii yatırımları artmaya devam ediyor",
    ],
    financialHighlights: [
      { metric: "Sözleşme Tutarı", value: "$2.8 Milyar" },
      { metric: "Sipariş Defteri", value: "$12.5 Milyar", change: "+%28" },
    ],
    recommendation:
      "Devasa sözleşme uzun vadeli büyüme görünürlüğünü artırıyor. Savunma sektörü stratejik öncelik olmaya devam ediyor.",
  },
  "4": {
    summary:
      "BİM Birleşik Mağazalar olağan genel kurul toplantısını gerçekleştirdi. Tüm gündem maddeleri pay sahiplerinin onayıyla kabul edildi. Yönetim kurulu yeniden seçildi ve faaliyet raporu onaylandı.",
    impact: "nötr",
    impactScore: 0,
    keyPoints: [
      "Tüm gündem maddeleri oy birliğiyle kabul edildi",
      "Yönetim kurulu üyeleri yeniden seçildi",
      "2025 yılı faaliyet raporu onaylandı",
      "Bağımsız denetçi ataması gerçekleştirildi",
    ],
    recommendation:
      "Rutin genel kurul kararları. Hisse fiyatında belirgin bir etki beklenmemektedir.",
  },
  "5": {
    summary:
      "T.C. Varlık Fonu'nun Şişecam'daki payı %5 sınırını aştı. Bu durum, kamunun stratejik sanayi şirketlerindeki varlığını artırdığına işaret ediyor. Ortaklık yapısındaki değişiklik KAP'a bildirildi.",
    impact: "nötr",
    impactScore: 1,
    keyPoints: [
      "TVF'nin Şişecam'daki payı %5'i aştı",
      "Kamunun stratejik şirketlerdeki varlığı artıyor",
      "Ortaklık yapısı değişikliği resmi olarak bildirildi",
      "Piyasada sınırlı etki bekleniyor",
    ],
    recommendation:
      "TVF'nin pay artışı uzun vadede kurumsal destek sinyali olabilir ancak kısa vadede belirgin bir fiyat etkisi öngörülmüyor.",
  },
  "6": {
    summary:
      "Ereğli Demir Çelik 2025 4. çeyrek finansal sonuçlarını açıkladı. Gelirler %12 artışla 48 milyar TL'ye ulaşırken, çelik fiyatlarındaki toparlanma ve ihracat artışı büyümeyi destekledi.",
    impact: "pozitif",
    impactScore: 3,
    keyPoints: [
      "Gelir %12 artışla 48 milyar TL'ye ulaştı",
      "Çelik fiyatlarındaki toparlanma olumlu etki yarattı",
      "İhracat gelirlerindeki artış dikkat çekici",
      "Maliyet baskıları marjları sınırlı ölçüde daralttı",
    ],
    financialHighlights: [
      { metric: "Gelir", value: "₺48 Milyar", change: "+%12" },
      { metric: "FAVÖK", value: "₺11.2 Milyar", change: "+%8" },
      { metric: "Net Kar Marjı", value: "%14.5", change: "-0.8 puan" },
    ],
    recommendation:
      "Gelir büyümesi sağlam ancak marj daralması takip edilmeli. Çelik fiyat trendleri hissenin kısa vadeli performansını belirleyecek.",
  },
  "7": {
    summary:
      "Koç Holding yönetim kurulu hisse başına 12.00 TL brüt temettü dağıtılması kararı aldı. Holding bünyesindeki şirketlerin güçlü performansı temettü artışını destekledi. Temettü verimi %4.8 seviyesinde.",
    impact: "pozitif",
    impactScore: 3,
    keyPoints: [
      "Hisse başına 12.00 TL brüt temettü kararı",
      "Bir önceki yıla göre %20 temettü artışı",
      "Temettü verimi %4.8 seviyesinde",
      "Holding şirketlerinin güçlü nakit akışı temettüyü destekliyor",
    ],
    financialHighlights: [
      { metric: "Hisse Başına Temettü", value: "₺12.00", change: "+%20" },
      { metric: "Temettü Verimi", value: "%4.8" },
      { metric: "Dağıtım Oranı", value: "%40" },
    ],
    recommendation:
      "Güçlü temettü artışı holding değerlemesini destekliyor. Uzun vadeli yatırımcılar için çekici bir getiri profili sunuyor.",
  },
  "8": {
    summary:
      "Tüpraş İzmit rafinerisinde 1.2 milyar USD tutarında kapasite artırım yatırımı başlattı. Yatırım 2028 yılında tamamlanacak ve rafineri kapasitesini %25 artıracak. Proje finansmanı özkaynak ve kredi karması ile sağlanacak.",
    impact: "pozitif",
    impactScore: 2,
    keyPoints: [
      "1.2 milyar USD tutarında kapasite artırım yatırımı",
      "Rafineri kapasitesi %25 artacak",
      "Yatırım 2028 yılında tamamlanacak",
      "Kısa vadede nakit akışı üzerinde baskı oluşturabilir",
    ],
    financialHighlights: [
      { metric: "Yatırım Tutarı", value: "$1.2 Milyar" },
      { metric: "Kapasite Artışı", value: "%25" },
      { metric: "Tamamlanma", value: "2028" },
    ],
    recommendation:
      "Uzun vadeli büyüme potansiyeli yüksek ancak yatırım döneminde serbest nakit akışı baskılanabilir. Sabırlı yatırımcılar için fırsat olabilir.",
  },
};
