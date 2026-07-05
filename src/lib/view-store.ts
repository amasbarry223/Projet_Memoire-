"use client";

import { create } from "zustand";
import type { ViewKey } from "@/components/dashboard/data";

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
  setView: (v: ViewKey) => void;
  modal: ModalState;
  openModal: (m: ModalState) => void;
  closeModal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "dashboard",
  setView: (view) => set({ view }),
  modal: { type: "none" },
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: { type: "none" } }),
}));
