"use client";

import { create } from "zustand";
import type { ViewKey } from "@/components/dashboard/data";
import { roleViews } from "@/components/dashboard/data";
import { useAuthStore } from "@/lib/auth-store";

// ─── État des modales ────────────────────────────────────────────────────────

export type ModalState =
  | { type: "none" }
  | { type: "dossier-detail"; dossierId: string }
  | {
      type: "traitement-dossier";
      dossierId: string;
      action: "valider" | "rejeter" | "incomplet";
    }
  | { type: "utilisateur"; userId?: string }
  | {
      type: "filiere";
      sub: "filiere" | "classe" | "matiere";
      filiereId?: string;
    }
  | { type: "alerte"; alerteId: string }
  | { type: "note"; etudiant?: string };

// ─── Store ────────────────────────────────────────────────────────────────────

interface AppState {
  view: ViewKey;
  /** Change de vue en appliquant le RBAC : refusé si le rôle n'y a pas accès */
  setView: (v: ViewKey) => void;
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
  modal: { type: "none" },
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: { type: "none" } }),
}));
