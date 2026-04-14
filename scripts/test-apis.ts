const TESTS = [
  {
    name: "Bigpara - Hisse Listesi",
    url: "http://bigpara.hurriyet.com.tr/api/v1/hisse/list",
  },
  {
    name: "Bigpara - THYAO Detay",
    url: "http://bigpara.hurriyet.com.tr/api/v1/borsa/hisseyuzeysel/THYAO",
  },
  {
    name: "Yahoo Finance - THYAO Fiyat",
    url: "https://query1.finance.yahoo.com/v8/finance/chart/THYAO.IS?range=5d&interval=1d",
  },
  {
    name: "KAP RSS",
    url: "https://www.kap.org.tr/tr/rss/bildirim",
  },
];

async function main() {
  console.log("API bağlantı testi başlıyor...\n");

  for (const test of TESTS) {
    try {
      const start = Date.now();
      const res = await fetch(test.url);
      const elapsed = Date.now() - start;
      const status = res.ok ? "OK" : `FAIL (${res.status})`;
      console.log(`[${status}] ${test.name} — ${elapsed}ms`);
    } catch (err) {
      console.log(`[ERROR] ${test.name} — ${(err as Error).message}`);
    }
  }

  console.log("\nTest tamamlandı.");
}

main();
