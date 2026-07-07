import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/supabase/env";
import { requireSession } from "@/lib/api/auth";
import { analyseDossier, fetchIntegrations } from "@/lib/ia/analyse";
import type { PieceJustificative } from "@/components/dashboard/data";

function adminClient() {
  return createClient<Database>(
    getSupabaseUrl(),
    getSupabaseSecretKey(),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: Request) {
  try {
    const auth = await requireSession();
    if ("error" in auth) return auth.error;

    const { candidatureId } = await req.json();
    if (!candidatureId) {
      return NextResponse.json({ error: "candidatureId requis" }, { status: 400 });
    }

    const admin = adminClient();
    const { data: row, error } = await admin
      .from("candidatures")
      .select("*")
      .or(`legacy_id.eq.${candidatureId},id.eq.${candidatureId}`)
      .single();

    if (error || !row) {
      return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
    }

    const integrations = await fetchIntegrations(admin);
    const pieces = (row.pieces as PieceJustificative[]) ?? [];
    const result = await analyseDossier(
      {
        id: row.legacy_id,
        nom: row.nom,
        prenom: row.prenom,
        filiere_nom: row.filiere_nom,
        niveau: row.niveau,
        pieces,
      },
      integrations.n8nUrl
    );

    await admin
      .from("candidatures")
      .update({ synthese_ia: result.synthese, completude: result.completude })
      .eq("id", row.id);

    await admin.rpc("log_audit", {
      p_action: "Analyse IA dossier",
      p_cible: row.legacy_id,
      p_details: `Synthèse générée — complétude ${result.completude} %.`,
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
