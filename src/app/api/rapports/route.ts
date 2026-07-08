import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/supabase/env";
import { defaultParametres } from "@/components/dashboard/data";
import { generateRapportPdf, formatTaille } from "@/lib/reports/pdf-generator";
import { logAuditServer } from "@/lib/api/audit";
import { mapRapport } from "@/lib/mappers";
import { legacyOrIdFilter } from "@/lib/legacy-id";

type RapportType = "Mensuel" | "Hebdomadaire" | "Trimestriel" | "Ponctuel";

function adminClient() {
  return createAdminClient<Database>(
    getSupabaseUrl(),
    getSupabaseSecretKey(),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function requireRapportStaff() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }
  const { data: profile } = await sb
    .from("profiles")
    .select("role, prenom, nom")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "responsable"].includes(profile.role)) {
    return { error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  }
  return { profile };
}

export async function GET() {
  try {
    const auth = await requireRapportStaff();
    if ("error" in auth) return auth.error;

    const admin = adminClient();
    const { data, error } = await admin
      .from("rapports")
      .select("*")
      .order("date_generation", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      rapports: (data ?? []).map(mapRapport),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireRapportStaff();
    if ("error" in auth) return auth.error;

    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Identifiant requis" }, { status: 400 });
    }

    const admin = adminClient();
    const { data: rapport, error: lookupError } = await admin
      .from("rapports")
      .select("id, legacy_id, titre, fichier_path")
      .or(legacyOrIdFilter(id))
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 400 });
    }
    if (!rapport) {
      return NextResponse.json({ error: "Rapport introuvable" }, { status: 404 });
    }

    if (rapport.fichier_path) {
      await admin.storage.from("rapports").remove([rapport.fichier_path]);
    }

    const { error: deleteError } = await admin
      .from("rapports")
      .delete()
      .eq("id", rapport.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    await logAuditServer(
      admin,
      `${auth.profile.prenom} ${auth.profile.nom}`,
      "Suppression rapport",
      rapport.legacy_id ?? rapport.id,
      `Rapport supprimé : ${rapport.titre}.`
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur serveur" },
      { status: 500 }
    );
  }
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

    await logAuditServer(
      admin,
      `${profile.prenom} ${profile.nom}`,
      "Génération rapport",
      legacyId,
      `${titre} — PDF ${taille} généré le ${today}.`
    );

    return NextResponse.json({ ok: true, id: legacyId, taille });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
