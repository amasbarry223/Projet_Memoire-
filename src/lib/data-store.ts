"use client";

import { create } from "zustand";
import {
  etudiants as seedEtudiants,
  enseignants as seedEnseignants,
  candidatures as seedCandidatures,
  utilisateurs as seedUtilisateurs,
  filieres as seedFilieres,
  alertesIAComplete as seedAlertes,
  auditLog as seedAudit,
  notesGrille as seedNotes,
  absences as seedAbsences,
  type Etudiant,
  type Enseignant,
  type Candidature,
  type Utilisateur,
  type Filiere,
  type AlerteIA,
  type Note,
  type Absence,
  type EntreeAudit,
  type StatutDossier,
} from "@/components/dashboard/data";
import { useAuthStore } from "@/lib/auth-store";

// ─── Store central de données ─────────────────────────────────────────────────
// Toutes les collections vivent ici. Les vues CRUD agissent dessus ; les vues
// de lecture (dashboard, compteurs) en dérivent leur affichage → tout est
// dynamique et cohérent (ajouter un étudiant met à jour le KPI du dashboard).

interface DataState {
  // Collections
  etudiants: Etudiant[];
  enseignants: Enseignant[];
  candidatures: Candidature[];
  utilisateurs: Utilisateur[];
  filieres: Filiere[];
  alertes: AlerteIA[];
  audit: EntreeAudit[];
  notes: Note[];
  absences: Absence[];

  // Étudiants
  addEtudiant: (e: Omit<Etudiant, "id">) => void;
  updateEtudiant: (id: string, e: Partial<Etudiant>) => void;
  deleteEtudiant: (id: string) => void;

  // Enseignants
  addEnseignant: (e: Omit<Enseignant, "id">) => void;
  updateEnseignant: (id: string, e: Partial<Enseignant>) => void;
  deleteEnseignant: (id: string) => void;

  // Utilisateurs
  addUtilisateur: (u: Omit<Utilisateur, "id" | "derniereConnexion">) => void;
  updateUtilisateur: (id: string, u: Partial<Utilisateur>) => void;
  deleteUtilisateur: (id: string) => { ok: boolean; error?: string };

  // Filières / classes / matières
  addFiliere: (f: { nom: string; code: string; description: string }) => void;
  addClasse: (
    filiereId: string,
    c: { nom: string; niveau: string; effectif: number }
  ) => void;
  addMatiere: (
    filiereId: string,
    m: { nom: string; coefficient: number }
  ) => void;
  deleteFiliere: (id: string) => void;
  deleteClasse: (filiereId: string, classeId: string) => void;
  deleteMatiere: (filiereId: string, matiereId: string) => void;

  // Candidatures
  traiterDossier: (
    id: string,
    action: "valider" | "rejeter" | "incomplet",
    options?: { motif?: string; piecesManquantes?: string[] }
  ) => void;

  // Alertes IA
  traiterAlerte: (
    id: string,
    nouveauStatut: "Prise en charge" | "Clôturée",
    commentaire?: string
  ) => void;

  // Notes & absences
  addNote: (n: Omit<Note, never>) => void;

  // Journal d'audit
  logAction: (e: Omit<EntreeAudit, "id" | "date">) => void;
}

