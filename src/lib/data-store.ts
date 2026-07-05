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
  type Classe,
  type Matiere,
  type AlerteIA,
  type Note,
  type Absence,
  type EntreeAudit,
} from "@/components/dashboard/data";

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
  deleteUtilisateur: (id: string) => void;

  // Filières
  deleteFiliere: (id: string) => void;
  deleteClasse: (filiereId: string, classeId: string) => void;
  deleteMatiere: (filiereId: string, matiereId: string) => void;

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

let auditCounter = 100;

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

  addEtudiant: (e) =>
    set((s) => {
      const id = `ETU-${Date.now()}`;
      auditCounter += 1;
      return {
        etudiants: [{ ...e, id }, ...s.etudiants],
        audit: [
          {
            id: `AUD-${auditCounter.toString().padStart(3, "0")}`,
            date: now(),
            utilisateur: "Amadou Touré",
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
      auditCounter += 1;
      const etu = s.etudiants.find((x) => x.id === id);
      return {
        etudiants: s.etudiants.map((x) => (x.id === id ? { ...x, ...e } : x)),
        audit: [
          {
            id: `AUD-${auditCounter.toString().padStart(3, "0")}`,
            date: now(),
            utilisateur: "Amadou Touré",
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
      auditCounter += 1;
      const etu = s.etudiants.find((x) => x.id === id);
      return {
        etudiants: s.etudiants.filter((x) => x.id !== id),
        audit: [
          {
            id: `AUD-${auditCounter.toString().padStart(3, "0")}`,
            date: now(),
            utilisateur: "Amadou Touré",
            action: "Suppression étudiant",
            cible: etu ? `${etu.prenom} ${etu.nom} (${etu.matricule})` : id,
            details: "Étudiant supprimé de l'établissement.",
          },
          ...s.audit,
        ],
      };
    }),

  addEnseignant: (e) =>
    set((s) => {
      const id = `ENS-${Date.now()}`;
      auditCounter += 1;
      return {
        enseignants: [{ ...e, id }, ...s.enseignants],
        audit: [
          {
            id: `AUD-${auditCounter.toString().padStart(3, "0")}`,
            date: now(),
            utilisateur: "Amadou Touré",
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
      auditCounter += 1;
      const ens = s.enseignants.find((x) => x.id === id);
      return {
        enseignants: s.enseignants.map((x) =>
          x.id === id ? { ...x, ...e } : x
        ),
        audit: [
          {
            id: `AUD-${auditCounter.toString().padStart(3, "0")}`,
            date: now(),
            utilisateur: "Amadou Touré",
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
      auditCounter += 1;
      const ens = s.enseignants.find((x) => x.id === id);
      return {
        enseignants: s.enseignants.filter((x) => x.id !== id),
        audit: [
          {
            id: `AUD-${auditCounter.toString().padStart(3, "0")}`,
            date: now(),
            utilisateur: "Amadou Touré",
            action: "Suppression enseignant",
            cible: ens ? `${ens.prenom} ${ens.nom}` : id,
            details: "Enseignant supprimé, affectations retirées.",
          },
          ...s.audit,
        ],
      };
    }),

  addUtilisateur: (u) =>
    set((s) => {
      const id = `U-${Date.now()}`;
      auditCounter += 1;
      return {
        utilisateurs: [
          { ...u, id, derniereConnexion: "Jamais" },
          ...s.utilisateurs,
        ],
        audit: [
          {
            id: `AUD-${auditCounter.toString().padStart(3, "0")}`,
            date: now(),
            utilisateur: "Amadou Touré",
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
      auditCounter += 1;
      const usr = s.utilisateurs.find((x) => x.id === id);
      return {
        utilisateurs: s.utilisateurs.map((x) =>
          x.id === id ? { ...x, ...u } : x
        ),
        audit: [
          {
            id: `AUD-${auditCounter.toString().padStart(3, "0")}`,
            date: now(),
            utilisateur: "Amadou Touré",
            action: "Modification compte",
            cible: usr ? `${usr.prenom} ${usr.nom}` : id,
            details: u.role ? `Rôle mis à jour → ${u.role}.` : "Compte modifié.",
          },
          ...s.audit,
        ],
      };
    }),

  deleteUtilisateur: (id) =>
    set((s) => {
      auditCounter += 1;
      const usr = s.utilisateurs.find((x) => x.id === id);
      return {
        utilisateurs: s.utilisateurs.filter((x) => x.id !== id),
        audit: [
          {
            id: `AUD-${auditCounter.toString().padStart(3, "0")}`,
            date: now(),
            utilisateur: "Amadou Touré",
            action: "Suppression compte",
            cible: usr ? `${usr.prenom} ${usr.nom}` : id,
            details: "Compte utilisateur supprimé.",
          },
          ...s.audit,
        ],
      };
    }),

  deleteFiliere: (id) =>
    set((s) => {
      auditCounter += 1;
      const f = s.filieres.find((x) => x.id === id);
      return {
        filieres: s.filieres.filter((x) => x.id !== id),
        audit: [
          {
            id: `AUD-${auditCounter.toString().padStart(3, "0")}`,
            date: now(),
            utilisateur: "Amadou Touré",
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
      auditCounter += 1;
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
            id: `AUD-${auditCounter.toString().padStart(3, "0")}`,
            date: now(),
            utilisateur: "Amadou Touré",
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
      auditCounter += 1;
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
            id: `AUD-${auditCounter.toString().padStart(3, "0")}`,
            date: now(),
            utilisateur: "Amadou Touré",
            action: "Suppression matière",
            cible: m?.nom ?? matiereId,
            details: `Matière retirée de la filière ${f?.nom ?? ""}.`,
          },
          ...s.audit,
        ],
      };
    }),

  logAction: (e) =>
    set((s) => {
      auditCounter += 1;
      return {
        audit: [
          { ...e, id: `AUD-${auditCounter.toString().padStart(3, "0")}`, date: now() },
          ...s.audit,
        ],
      };
    }),
}));
