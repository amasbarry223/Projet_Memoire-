"use client";

import { create } from "zustand";
import type { Role, ViewKey } from "@/components/dashboard/data";
import { roleViews } from "@/components/dashboard/data";
import { getSupabase } from "@/lib/supabase/client";

export type Session = {
  email: string;
  nom: string;
  prenom: string;
  role: Role;
};

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  allowedViews: () => ViewKey[];
}

async function loadSession(): Promise<Session | null> {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return null;
  return {
    email: profile.email,
    nom: profile.nom,
    prenom: profile.prenom,
    role: profile.role as Role,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    const sb = getSupabase();
    sb.auth.onAuthStateChange(async () => {
      const session = await loadSession();
      set({ session });
    });
    const session = await loadSession();
    set({ session, isInitialized: true, isLoading: false });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    const sb = getSupabase();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      set({ isLoading: false });
      return { ok: false, error: error.message === "Invalid login credentials" ? "Mot de passe incorrect." : error.message };
    }
    const session = await loadSession();
    if (!session) {
      set({ isLoading: false });
      return { ok: false, error: "Profil utilisateur introuvable." };
    }
    await sb.from("profiles").update({ derniere_connexion: new Date().toISOString() }).eq("id", (await sb.auth.getUser()).data.user!.id);
    set({ session, isLoading: false });
    return { ok: true };
  },

  resetPassword: async (email) => {
    if (!email.trim()) {
      return { ok: false, error: "Veuillez saisir votre adresse email." };
    }
    const sb = getSupabase();
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/` : undefined;
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  },

  logout: async () => {
    const sb = getSupabase();
    await sb.auth.signOut();
    set({ session: null });
  },

  allowedViews: () => {
    const role = get().session?.role;
    if (!role) return [];
    return roleViews[role];
  },
}));