function now() {
  const d = new Date();
  return `${d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })} ${d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

// Auteur courant = utilisateur connecté (R5 : auteur réel)
function currentAuthor(): string {
  const s = useAuthStore.getState().session;
  return s ? `${s.prenom} ${s.nom}` : "Système";
}

// Calcule le prochain ID d'audit depuis le max des IDs existants (robuste au
// refresh : pas de compteur module-level qui se réinitialiserait).
function makeAuditId(existing: EntreeAudit[]): string {
  let max = 0;
  for (const e of existing) {
    const match = e.id.match(/^AUD-(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  }
  return `AUD-${(max + 1).toString().padStart(3, "0")}`;
}

export const useDataStore = create<DataState>((set) => ({
  etudiants: seedEtudiants,
  enseignants: seedEnseignants,
  candidatures: seedCandidatures,
  utilisateurs: seedUtilisateurs,
  filieres: seedFilieres,
  alertes: seedAlertes,
  audit: seedAudit,
  notes: seedNotes,
  absences: seedAbsences,

  // ─── Étudiants ──────────────────────────────────────────────────────────
  addEtudiant: (e) =>
    set((s) => {
      const id = `ETU-${Date.now()}`;
      return {
        etudiants: [{ ...e, id }, ...s.etudiants],
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Création étudiant",
            cible: `${e.prenom} ${e.nom}`,
            details: `Étudiant ajouté — filière ${e.filiere}, classe ${e.classe}.`,
          },
          ...s.audit,
        ],
      };
    }),

  updateEtudiant: (id, e) =>
    set((s) => {
      const etu = s.etudiants.find((x) => x.id === id);
      return {
        etudiants: s.etudiants.map((x) => (x.id === id ? { ...x, ...e } : x)),
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Modification étudiant",
            cible: etu ? `${etu.prenom} ${etu.nom}` : id,
            details: "Fiche étudiant mise à jour.",
          },
          ...s.audit,
        ],
      };
    }),

  deleteEtudiant: (id) =>
    set((s) => {
      const etu = s.etudiants.find((x) => x.id === id);
      return {
        etudiants: s.etudiants.filter((x) => x.id !== id),
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Suppression étudiant",
            cible: etu ? `${etu.prenom} ${etu.nom} (${etu.matricule})` : id,
            details: "Étudiant supprimé de l'établissement.",
          },
          ...s.audit,
        ],
      };
    }),

  // ─── Enseignants ────────────────────────────────────────────────────────
  addEnseignant: (e) =>
    set((s) => {
      const id = `ENS-${Date.now()}`;
      return {
        enseignants: [{ ...e, id }, ...s.enseignants],
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Création enseignant",
            cible: `${e.prenom} ${e.nom}`,
            details: `Enseignant ajouté — ${e.matieres.length} matière(s), ${e.classes.length} classe(s).`,
          },
          ...s.audit,
        ],
      };
    }),

  updateEnseignant: (id, e) =>
    set((s) => {
      const ens = s.enseignants.find((x) => x.id === id);
      return {
        enseignants: s.enseignants.map((x) =>
          x.id === id ? { ...x, ...e } : x
        ),
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Modification enseignant",
            cible: ens ? `${ens.prenom} ${ens.nom}` : id,
            details: "Fiche enseignant mise à jour.",
          },
          ...s.audit,
        ],
      };
    }),

  deleteEnseignant: (id) =>
    set((s) => {
      const ens = s.enseignants.find((x) => x.id === id);
      return {
        enseignants: s.enseignants.filter((x) => x.id !== id),
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Suppression enseignant",
            cible: ens ? `${ens.prenom} ${ens.nom}` : id,
            details: "Enseignant supprimé, affectations retirées.",
          },
          ...s.audit,
        ],
      };
    }),

  // ─── Utilisateurs ───────────────────────────────────────────────────────
  addUtilisateur: (u) =>
    set((s) => {
      const id = `U-${Date.now()}`;
      return {
        utilisateurs: [
          { ...u, id, derniereConnexion: "Jamais" },
          ...s.utilisateurs,
        ],
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Création compte",
            cible: `${u.prenom} ${u.nom}`,
            details: `Compte créé — rôle ${u.role}.`,
          },
          ...s.audit,
        ],
      };
    }),

  updateUtilisateur: (id, u) =>
    set((s) => {
      const usr = s.utilisateurs.find((x) => x.id === id);
      return {
        utilisateurs: s.utilisateurs.map((x) =>
          x.id === id ? { ...x, ...u } : x
        ),
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Modification compte",
            cible: usr ? `${usr.prenom} ${usr.nom}` : id,
            details: u.role ? `Rôle mis à jour → ${u.role}.` : "Compte modifié.",
          },
          ...s.audit,
        ],
      };
    }),

  deleteUtilisateur: (id) => {
    // RBAC : seuls les administrateurs peuvent supprimer un utilisateur
    const session = useAuthStore.getState().session;
    if (!session || session.role !== "admin") {
      return {
        ok: false,
        error:
          "Seuls les administrateurs peuvent supprimer un compte (RBAC §2.2).",
      };
    }
    // R2 étendu : interdiction de supprimer son propre compte
    const usr = useDataStore.getState().utilisateurs.find((x) => x.id === id);
    if (usr && usr.email === session.email) {
      return {
        ok: false,
        error: "Vous ne pouvez pas supprimer votre propre compte (R2).",
      };
    }
    set((s) => {
      return {
        utilisateurs: s.utilisateurs.filter((x) => x.id !== id),
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Suppression compte",
            cible: usr ? `${usr.prenom} ${usr.nom}` : id,
            details: "Compte utilisateur supprimé.",
          },
          ...s.audit,
        ],
      };
    });
    return { ok: true };
  },

  // ─── Filières / classes / matières ──────────────────────────────────────
  addFiliere: (f) =>
    set((s) => {
      const id = `FIL-${Date.now()}`;
      return {
        filieres: [
          ...s.filieres,
          {
            id,
            nom: f.nom,
            code: f.code,
            description: f.description,
            classes: [],
            matieres: [],
          },
        ],
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Création filière",
            cible: f.nom,
            details: `Filière créée (code ${f.code}).`,
          },
          ...s.audit,
        ],
      };
    }),

  addClasse: (filiereId, c) =>
    set((s) => {
      const id = `CL-${Date.now()}`;
      const f = s.filieres.find((x) => x.id === filiereId);
      return {
        filieres: s.filieres.map((f) =>
          f.id === filiereId
            ? {
                ...f,
                classes: [
                  ...f.classes,
                  { id, nom: c.nom, niveau: c.niveau, effectif: c.effectif },
                ],
              }
            : f
        ),
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Création classe",
            cible: c.nom,
            details: `Classe ajoutée à la filière ${f?.nom ?? ""}.`,
          },
          ...s.audit,
        ],
      };
    }),

  addMatiere: (filiereId, m) =>
    set((s) => {
      const id = `MA-${Date.now()}`;
      const f = s.filieres.find((x) => x.id === filiereId);
      return {
        filieres: s.filieres.map((f) =>
          f.id === filiereId
            ? {
                ...f,
                matieres: [
                  ...f.matieres,
                  { id, nom: m.nom, coefficient: m.coefficient },
                ],
              }
            : f
        ),
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Création matière",
            cible: m.nom,
            details: `Matière ajoutée à la filière ${f?.nom ?? ""} (coef. ${m.coefficient}).`,
          },
          ...s.audit,
        ],
      };
    }),

  deleteFiliere: (id) =>
    set((s) => {
      const f = s.filieres.find((x) => x.id === id);
      return {
        filieres: s.filieres.filter((x) => x.id !== id),
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Suppression filière",
            cible: f?.nom ?? id,
            details: "Filière et ses classes/matières supprimées.",
          },
          ...s.audit,
        ],
      };
    }),

  deleteClasse: (filiereId, classeId) =>
    set((s) => {
      const f = s.filieres.find((x) => x.id === filiereId);
      const c = f?.classes.find((x) => x.id === classeId);
      return {
        filieres: s.filieres.map((f) =>
          f.id === filiereId
            ? { ...f, classes: f.classes.filter((c) => c.id !== classeId) }
            : f
        ),
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Suppression classe",
            cible: c?.nom ?? classeId,
            details: `Classe retirée de la filière ${f?.nom ?? ""}.`,
          },
          ...s.audit,
        ],
      };
    }),

  deleteMatiere: (filiereId, matiereId) =>
    set((s) => {
      const f = s.filieres.find((x) => x.id === filiereId);
      const m = f?.matieres.find((x) => x.id === matiereId);
      return {
        filieres: s.filieres.map((f) =>
          f.id === filiereId
            ? { ...f, matieres: f.matieres.filter((m) => m.id !== matiereId) }
            : f
        ),
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Suppression matière",
            cible: m?.nom ?? matiereId,
            details: `Matière retirée de la filière ${f?.nom ?? ""}.`,
          },
          ...s.audit,
        ],
      };
    }),

  // ─── Candidatures (traitement de dossier) ───────────────────────────────
  traiterDossier: (id, action, options) =>
    set((s) => {
      const dossier = s.candidatures.find((c) => c.id === id);
      if (!dossier) return s;

      const statutMap: Record<typeof action, StatutDossier> = {
        valider: "Validé",
        rejeter: "Rejeté",
        incomplet: "Incomplet",
      };
      const statut = statutMap[action];

      const actionLabel: Record<typeof action, string> = {
        valider: "Validation dossier",
        rejeter: "Rejet dossier",
        incomplet: "Marquage incomplet",
      };

      let details = `Dossier ${statut.toLowerCase()}.`;
      if (action === "rejeter" && options?.motif) {
        details = `Motif : ${options.motif}`;
      } else if (action === "incomplet" && options?.piecesManquantes?.length) {
        details = `Pièces manquantes : ${options.piecesManquantes.join(", ")}`;
      }

      return {
        candidatures: s.candidatures.map((c) =>
          c.id === id
            ? {
                ...c,
                statut,
                historique: [
                  ...c.historique,
                  {
                    action: actionLabel[action],
                    date: now(),
                    auteur: currentAuthor(),
                  },
                ],
              }
            : c
        ),
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: actionLabel[action],
            cible: id,
            details,
          },
          ...s.audit,
        ],
      };
    }),

  // ─── Alertes IA ─────────────────────────────────────────────────────────
  traiterAlerte: (id, nouveauStatut, commentaire) =>
    set((s) => {
      const alerte = s.alertes.find((a) => a.id === id);
      if (!alerte) return s;
      return {
        alertes: s.alertes.map((a) =>
          a.id === id ? { ...a, statut: nouveauStatut } : a
        ),
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action:
              nouveauStatut === "Clôturée"
                ? "Clôture alerte"
                : "Prise en charge alerte",
            cible: id,
            details: `Alerte ${id} (${alerte.etudiant}) → ${nouveauStatut}${
              commentaire ? `. Commentaire : ${commentaire}` : ""
            }.`,
          },
          ...s.audit,
        ],
      };
    }),

  // ─── Notes ──────────────────────────────────────────────────────────────
  addNote: (n) =>
    set((s) => {
      auditCounter += 1;
      return {
        notes: [n, ...s.notes],
        audit: [
          {
            id: makeAuditId(s.audit),
            date: now(),
            utilisateur: currentAuthor(),
            action: "Saisie de notes",
            cible: `${n.classe} — ${n.matiere}`,
            details: `Note ${n.note}/${n.sur} saisie pour ${n.etudiant} (${n.periode}).`,
          },
          ...s.audit,
        ],
      };
    }),

  // ─── Journal d'audit ────────────────────────────────────────────────────
  logAction: (e) =>
    set((s) => ({
      audit: [
        { ...e, id: makeAuditId(s.audit), date: now() },
        ...s.audit,
      ],
    })),
}));
