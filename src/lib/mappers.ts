import type {
  AlerteIA,
  Candidature,
  EntreeAudit,
  Enseignant,
  Etudiant,
  Filiere,
  Note,
  Absence,
  Rapport,
  Utilisateur,
  PieceJustificative,
  ActionHistorique,
  Role,
} from "@/components/dashboard/data";
import type { Tables } from "@/lib/supabase/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type DbFiliere = Tables<"filieres"> & {
  classes: Tables<"classes">[];
  matieres: Tables<"matieres">[];
};

type DbEnseignant = Tables<"enseignants"> & {
  enseignant_matieres: { matiere_id: string; matieres: { nom: string } | null }[];
  enseignant_classes: { classe_id: string; classes: { nom: string } | null }[];
};

type DbEtudiant = Tables<"etudiants"> & {
  classes: { nom: string; filieres: { nom: string } | null } | null;
};

type DbAlerte = Tables<"alertes"> & {
  etudiants: { prenom: string; nom: string } | null;
};

type DbCandidature = Tables<"candidatures">;

function fmtDate(d: string | Date) {
  return format(new Date(d), "dd MMM yyyy", { locale: fr });
}

function fmtDateTime(d: string | Date) {
  return format(new Date(d), "dd MMM yyyy HH:mm", { locale: fr });
}

export function mapFiliere(row: DbFiliere): Filiere {
  return {
    id: row.legacy_id ?? row.id,
    nom: row.nom,
    code: row.code,
    description: row.description,
    classes: row.classes.map((c) => ({
      id: c.legacy_id ?? c.id,
      nom: c.nom,
      niveau: c.niveau,
      effectif: c.effectif,
    })),
    matieres: row.matieres.map((m) => ({
      id: m.legacy_id ?? m.id,
      nom: m.nom,
      coefficient: Number(m.coefficient),
    })),
  };
}

export function mapEtudiant(row: DbEtudiant): Etudiant {
  return {
    id: row.legacy_id ?? row.id,
    matricule: row.matricule,
    nom: row.nom,
    prenom: row.prenom,
    email: row.email,
    filiere: row.classes?.filieres?.nom ?? "",
    classe: row.classes?.nom ?? "",
    moyenne: Number(row.moyenne),
    assiduite: row.assiduite,
    statut: row.statut,
  };
}

export function mapEnseignant(row: DbEnseignant): Enseignant {
  return {
    id: row.legacy_id ?? row.id,
    nom: row.nom,
    prenom: row.prenom,
    email: row.email,
    matieres: row.enseignant_matieres
      .map((m) => m.matieres?.nom)
      .filter(Boolean) as string[],
    classes: row.enseignant_classes
      .map((c) => c.classes?.nom)
      .filter(Boolean) as string[],
    statut: row.statut,
  };
}

export function mapCandidature(row: DbCandidature): Candidature {
  return {
    id: row.legacy_id,
    nom: row.nom,
    prenom: row.prenom,
    email: row.email,
    telephone: row.telephone,
    dateNaissance: row.date_naissance,
    adresse: row.adresse,
    filiere: row.filiere_nom,
    niveau: row.niveau,
    statut: row.statut,
    dateSoumission: fmtDate(row.date_soumission),
    pieces: (row.pieces as PieceJustificative[]) ?? [],
    syntheseIA: row.synthese_ia,
    completude: row.completude,
    historique: (row.historique as ActionHistorique[]) ?? [],
  };
}

export function mapNote(row: Tables<"notes"> & { etudiants?: { prenom: string; nom: string } | null }): Note {
  const etu = row.etudiants;
  return {
    id: row.id,
    etudiant: etu ? `${etu.prenom} ${etu.nom}` : "",
    matiere: row.matiere_nom,
    classe: row.classe_nom,
    note: row.note !== null ? Number(row.note) : null,
    sur: Number(row.sur),
    coefficient: Number(row.coefficient),
    periode: row.periode,
  };
}

export function mapAbsence(row: Tables<"absences"> & { etudiants?: { prenom: string; nom: string } | null }): Absence {
  const etu = row.etudiants;
  return {
    id: row.id,
    etudiant: etu ? `${etu.prenom} ${etu.nom}` : "",
    classe: row.classe_nom,
    matiere: row.matiere,
    date: fmtDate(row.date_absence),
    justifiee: row.justifiee,
  };
}

export function mapAlerte(row: DbAlerte): AlerteIA {
  const etu = row.etudiants;
  return {
    id: row.legacy_id ?? row.id,
    etudiant: etu ? `${etu.prenom} ${etu.nom}` : "",
    classe: row.classe_nom,
    niveau: row.niveau,
    motif: row.motif,
    date: fmtDate(row.date_alerte),
    statut: row.statut,
    indicatorColor: row.indicator_color,
  };
}

export function mapAudit(row: Tables<"audit_log">): EntreeAudit {
  return {
    id: row.legacy_id ?? row.id,
    date: fmtDateTime(row.created_at),
    utilisateur: row.utilisateur,
    action: row.action,
    cible: row.cible,
    details: row.details,
  };
}

export function mapRapport(row: Tables<"rapports"> & { fichier_path?: string | null; taille_octets?: number | null }): Rapport {
  return {
    id: row.legacy_id ?? row.id,
    titre: row.titre,
    periode: row.periode,
    dateGeneration: fmtDate(row.date_generation),
    type: row.type,
    taille: row.taille,
    generePar: row.genere_par,
    fichierPath: row.fichier_path ?? undefined,
    tailleOctets: row.taille_octets ?? undefined,
  };
}

export function mapUtilisateur(row: Tables<"profiles">): Utilisateur {
  return {
    id: row.legacy_id ?? row.id,
    nom: row.nom,
    prenom: row.prenom,
    email: row.email,
    role: row.role as Role,
    statut: row.statut,
    derniereConnexion: row.derniere_connexion
      ? fmtDateTime(row.derniere_connexion)
      : "Jamais",
  };
}
