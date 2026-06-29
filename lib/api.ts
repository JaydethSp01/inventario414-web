const API = process.env.NEXT_PUBLIC_API_URL || '';
export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const r = await fetch(`${API}${path}`, { cache: 'no-store' });
    if (!r.ok) return fallback;
    return (await r.json()) as T;
  } catch { return fallback; }
}
export async function apiPost<T>(path: string, body: unknown, fallback: T): Promise<T> {
  try {
    const r = await fetch(`${API}${path}`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) return fallback;
    return (await r.json()) as T;
  } catch { return fallback; }
}
