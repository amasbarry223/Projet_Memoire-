import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/supabase/env";
import { requireRoleSession } from "@/lib/api/auth";
import { detectAlertesLocales, fetchIntegrations } from "@/lib/ia/analyse";

function adminClient() {
  return createClient<Database>(
    getSupabaseUrl(),
    getSupabaseSecretKey(),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const NIVEAU_COLOR: Record<string, string> = {
  Faible: "bg-yellow-500",
  Moyen: "bg-orange-500",
  Élevé: "bg-red-500",
};

export async function POST() {
  try {
    const auth = await requireRoleSession(["admin", "responsable"]);
    if ("error" in auth) return auth.error;

    const admin = adminClient();
    const integrations = await fetchIntegrations(admin);

    const [etudiantsRes, absencesRes, notesRes] = await Promise.all([
      admin.from("etudiants").select("id, legacy_id, nom, prenom, assiduite, classes(nom)"),
      admin.from("absences").select("justifiee, etudiants(prenom, nom)"),
      admin.from("notes").select("note, etudiant_id"),
    ]);

    const etudiants = (etudiantsRes.data ?? []).map((e) => {
      const notes = (notesRes.data ?? []).filter((n) => n.etudiant_id === e.id);
      const moyenne =
        notes.length > 0
          ? notes.reduce((s, n) => s + Number(n.note ?? 0), 0) / notes.length
          : 0;
      const cls = e.classes as { nom: string } | null;
      return {
        id: e.legacy_id ?? e.id,
        nom: e.nom,
        prenom: e.prenom,
        classe: cls?.nom ?? "",
        moyenne: Math.round(moyenne * 10) / 10,
        assiduite: Number(e.assiduite),
      };
    });

    const absences = (absencesRes.data ?? []).map((a) => {
      const etu = a.etudiants as { prenom: string; nom: string } | null;
      return {
        etudiant: etu ? `${etu.prenom} ${etu.nom}` : "",
        justifiee: a.justifiee,
      };
    });

    let candidates = detectAlertesLocales(etudiants, absences);

    if (integrations.n8nUrl?.trim()) {
      try {
        const res = await fetch(integrations.n8nUrl.trim(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "generer_alertes", etudiants, absences }),
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const data = (await res.json()) as { alertes?: typeof candidates };
          if (Array.isArray(data.alertes) && data.alertes.length > 0) {
            candidates = data.alertes;
          }
        }
      } catch {
        // fallback local
      }
    }

    let created = 0;
    for (const a of candidates) {
      const { data: etu } = await admin
        .from("etudiants")
        .select("id")
        .or(`legacy_id.eq.${a.etudiantId},id.eq.${a.etudiantId}`)
        .maybeSingle();
      if (!etu) continue;

      const { data: existing } = await admin
        .from("alertes")
        .select("id")
        .eq("etudiant_id", etu.id)
        .eq("motif", a.motif)
        .eq("statut", "Nouvelle")
        .maybeSingle();
      if (existing) continue;

      await admin.from("alertes").insert({
        legacy_id: `ALT-${Date.now()}-${created}`,
        etudiant_id: etu.id,
        classe_nom: a.classe,
        niveau: a.niveau,
        motif: a.motif,
        statut: "Nouvelle",
        indicator_color: NIVEAU_COLOR[a.niveau] ?? "bg-orange-500",
      });
      created++;
    }

    await admin.rpc("log_audit", {
      p_action: "Génération alertes IA",
      p_cible: `${created} alerte(s)`,
      p_details: `Analyse automatique — ${created} nouvelle(s) alerte(s) créée(s).`,
    });

    return NextResponse.json({ ok: true, created });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
