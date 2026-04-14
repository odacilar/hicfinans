import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const BIGPARA_LIST_URL = "http://bigpara.hurriyet.com.tr/api/v1/hisse/list";

interface BigparaItem {
  sembol: string;
  ad: string;
  sektor: string;
}

async function main() {
  console.log("BIST hisse listesi çekiliyor...");

  const res = await fetch(BIGPARA_LIST_URL);
  if (!res.ok) throw new Error(`Bigpara API failed: ${res.status}`);

  const json = await res.json();
  const stocks: BigparaItem[] = json.data ?? [];

  console.log(`${stocks.length} hisse bulundu. Veritabanına yazılıyor...`);

  let created = 0;
  let skipped = 0;

  for (const stock of stocks) {
    const existing = await prisma.company.findUnique({
      where: { ticker: stock.sembol },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.company.create({
      data: {
        ticker: stock.sembol,
        name: stock.ad,
        sector: stock.sektor || "Diğer",
      },
    });
    created++;
  }

  console.log(`Tamamlandı! ${created} yeni şirket eklendi, ${skipped} zaten mevcuttu.`);
}

main()
  .catch((e) => {
    console.error("Seed hatası:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
