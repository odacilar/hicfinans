const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}

export function getStocks(params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  return fetchApi(`/api/stocks${qs}`);
}

export function getStockDetail(ticker: string) {
  return fetchApi(`/api/stocks/${ticker}`);
}

export function getKapNews(params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  return fetchApi(`/api/kap${qs}`);
}

export function postScreener(body: unknown) {
  return fetchApi("/api/screener", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
