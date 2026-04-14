import { BIGPARA_BASE_URL } from "@/lib/constants";

interface BigparaStock {
  kod: string;
  ad: string;
  spidr: string;
  sektor: string;
  son: string;
  dun: string;
  yuzde: string;
  hacim: string;
  piyasaDegeri: string;
}

interface BigparaListResponse {
  data: {
    hpidr: string;
    sembol: string;
    ad: string;
    spidr: string;
    sektor: string;
  }[];
}

interface BigparaDetailResponse {
  data: {
    hpidr: string;
    sempidr: string;
    sembol: string;
    adi: string;
    spidr: string;
    sektor: string;
    kapanis: string;
    gunonceki: string;
    acilis: string;
    enDusuk: string;
    enYuksek: string;
    taban: string;
    tavan: string;
    hacimLot: string;
    hacimTl: string;
    fiyatAdimi: string;
    piyasaDegeri: string;
  };
}

export async function fetchStockList(): Promise<BigparaStock[]> {
  const res = await fetch(`${BIGPARA_BASE_URL}/hisse/list`);
  if (!res.ok) throw new Error(`Bigpara stock list failed: ${res.status}`);
  const json = await res.json() as BigparaListResponse;

  return json.data.map((item) => ({
    kod: item.sembol,
    ad: item.ad,
    spidr: item.spidr,
    sektor: item.sektor,
    son: "0",
    dun: "0",
    yuzde: "0",
    hacim: "0",
    piyasaDegeri: "0",
  }));
}

export async function fetchStockDetail(ticker: string): Promise<BigparaDetailResponse["data"] | null> {
  const res = await fetch(`${BIGPARA_BASE_URL}/borsa/hisseyuzeysel/${ticker}`);
  if (!res.ok) return null;
  const json = await res.json() as BigparaDetailResponse;
  return json.data;
}

export function parseBigparaNumber(value: string): number {
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
}
