import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/supabase/env";
import { requireRoleSession } from "@/lib/api/auth";
import { fetchIntegrations } from "@/lib/ia/analyse";

function adminClient() {
  return createClient<Database>(
    getSupabaseUrl(),
    getSupabaseSecretKey(),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET() {
  try {
    const auth = await requireRoleSession(["admin", "responsable"]);
    if ("error" in auth) return auth.error;

    const admin = adminClient();
    const integrations = await fetchIntegrations(admin);
    const n8nUrl = integrations.n8nUrl?.trim();

    let online = false;
    let latencyMs: number | null = null;

    if (n8nUrl) {
      const start = Date.now();
      try {
        const healthUrl = n8nUrl.replace(/\/webhook\/?.*$/, "/healthz");
        const res = await fetch(healthUrl, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });
        online = res.ok;
        latencyMs = Date.now() - start;
      } catch {
        online = false;
      }

      // /healthz peut ne pas exister sur certaines instances n8n (404/405)
      // sans que le service soit réellement down : on retente alors un HEAD
      // sur l'URL du webhook lui-même. On ne déclenchait avant ce fallback
      // que sur une exception réseau — jamais sur un simple statut non-2xx,
      // ce qui affichait "hors ligne" à tort tant que /healthz n'existait pas.
      if (!online) {
        try {
          const res = await fetch(n8nUrl, {
            method: "HEAD",
            signal: AbortSignal.timeout(5000),
          });
          online = res.status < 500;
          latencyMs = Date.now() - start;
        } catch {
          online = false;
        }
      }
    }

    const { data: events } = await admin
      .from("n8n_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    const workflows = new Set((events ?? []).map((e) => e.workflow_name)).size;

    return NextResponse.json({
      online,
      latencyMs,
      n8nConfigured: Boolean(n8nUrl),
      workflowsActifs: workflows,
      evenementsTraites: events?.length ?? 0,
      recentEvents: events ?? [],
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
