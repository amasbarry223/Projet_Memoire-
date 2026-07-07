import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { defaultParametres } from "@/components/dashboard/data";

export type AnalyseResult = {
  synthese: string;
  completude: number;
};

type PieceInput = {
  nom: string;
  present: boolean;
  type?: string;
};

type CandidatureInput = {
  nom: string;
  prenom: string;
  filiere_nom: string;
  niveau: string;
  pieces: PieceInput[];
};

export function computeCompletude(pieces: PieceInput[]): number {
  if (pieces.length === 0) return 0;
  const present = pieces.filter((p) => p.present).length;
  return Math.round((present / pieces.length) * 100);
}

export function buildLocalSynthese(c: CandidatureInput, completude: number): string {
  const manquantes = c.pieces.filter((p) => !p.present).map((p) => p.nom);
  const lines = [
    `Dossier de ${c.prenom} ${c.nom} — filière ${c.filiere_nom} (${c.niveau}).`,
    `Complétude : ${completude} %.`,
  ];
  if (manquantes.length > 0) {
    lines.push(`Pièces manquantes : ${manquantes.join(", ")}.`);
  } else {
    lines.push("Toutes les pièces requises sont présentes.");
  }
  if (completude >= 100) {
    lines.push("Recommandation : dossier prêt pour examen par l'administration.");
  } else if (completude >= 50) {
    lines.push("Recommandation : demander les pièces complémentaires au candidat.");
  } else {
    lines.push("Recommandation : dossier incomplet — relance candidat nécessaire.");
  }
  return lines.join(" ");
}

export async function analyseViaN8n(
  n8nUrl: string,
  candidature: CandidatureInput & { id: string }
): Promise<AnalyseResult | null> {
  try {
    const res = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "analyse_dossier", candidature }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { synthese?: string; completude?: number };
    if (typeof data.synthese === "string" && typeof data.completude === "number") {
      return { synthese: data.synthese, completude: data.completude };
    }
    return null;
  } catch {
    return null;
  }
}

export async function analyseDossier(
  candidature: CandidatureInput & { id: string },
  n8nUrl?: string
): Promise<AnalyseResult> {
  const completudeBase = computeCompletude(candidature.pieces);

  if (n8nUrl?.trim()) {
    const remote = await analyseViaN8n(n8nUrl.trim(), candidature);
    if (remote) return remote;
  }

  return {
    synthese: buildLocalSynthese(candidature, completudeBase),
    completude: completudeBase,
  };
}

export type AlerteCandidate = {
  etudiantId: string;
  etudiantNom: string;
  classe: string;
  niveau: "Faible" | "Moyen" | "Élevé";
  motif: string;
};

export function detectAlertesLocales(
  etudiants: {
    id: string;
    nom: string;
    prenom: string;
    classe: string;
    moyenne: number;
    assiduite: number;
  }[],
  absences: { etudiant: string; justifiee: boolean }[]
): AlerteCandidate[] {
  const alertes: AlerteCandidate[] = [];
  for (const e of etudiants) {
    const nomComplet = `${e.prenom} ${e.nom}`;
    const absNonJust = absences.filter(
      (a) => a.etudiant === nomComplet && !a.justifiee
    ).length;

    if (e.assiduite < 75) {
      alertes.push({
        etudiantId: e.id,
        etudiantNom: nomComplet,
        classe: e.classe,
        niveau: e.assiduite < 60 ? "Élevé" : "Moyen",
        motif: `Assiduité faible (${e.assiduite} %) — risque de décrochage.`,
      });
    }
    if (e.moyenne < 10 && e.moyenne > 0) {
      alertes.push({
        etudiantId: e.id,
        etudiantNom: nomComplet,
        classe: e.classe,
        niveau: e.moyenne < 8 ? "Élevé" : "Moyen",
        motif: `Moyenne insuffisante (${e.moyenne}/20) — accompagnement recommandé.`,
      });
    }
    if (absNonJust >= 3) {
      alertes.push({
        etudiantId: e.id,
        etudiantNom: nomComplet,
        classe: e.classe,
        niveau: "Moyen",
        motif: `${absNonJust} absences non justifiées ce semestre.`,
      });
    }
  }
  return alertes;
}

export async function fetchIntegrations(admin: SupabaseClient<Database>) {
  const { data: paramRow } = await admin
    .from("parametres")
    .select("value")
    .eq("key", "integrations")
    .maybeSingle();
  return (
    (paramRow?.value as { n8nUrl?: string; iaModel?: string } | null) ??
    defaultParametres.integrations
  );
}
