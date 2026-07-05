"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Role,
  ViewKey,
  DemoAccount,
} from "@/components/dashboard/data";
import {
  demoAccounts,
  defaultView,
  roleViews,
} from "@/components/dashboard/data";
import { useAppStore } from "@/lib/view-store";

// ─── Session utilisateur ─────────────────────────────────────────────────────

export type Session = {
  email: string;
  nom: string;
  prenom: string;
  role: Role;
};

interface AuthState {
  session: Session | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  loginAs: (account: DemoAccount) => void;
  logout: () => void;
  /** Vues accessibles au rôle courant */
  allowedViews: () => ViewKey[];
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      login: (email, password) => {
        const account = demoAccounts.find(
          (a) => a.email.toLowerCase() === email.toLowerCase()
        );
        if (!account) {
          return { ok: false, error: "Aucun compte trouvé pour cet email." };
        }
        if (account.password !== password) {
          return { ok: false, error: "Mot de passe incorrect." };
        }
        set({
          session: {
            email: account.email,
            nom: account.nom,
            prenom: account.prenom,
            role: account.role,
          },
        });
        // À la connexion, bascule vers la vue par défaut du rôle
        useAppStore.getState().setView(defaultView[account.role]);
        return { ok: true };
      },
      loginAs: (account) => {
        set({
          session: {
            email: account.email,
            nom: account.nom,
            prenom: account.prenom,
            role: account.role,
          },
        });
        useAppStore.getState().setView(defaultView[account.role]);
      },
      logout: () => {
        set({ session: null });
        useAppStore.getState().setView("dashboard");
      },
      allowedViews: () => {
        const role = get().session?.role;
        if (!role) return [];
        return roleViews[role];
      },
    }),
    {
      name: "scolaflow-session",
      partialize: (state) => ({ session: state.session }),
    }
  )
);
