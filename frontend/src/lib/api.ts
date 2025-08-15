const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://gateone-deploy-production.up.railway.app";

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${txt}`);
  }
  return res.json() as Promise<T>;
}

export async function getLists() {
  const r = await fetch(`${BASE}/price/lists`);
  return asJson<{ locations: string[]; categories: string[] }>(r);
}

export async function getMeta() {
  const r = await fetch(`${BASE}/price/meta`);
  return asJson<any>(r);
}

export async function postPredict(body: any) {
  const r = await fetch(`${BASE}/price/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return asJson<any>(r);
}
