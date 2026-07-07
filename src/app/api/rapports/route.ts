import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/supabase/env";
import { defaultParametres } from "@/components/dashboard/data";
import { generateRapportPdf, formatTaille } from "@/lib/reports/pdf-generator";

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
    const [{ data: paramRow }, { data: etablissementRow }] = await Promise.all([
      admin.from("parametres").select("value").eq("key", "integrations").maybeSingle(),
      admin.from("parametres").select("value").eq("key", "etablissement").maybeSingle(),
    ]);

    const integrations =
      (paramRow?.value as { n8nUrl?: string; iaModel?: string } | null) ??
      defaultParametres.integrations;
    const n8nUrl = integrations.n8nUrl?.trim();
    const iaModel = integrations.iaModel ?? "claude";
    const generePar = `IA (${iaModel})`;
    const etablissementNom =
      (etablissementRow?.value as { nom?: string } | null)?.nom ??
      defaultParametres.etablissement.nom;

    const [etudiantsRes, alertesRes, notesRes] = await Promise.all([
      admin.from("etudiants").select("id, nom, prenom, assiduite, classes(nom, filieres(nom))"),
      admin.from("alertes").select("id").neq("statut", "Clôturée"),
      admin.from("notes").select("etudiant_id, note, sur, coefficient"),
    ]);

    const etudiants = etudiantsRes.data ?? [];
    const tauxAssiduite =
      etudiants.length > 0
        ? Math.round(
            etudiants.reduce((s, e) => s + Number(e.assiduite), 0) / etudiants.length
          )
        : 0;

    // La moyenne n'est pas stockée sur la fiche étudiant (saisie manuelle,
    // jamais resynchronisée) — on la recalcule depuis les vraies notes,
    // comme le fait déjà suivi-view.tsx côté client.
    const notesParEtudiant = new Map<string, { note: number | null; sur: number; coefficient: number }[]>();
    for (const n of notesRes.data ?? []) {
      const list = notesParEtudiant.get(n.etudiant_id) ?? [];
      list.push(n);
      notesParEtudiant.set(n.etudiant_id, list);
    }
    function moyenneReelle(etudiantId: string): number {
      const notees = (notesParEtudiant.get(etudiantId) ?? []).filter((n) => n.note !== null);
      const sommeCoef = notees.reduce((s, n) => s + Number(n.coefficient), 0);
      if (sommeCoef === 0) return 0;
      return notees.reduce(
        (s, n) => s + (Number(n.note) / Number(n.sur)) * 20 * Number(n.coefficient),
        0
      ) / sommeCoef;
    }

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
        // n8n optionnel
      }
    }

    const legacyId = `RAP-${Date.now()}`;
    const titre = `Rapport ${type.toLowerCase()} — ${periode}`;
    const today = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const pdfBytes = generateRapportPdf({
      etablissementNom,
      titre,
      periode,
      type,
      generePar,
      dateGeneration: today,
      kpis: [
        { label: "Effectif étudiants", value: String(etudiants.length) },
        { label: "Assiduité moyenne", value: `${tauxAssiduite} %` },
        { label: "Alertes actives", value: String(alertesRes.data?.length ?? 0) },
        { label: "Période", value: periode },
      ],
      etudiants: etudiants.map((e) => {
        const cls = e.classes as { nom: string; filieres: { nom: string } | null } | null;
        return {
          nom: `${e.prenom} ${e.nom}`,
          filiere: cls?.filieres?.nom ?? "",
          moyenne: Math.round(moyenneReelle(e.id) * 10) / 10,
          assiduite: Number(e.assiduite),
        };
      }),
    });

    const fichierPath = `rapports/${legacyId}.pdf`;
    const { error: uploadError } = await admin.storage
      .from("rapports")
      .upload(fichierPath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const tailleOctets = pdfBytes.byteLength;
    const taille = formatTaille(tailleOctets);

    const { error } = await admin.from("rapports").insert({
      legacy_id: legacyId,
      titre,
      periode,
      date_generation: new Date().toISOString(),
      type,
      taille,
      genere_par: generePar,
      fichier_path: fichierPath,
      taille_octets: tailleOctets,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await admin.rpc("log_audit", {
      p_action: "Génération rapport",
      p_cible: legacyId,
      p_details: `${titre} — PDF ${taille} généré le ${today}.`,
    });

    return NextResponse.json({ ok: true, id: legacyId, taille });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
