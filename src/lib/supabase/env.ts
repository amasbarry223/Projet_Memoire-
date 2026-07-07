export function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    ""
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

/** Vérifie la config build-time OU runtime (après ensureRuntimeSupabaseConfig). */
export function isSupabaseConfiguredWithRuntime(
  runtime?: { url: string; anonKey: string } | null
): boolean {
  if (isSupabaseConfigured()) return true;
  return Boolean(runtime?.url && runtime.anonKey);
}

/** Clé publique côté client (publishable ou anon legacy). */
export function getSupabasePublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    ""
  );
}

/** Clé secrète serveur uniquement (service role / secret). */
export function getSupabaseSecretKey(): string {
  return (
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    ""
  );
}
