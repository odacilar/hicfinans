export interface AIRecommendation {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  recommendation: "Güçlü Al" | "Al" | "Tut" | "Sat" | "Güçlü Sat";
  confidence: number; // 0-100
  targetPrice: number;
  upside: number; // %
  aiScore: number; // 0-100
  reasoning: string; // 3-4 sentence AI analysis
  strengths: string[]; // 3-4 bullet points
  weaknesses: string[]; // 2-3 bullet points
  catalysts: string[]; // upcoming catalysts
  riskLevel: "düşük" | "orta" | "yüksek";
  timeHorizon: "kısa vade" | "orta vade" | "uzun vade";
  lastUpdated: string; // ISO date
}

export const MOCK_AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    ticker: "THYAO",
    name: "Türk Hava Yolları A.O.",
    sector: "Ulaştırma",
    price: 312.5,
    recommendation: "Güçlü Al",
    confidence: 92,
    targetPrice: 410.0,
    upside: 31.2,
    aiScore: 91,
    reasoning:
      "THY, küresel havacılık sektöründe İstanbul hub avantajıyla güçlü bir büyüme hikayesi sunuyor. Son çeyrek gelirlerinde %28 artış ve rekor yolcu sayıları, operasyonel verimliliğin sürdüğünü gösteriyor. F/K oranı sektör ortalamalarının altında kalmaya devam ederken, güçlü serbest nakit akışı ve düşen borçluluk oranı hisseyi cazip kılıyor. Dolar bazlı gelir yapısı, TL'nin değer kaybı ortamında doğal bir koruma sağlıyor.",
    strengths: [
      "Küresel transit merkez olarak İstanbul hub'ının stratejik avantajı",
      "Güçlü dolar bazlı gelir yapısı ile kur koruması",
      "Sektör ortalamasının altında F/K oranı (6.8x vs 9.2x)",
      "Rekor yolcu ve doluluk oranları ile operasyonel mükemmellik",
    ],
    weaknesses: [
      "Jet yakıtı fiyatlarındaki dalgalanma maliyet baskısı yaratabilir",
      "Jeopolitik riskler ve hava sahası kısıtlamaları potansiyel tehdit",
      "Yüksek yatırım harcamaları kısa vadede nakit akışını baskılayabilir",
    ],
    catalysts: [
      "2025 yaz sezonu için güçlü ön rezervasyon verileri",
      "İstanbul Havalimanı kapasite artışı tamamlanma aşamasında",
      "Yeni uzun menzil hatları (Avustralya, Güney Amerika) açılışı",
    ],
    riskLevel: "orta",
    timeHorizon: "orta vade",
    lastUpdated: "2026-04-13T08:30:00Z",
  },
  {
    ticker: "GARAN",
    name: "Türkiye Garanti Bankası A.Ş.",
    sector: "Bankacılık",
    price: 132.4,
    recommendation: "Güçlü Al",
    confidence: 89,
    targetPrice: 175.0,
    upside: 32.2,
    aiScore: 88,
    reasoning:
      "Garanti Bankası, Türk bankacılık sektöründe en güçlü aktif kalitesine sahip oyunculardan biri olmaya devam ediyor. ROE %35 seviyesinde sektör ortalamasının üzerinde seyrederken, dijital bankacılık yatırımları maliyet-gelir oranını %32'ye düşürdü. BBVA ortaklığı uluslararası sermaye erişimini güçlendirirken, kredi büyümesi kontrollü bir şekilde sürdürülüyor. Temettü verimi %5.8 ile cazip gelir sağlıyor.",
    strengths: [
      "Sektör lideri ROE (%35) ve aktif kalitesi",
      "Dijital bankacılıkta Türkiye'nin en gelişmiş altyapısı",
      "BBVA ortaklığı ile güçlü uluslararası destek",
      "Düşük maliyet-gelir oranı (%32) ile operasyonel verimlilik",
    ],
    weaknesses: [
      "Makroekonomik belirsizlikler kredi riskini artırabilir",
      "Düzenleyici değişiklikler (faiz tavanları, komisyon limitleri) karlılığı etkileyebilir",
    ],
    catalysts: [
      "Faiz indirim döngüsünün başlaması ile net faiz marjı genişlemesi",
      "Dijital cüzdan ve ödeme sistemlerinde pazar payı artışı",
      "MSCI EM endeks ağırlık artışı beklentisi",
    ],
    riskLevel: "orta",
    timeHorizon: "orta vade",
    lastUpdated: "2026-04-13T09:15:00Z",
  },
  {
    ticker: "BIMAS",
    name: "BİM Birleşik Mağazalar A.Ş.",
    sector: "Perakende Ticaret",
    price: 540.0,
    recommendation: "Al",
    confidence: 84,
    targetPrice: 670.0,
    upside: 24.1,
    aiScore: 83,
    reasoning:
      "BİM, Türkiye'nin indirimli perakende lideri olarak enflasyonist ortamda defansif bir yatırım alternatifi sunuyor. Mağaza sayısı 12.000'i aşarak ölçek ekonomisi avantajını pekiştirirken, özel marka penetrasyonu %65'e ulaştı. Yurtdışı operasyonları (Fas, Mısır) büyüme potansiyeli taşıyor. Ancak artan kira ve personel maliyetleri marjlar üzerinde baskı oluşturabilir.",
    strengths: [
      "Türkiye'nin en geniş mağaza ağı ile ölçek ekonomisi",
      "Enflasyona dirençli defansif iş modeli",
      "Yüksek özel marka penetrasyonu ile güçlü brüt marj",
    ],
    weaknesses: [
      "Artan kira ve personel maliyetleri marj baskısı yaratıyor",
      "Yoğun rekabet ortamı (A101, ŞOK) fiyat avantajını daraltıyor",
      "Yurtdışı operasyonlarda kur riski",
    ],
    catalysts: [
      "Yeni mağaza açılışları ile gelir büyümesi ivmesi",
      "Dijital sipariş ve teslimat altyapısının genişlemesi",
    ],
    riskLevel: "düşük",
    timeHorizon: "uzun vade",
    lastUpdated: "2026-04-12T14:00:00Z",
  },
  {
    ticker: "ASELS",
    name: "Aselsan Elektronik Sanayi ve Ticaret A.Ş.",
    sector: "Savunma",
    price: 78.9,
    recommendation: "Al",
    confidence: 86,
    targetPrice: 102.0,
    upside: 29.3,
    aiScore: 85,
    reasoning:
      "Aselsan, Türkiye'nin savunma sanayii lokomotifi olarak güçlü sipariş defteri ve artan ihracat gelirleri ile büyümesini sürdürüyor. Sipariş defteri $12 milyarı aşarak gelecek 3-4 yıllık gelir görünürlüğü sağlıyor. AR-GE yoğunluğu %15 ile sektörde lider konumda olan şirket, elektronik harp, radar ve iletişim sistemlerinde küresel rekabet gücü kazanıyor. İhracat payının %30'a yükselmesi bekleniyor.",
    strengths: [
      "$12 milyarı aşan sipariş defteri ile güçlü gelir görünürlüğü",
      "AR-GE yoğunluğu %15 ile teknoloji liderliği",
      "Artan ihracat gelirleri ve döviz bazlı kontratlar",
      "Devlet destekli güçlü müşteri tabanı",
    ],
    weaknesses: [
      "Yüksek devlet bağımlılığı iç talep riski yaratıyor",
      "Uzun proje döngüleri nakit akışını geciktirebilir",
    ],
    catalysts: [
      "Yeni nesil hava savunma sistemi ihracat anlaşmaları",
      "Orta Doğu ve Güneydoğu Asya pazarlarına açılım",
      "Uzay ve uydu teknolojilerinde yeni proje kazanımları",
    ],
    riskLevel: "orta",
    timeHorizon: "uzun vade",
    lastUpdated: "2026-04-13T10:00:00Z",
  },
  {
    ticker: "KCHOL",
    name: "Koç Holding A.Ş.",
    sector: "Holding ve Yatırım",
    price: 188.3,
    recommendation: "Al",
    confidence: 81,
    targetPrice: 235.0,
    upside: 24.8,
    aiScore: 80,
    reasoning:
      "Koç Holding, Türkiye'nin en çeşitlendirilmiş holding yapısıyla enerji, otomotiv, finans ve dayanıklı tüketim sektörlerinde güçlü pozisyonlara sahip. Net aktif değerine göre %25 iskontolu işlem görmesi değerleme açısından fırsat sunuyor. Tüpraş ve Ford Otosan'daki güçlü performans konsolide sonuçları desteklerken, Yapı Kredi'deki bankacılık gelirleri istikrarlı katkı sağlıyor.",
    strengths: [
      "Çok sektörlü çeşitlendirilmiş portföy ile risk dağılımı",
      "Net aktif değerine göre %25 iskonto",
      "Türkiye'nin en güçlü kurumsal yönetim yapısı",
    ],
    weaknesses: [
      "Holding iskontosu uzun süre devam edebilir",
      "Enerji sektöründeki döngüsellik konsolide sonuçları dalgalandırabilir",
      "Karmaşık yapı nedeniyle yatırımcı ilgisi sınırlı kalabilir",
    ],
    catalysts: [
      "Tüpraş rafineri marjlarında toparlanma",
      "Ford Otosan elektrikli araç üretim yatırımları",
      "Holding iskontosunun daralması potansiyeli",
    ],
    riskLevel: "düşük",
    timeHorizon: "uzun vade",
    lastUpdated: "2026-04-12T16:30:00Z",
  },
  {
    ticker: "EREGL",
    name: "Ereğli Demir ve Çelik Fabrikaları T.A.Ş.",
    sector: "Demir, Çelik ve Metal",
    price: 48.72,
    recommendation: "Tut",
    confidence: 72,
    targetPrice: 54.0,
    upside: 10.8,
    aiScore: 62,
    reasoning:
      "Erdemir, Türkiye'nin en büyük yassı çelik üreticisi olarak sektörel döngüye bağlı bir performans sergiliyor. Küresel çelik fiyatlarındaki baskı ve Çin'in artan ihracatı marjları sınırlandırıyor. Ancak güçlü bilanço yapısı, düşük borçluluk ve düzenli temettü ödemesi şirketi sektöründe defansif bir tercih yapıyor. Kısa vadede yukarı yönlü katalizör sınırlı görünüyor.",
    strengths: [
      "Türkiye'nin en büyük yassı çelik üreticisi olarak pazar liderliği",
      "Düşük borçluluk oranı ve güçlü bilanço",
      "Düzenli temettü ödeme geçmişi",
    ],
    weaknesses: [
      "Küresel çelik fiyatlarına yüksek duyarlılık",
      "Çin'in artan çelik ihracatı rekabet baskısı yaratıyor",
      "Enerji maliyetlerindeki artış marjları daraltıyor",
    ],
    catalysts: [
      "İnşaat sektöründe canlanma ile iç talep artışı",
      "AB karbon sınır düzenlemesi ile Çin çeliğine ek vergi",
    ],
    riskLevel: "orta",
    timeHorizon: "orta vade",
    lastUpdated: "2026-04-11T11:00:00Z",
  },
  {
    ticker: "TCELL",
    name: "Turkcell İletişim Hizmetleri A.Ş.",
    sector: "Telekomünikasyon",
    price: 96.5,
    recommendation: "Tut",
    confidence: 68,
    targetPrice: 108.0,
    upside: 11.9,
    aiScore: 58,
    reasoning:
      "Turkcell, Türkiye'nin lider mobil operatörü olarak istikrarlı nakit akışı üreten defansif bir hisse. Dijital servisler ve Paycell ödeme platformu büyüme potansiyeli taşıyor ancak yoğun düzenleyici ortam ve fiyat rekabeti marjları sınırlıyor. ARPU büyümesi enflasyonun gerisinde kalıyor. Temettü verimi %4.2 ile gelir arayan yatırımcılar için cazip ancak güçlü bir büyüme hikayesi sunmuyor.",
    strengths: [
      "Türkiye'nin en geniş mobil abone tabanı",
      "Dijital servisler ve fintech (Paycell) ile çeşitlenme",
      "İstikrarlı nakit akışı ve temettü ödemesi",
    ],
    weaknesses: [
      "Yoğun düzenleyici ortam ve frekans maliyetleri",
      "ARPU büyümesi enflasyonun gerisinde",
    ],
    catalysts: [
      "5G lisans ihalesi ve altyapı yatırımları",
      "Paycell'in dijital cüzdan pazarında büyümesi",
    ],
    riskLevel: "düşük",
    timeHorizon: "uzun vade",
    lastUpdated: "2026-04-12T09:45:00Z",
  },
  {
    ticker: "SASA",
    name: "SASA Polyester Sanayi A.Ş.",
    sector: "Kimya, Petrol ve Plastik",
    price: 42.8,
    recommendation: "Tut",
    confidence: 65,
    targetPrice: 48.5,
    upside: 13.3,
    aiScore: 55,
    reasoning:
      "SASA, devasa yatırım döngüsünün ortasında olup yeni kapasite yatırımları tamamlandığında gelir potansiyeli önemli ölçüde artacak. Ancak yüksek borçluluk oranı, artan faiz maliyetleri ve küresel polyester fiyatlarındaki baskı kısa-orta vadede risk oluşturuyor. Yatırım geri dönüşü için sabırlı olmak gerekiyor. Mevcut değerlemede risk-getiri dengesi nötr görünüyor.",
    strengths: [
      "Türkiye'nin tek entegre polyester üreticisi",
      "Kapasite artışı ile gelecek büyüme potansiyeli",
      "Stratejik sektör konumu ve ithal ikame avantajı",
    ],
    weaknesses: [
      "Yüksek borçluluk oranı ve artan faiz maliyetleri",
      "Küresel polyester fiyatlarındaki baskı",
      "Yatırım döneminde serbest nakit akışı negatif",
    ],
    catalysts: [
      "Yeni PTA tesisinin devreye alınması",
      "Küresel polyester fiyatlarında toparlanma",
    ],
    riskLevel: "yüksek",
    timeHorizon: "uzun vade",
    lastUpdated: "2026-04-11T15:20:00Z",
  },
  {
    ticker: "PGSUS",
    name: "Pegasus Hava Taşımacılığı A.Ş.",
    sector: "Ulaştırma",
    price: 1125.0,
    recommendation: "Al",
    confidence: 82,
    targetPrice: 1420.0,
    upside: 26.2,
    aiScore: 81,
    reasoning:
      "Pegasus, düşük maliyetli havacılık modeliyle Avrupa ve Orta Doğu bağlantılarında güçlü büyüme sergiliyor. Birim koltuk maliyetleri sektörün en düşükleri arasında yer alırken, yüksek doluluk oranları (%92) gelir verimliliğini destekliyor. Filo gençleştirme programı yakıt maliyetlerini düşürecek. Ancak tavan fiyat rekabeti ve jet yakıtı dalgalanmaları risk faktörleri arasında.",
    strengths: [
      "Avrupa'nın en düşük birim koltuk maliyetlerinden biri",
      "Güçlü doluluk oranları (%92) ve gelir yönetimi",
      "Genç ve yakıt verimli filo yapısı",
      "Güçlü dijital satış kanalları",
    ],
    weaknesses: [
      "Jet yakıtı fiyat dalgalanmalarına duyarlılık",
      "THY ile iç hatlarda yoğun rekabet",
    ],
    catalysts: [
      "Yeni hat açılışları ile network genişlemesi",
      "Filo gençleştirme programı ile maliyet tasarrufu",
      "Yaz sezonu güçlü talep beklentisi",
    ],
    riskLevel: "orta",
    timeHorizon: "orta vade",
    lastUpdated: "2026-04-13T07:00:00Z",
  },
  {
    ticker: "TUPRS",
    name: "Tüpraş-Türkiye Petrol Rafinerileri A.Ş.",
    sector: "Enerji",
    price: 172.8,
    recommendation: "Sat",
    confidence: 74,
    targetPrice: 145.0,
    upside: -16.1,
    aiScore: 35,
    reasoning:
      "Tüpraş, daralan rafineri marjları ve küresel petrol ürünleri arz fazlası nedeniyle zorlu bir dönemden geçiyor. Akdeniz rafineri marjları son 3 yılın en düşük seviyesine geriledi. Enerji dönüşümü kapsamında uzun vadeli yapısal riskler de göz önünde bulundurulmalı. Yüksek temettü verimi cazip görünse de, marj baskısı devam ederse sürdürülebilirliği sorgulanacak.",
    strengths: [
      "Türkiye'nin tek büyük rafinerisi olarak stratejik konum",
      "Yüksek temettü verimi (%8.5)",
    ],
    weaknesses: [
      "Küresel rafineri marjlarında daralma",
      "Enerji dönüşümü kapsamında uzun vadeli yapısal risk",
      "Döviz bazlı maliyet yapısı ile kur riski",
    ],
    catalysts: [
      "Rafineri marjlarında döngüsel toparlanma (belirsiz zamanlama)",
      "Yeşil hidrojen ve biyoyakıt yatırımları",
    ],
    riskLevel: "yüksek",
    timeHorizon: "kısa vade",
    lastUpdated: "2026-04-13T11:30:00Z",
  },
  {
    ticker: "PETKM",
    name: "Petkim Petrokimya Holding A.Ş.",
    sector: "Kimya, Petrol ve Plastik",
    price: 18.92,
    recommendation: "Güçlü Sat",
    confidence: 78,
    targetPrice: 13.5,
    upside: -28.6,
    aiScore: 22,
    reasoning:
      "Petkim, küresel petrokimya sektöründeki arz fazlası ve Çin'in artan ihracatıyla ciddi marj baskısı altında. Son 3 çeyrekte zarar açıklayan şirketin faaliyet nakit akışı da negatife dönmüş durumda. STAR rafineri sinerjileri beklentilerin gerisinde kalırken, yüksek enerji maliyetleri rekabet gücünü zayıflatıyor. Mevcut değerlemede bile risk-getiri profili olumsuz.",
    strengths: [
      "Türkiye'nin tek entegre petrokimya tesisi",
      "STAR rafineri ile hammadde tedarik avantajı potansiyeli",
    ],
    weaknesses: [
      "Son 3 çeyrekte zarar, negatif faaliyet nakit akışı",
      "Küresel petrokimya arz fazlası ve Çin rekabeti",
      "Yüksek enerji maliyetleri rekabet gücünü zayıflatıyor",
    ],
    catalysts: [
      "Küresel petrokimya fiyatlarında toparlanma (düşük olasılık)",
    ],
    riskLevel: "yüksek",
    timeHorizon: "kısa vade",
    lastUpdated: "2026-04-13T12:00:00Z",
  },
  {
    ticker: "CCOLA",
    name: "Coca-Cola İçecek A.Ş.",
    sector: "Gıda ve İçecek",
    price: 780.0,
    recommendation: "Al",
    confidence: 80,
    targetPrice: 950.0,
    upside: 21.8,
    aiScore: 79,
    reasoning:
      "Coca-Cola İçecek, 10 ülkede faaliyet gösteren coğrafi çeşitliliği ile savunmacı büyüme hikayesi sunuyor. Fiyatlama gücü enflasyonist ortamda gelir büyümesini desteklerken, hacim büyümesi Orta Asya ve Pakistan pazarlarından geliyor. Güçlü marka değeri ve Coca-Cola lisansı uzun vadeli rekabet avantajı sağlıyor. F/K oranı gelişen piyasa benzerlerinin hafif üzerinde seyrediyor.",
    strengths: [
      "10 ülkede faaliyet ile coğrafi çeşitlilik",
      "Güçlü fiyatlama gücü ve marka değeri",
      "Coca-Cola lisansı ile uzun vadeli rekabet avantajı",
      "İstikrarlı nakit akışı ve temettü ödemesi",
    ],
    weaknesses: [
      "Gelişen piyasa kur riskleri",
      "Şeker vergisi ve sağlık düzenlemeleri riski",
    ],
    catalysts: [
      "Orta Asya pazarlarında hacim büyümesi",
      "Yeni ürün kategorileri (enerji içeceği, su) lansmanları",
    ],
    riskLevel: "düşük",
    timeHorizon: "uzun vade",
    lastUpdated: "2026-04-12T13:15:00Z",
  },
  {
    ticker: "SAHOL",
    name: "Hacı Ömer Sabancı Holding A.Ş.",
    sector: "Holding ve Yatırım",
    price: 82.6,
    recommendation: "Tut",
    confidence: 70,
    targetPrice: 92.0,
    upside: 11.4,
    aiScore: 60,
    reasoning:
      "Sabancı Holding, bankacılık (Akbank), enerji (Enerjisa) ve çimento sektörlerindeki güçlü konumuyla çeşitlendirilmiş bir portföy sunuyor. Akbank'ın güçlü performansı konsolide sonuçları desteklerken, enerji segmenti istikrarlı katkı sağlıyor. Ancak holding iskontosu %20 civarında devam ediyor ve çimento sektöründeki yavaşlama risk oluşturuyor. Mevcut seviyede adil değerlenmiş görünüyor.",
    strengths: [
      "Akbank, Enerjisa ve çimento ile çeşitlendirilmiş portföy",
      "Güçlü kurumsal yönetim ve şeffaf raporlama",
      "Enerji dönüşümü yatırımları ile geleceğe hazırlık",
    ],
    weaknesses: [
      "Holding iskontosu %20 civarında devam ediyor",
      "Çimento sektöründeki yavaşlama riski",
    ],
    catalysts: [
      "Akbank'ın faiz indirim döngüsünden faydalanması",
      "Yenilenebilir enerji yatırımlarının devreye girmesi",
    ],
    riskLevel: "orta",
    timeHorizon: "orta vade",
    lastUpdated: "2026-04-12T10:30:00Z",
  },
  {
    ticker: "AKBNK",
    name: "Akbank T.A.Ş.",
    sector: "Bankacılık",
    price: 62.35,
    recommendation: "Güçlü Al",
    confidence: 87,
    targetPrice: 85.0,
    upside: 36.3,
    aiScore: 86,
    reasoning:
      "Akbank, Türk bankacılık sektörünün en iyi aktif kalitesine sahip bankası olarak öne çıkıyor. ROE %38 ile sektör ortalamasının üzerinde seyrederken, dijital bankacılık platformu müşteri edinim maliyetlerini düşürüyor. Sorunlu kredi oranı %1.8 ile sektörün en düşüğü. Faiz indirim döngüsünün başlaması ile menkul kıymet portföyünden önemli değer açığa çıkacak ve net faiz marjı genişleyecek.",
    strengths: [
      "Sektörün en düşük sorunlu kredi oranı (%1.8)",
      "ROE %38 ile sektör ortalamasının üzerinde",
      "Dijital bankacılıkta güçlü altyapı",
      "Konservatif risk yönetimi politikası",
    ],
    weaknesses: [
      "Makroekonomik oynaklığa duyarlılık",
      "Düzenleyici değişiklik riskleri",
    ],
    catalysts: [
      "Faiz indirim döngüsü ile menkul kıymet portföy değer artışı",
      "Dijital bankacılık müşteri tabanı genişlemesi",
      "MSCI ağırlık artışı potansiyeli",
    ],
    riskLevel: "orta",
    timeHorizon: "orta vade",
    lastUpdated: "2026-04-13T08:00:00Z",
  },
  {
    ticker: "SKBNK",
    name: "Şekerbank T.A.Ş.",
    sector: "Bankacılık",
    price: 7.94,
    recommendation: "Sat",
    confidence: 71,
    targetPrice: 6.2,
    upside: -21.9,
    aiScore: 30,
    reasoning:
      "Şekerbank, zayıf aktif kalitesi ve düşük karlılık metrikleriyle sektörün gerisinde kalmaya devam ediyor. ROE %8 ile sektör ortalamasının çok altında seyrederken, sorunlu kredi oranı %5.2 ile endişe verici seviyede. Sermaye yeterliliği rasyosu yasal sınıra yakın seyrediyor ve sermaye artırımı ihtiyacı gündemde. Dijital bankacılık altyapısı rakiplerinin gerisinde. Risk-getiri profili olumsuz.",
    strengths: [
      "Anadolu'da yaygın şube ağı ile niş müşteri tabanı",
      "Tarım bankacılığında uzmanlaşma",
    ],
    weaknesses: [
      "ROE %8 ile sektör ortalamasının çok altında",
      "Sorunlu kredi oranı %5.2 ile yüksek",
      "Sermaye yeterliliği rasyosu yasal sınıra yakın",
    ],
    catalysts: [
      "Olası stratejik ortak veya satış senaryosu",
    ],
    riskLevel: "yüksek",
    timeHorizon: "kısa vade",
    lastUpdated: "2026-04-11T14:00:00Z",
  },
];
