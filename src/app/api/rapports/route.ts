import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/supabase/env";
import { defaultParametres } from "@/components/dashboard/data";

type RapportType = "Mensuel" | "Hebdomadaire" | "Trimestriel" | "Ponctuel";

function adminClient() {
  return createAdminClient<Database>(
    getSupabaseUrl(),
    getSupabaseSecretKey(),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const type = body.type as RapportType;
    const periode = String(body.periode ?? "").trim();

    if (!type || !periode) {
      return NextResponse.json(
        { error: "Type et période requis" },
        { status: 400 }
      );
    }

    const sb = await createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profile } = await sb
      .from("profiles")
      .select("role, prenom, nom")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "responsable"].includes(profile.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const admin = adminClient();
    const { data: paramRow } = await admin
      .from("parametres")
      .select("value")
      .eq("key", "integrations")
      .maybeSingle();

    const integrations =
      (paramRow?.value as { n8nUrl?: string; iaModel?: string } | null) ??
      defaultParametres.integrations;
    const n8nUrl = integrations.n8nUrl?.trim();
    const iaModel = integrations.iaModel ?? "claude";
    const generePar = `IA (${iaModel})`;

    if (n8nUrl) {
      try {
        await fetch(n8nUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "generer_rapport",
            type,
            periode,
            demandePar: `${profile.prenom} ${profile.nom}`,
          }),
          signal: AbortSignal.timeout(8000),
        });
      } catch {
        // n8n optionnel — le rapport est quand même enregistré localement
      }
    }

    const legacyId = `RAP-${Date.now()}`;
    const titre = `Rapport ${type.toLowerCase()} — ${periode}`;
    const today = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const { error } = await admin.from("rapports").insert({
      legacy_id: legacyId,
      titre,
      periode,
      date_generation: new Date().toISOString(),
      type,
      taille: "1.0 Mo",
      genere_par: generePar,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await admin.rpc("log_audit", {
      p_action: "Génération rapport",
      p_cible: legacyId,
      p_details: `${titre} — généré le ${today} via n8n/IA.`,
    });

    return NextResponse.json({ ok: true, id: legacyId });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
