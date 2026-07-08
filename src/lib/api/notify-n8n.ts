import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { defaultParametres } from "@/components/dashboard/data";

export type NotificationsConfig = typeof defaultParametres.notifications;

// Lit la config "notifications" depuis parametres, avec la clé service-role
// (bypass RLS) — nécessaire car le déclencheur peut être un candidat, qui
// n'a jamais accès à cette table côté client (RLS admin-only).
export async function fetchNotificationsConfig(
  admin: SupabaseClient<Database>
): Promise<NotificationsConfig> {
  const { data } = await admin
    .from("parametres")
    .select("value")
    .eq("key", "notifications")
    .maybeSingle();
  return (
    (data?.value as NotificationsConfig | null) ??
    defaultParametres.notifications
  );
}

// Envoie un événement au webhook n8n configuré. Best-effort : n8n est un
// service optionnel, un échec ici ne doit jamais faire échouer l'action
// métier qui a déclenché la notification.
export async function sendN8nEvent(
  n8nUrl: string,
  type: string,
  payload: Record<string, unknown>
): Promise<boolean> {
  try {
    const res = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, ...payload }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
