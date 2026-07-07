type PublicSupabaseConfig = {
  url: string;
  anonKey: string;
};

let cached: PublicSupabaseConfig | null = null;
let loadPromise: Promise<PublicSupabaseConfig | null> | null = null;

export function getRuntimeSupabaseConfig(): PublicSupabaseConfig | null {
  return cached;
}

export async function ensureRuntimeSupabaseConfig(): Promise<PublicSupabaseConfig | null> {
  if (cached) return cached;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const res = await fetch("/api/config", { cache: "no-store" });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        configured?: boolean;
        url?: string;
        anonKey?: string;
      };
      if (!data.configured || !data.url || !data.anonKey) return null;
      cached = { url: data.url, anonKey: data.anonKey };
      return cached;
    } catch {
      return null;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

export function clearRuntimeSupabaseConfig() {
  cached = null;
}
