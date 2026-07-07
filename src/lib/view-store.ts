"use client";

import { create } from "zustand";
import type { ViewKey } from "@/components/dashboard/data";
import { roleViews } from "@/components/dashboard/data";
import { useAuthStore } from "@/lib/auth-store";

// ─── État des modales ────────────────────────────────────────────────────────

export type ModalState =
  | { type: "none" }
  | {
      type: "traitement-dossier";
      dossierId: string;
      action: "valider" | "rejeter" | "incomplet";
    }
  | {
      type: "filiere";
      sub: "filiere" | "classe" | "matiere";
      filiereId?: string;
      editId?: string;
    }
  | { type: "alerte"; alerteId: string }
  | { type: "note"; etudiant?: string }
  | { type: "absence"; etudiant?: string }
  | { type: "candidature" };

// ─── Store ────────────────────────────────────────────────────────────────────

interface AppState {
  view: ViewKey;
  /** Change de vue en appliquant le RBAC : refusé si le rôle n'y a pas accès */
  setView: (v: ViewKey) => void;
  // ID du dossier actuellement ouvert dans la vue "candidatures" (sous-vue détail)
  selectedDossierId: string | null;
  openDossier: (id: string) => void;
  closeDossier: () => void;
  modal: ModalState;
  openModal: (m: ModalState) => void;
  closeModal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "dashboard",
  setView: (view) => {
    const role = useAuthStore.getState().session?.role;
    // Pas de session (écran de connexion) : on accepte sans filtre
    if (!role) {
      set({ view });
      return;
    }
    const allowed = roleViews[role];
    set({ view: allowed.includes(view) ? view : allowed[0] ?? "dashboard" });
  },
  selectedDossierId: null,
  openDossier: (id) => set({ selectedDossierId: id }),
  closeDossier: () => set({ selectedDossierId: null }),
  modal: { type: "none" },
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: { type: "none" } }),
}));
