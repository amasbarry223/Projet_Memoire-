"use client";

import { create } from "zustand";
import type { Role, ViewKey } from "@/components/dashboard/data";
import { roleViews } from "@/components/dashboard/data";
import { getSupabase, getSupabaseAsync, resetSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, isSupabaseConfiguredWithRuntime } from "@/lib/supabase/env";
import {
  ensureRuntimeSupabaseConfig,
  getRuntimeSupabaseConfig,
} from "@/lib/supabase/runtime-config";

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
  initError: string | null;
  /** Session temporaire ouverte via un lien "mot de passe oublié" — l'app
   * doit demander un nouveau mot de passe avant de laisser entrer dans le
   * dashboard, plutôt que de traiter ce lien comme une connexion normale. */
  passwordRecovery: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  allowedViews: () => ViewKey[];
}

let initializePromise: Promise<void> | null = null;

function isPasswordRecoveryUrl(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return false;
  return new URLSearchParams(hash).get("type") === "recovery";
}

function clearAuthHashFromUrl() {
  if (typeof window === "undefined" || !window.location.hash) return;
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function loadSession(): Promise<Session | null> {
  const sb = await getSupabaseAsync();
  const { data: { user } } = await withTimeout(
    sb.auth.getUser(),
    10000,
    "Délai d'attente dépassé lors de la connexion à Supabase."
  );
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
  initError: null,
  passwordRecovery: false,

  initialize: async () => {
    if (get().isInitialized) return;
    if (initializePromise) {
      await initializePromise;
      return;
    }

    initializePromise = (async () => {
      set({ isLoading: true, initError: null });
      try {
        let runtimeConfig: Awaited<ReturnType<typeof ensureRuntimeSupabaseConfig>> = null;
        if (!isSupabaseConfigured()) {
          runtimeConfig = await ensureRuntimeSupabaseConfig();
        }

        if (!isSupabaseConfiguredWithRuntime(runtimeConfig)) {
          set({
            initError:
              "Configuration Supabase manquante. Définissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sur Vercel.",
          });
          return;
        }

        resetSupabaseClient();
        const sb = await getSupabaseAsync();
        sb.auth.onAuthStateChange(async (event) => {
          if (event === "PASSWORD_RECOVERY") {
            set({ passwordRecovery: true, session: null });
            return;
          }
          if (get().passwordRecovery) return;
          try {
            const session = await loadSession();
            set({ session });
          } catch {
            set({ session: null });
          }
        });

        if (isPasswordRecoveryUrl()) {
          set({ passwordRecovery: true, session: null });
        } else {
          const session = await loadSession();
          if (!get().passwordRecovery) {
            set({ session });
          }
        }
      } catch (e) {
        set({
          session: null,
          initError:
            e instanceof Error
              ? e.message
              : "Impossible d'initialiser l'authentification.",
        });
      } finally {
        set({ isInitialized: true, isLoading: false });
      }
    })();

    await initializePromise;
  },

  login: async (email, password) => {
    if (!isSupabaseConfigured()) {
      await ensureRuntimeSupabaseConfig();
    }
    if (!isSupabaseConfiguredWithRuntime(getRuntimeSupabaseConfig())) {
      return {
        ok: false,
        error:
          "Configuration Supabase manquante. Contactez l'administrateur.",
      };
    }
    set({ isLoading: true });
    const sb = await getSupabaseAsync();
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
    const sb = await getSupabaseAsync();
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/` : undefined;
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  },

  updatePassword: async (newPassword) => {
    if (newPassword.length < 8) {
      return { ok: false, error: "Le mot de passe doit contenir au moins 8 caractères." };
    }
    const sb = await getSupabaseAsync();
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: error.message };
    clearAuthHashFromUrl();
    const session = await loadSession();
    set({ passwordRecovery: false, session });
    return { ok: true };
  },

  logout: async () => {
    const sb = await getSupabaseAsync();
    await sb.auth.signOut();
    clearAuthHashFromUrl();
    set({ session: null, passwordRecovery: false });
  },

  allowedViews: () => {
    const role = get().session?.role;
    if (!role) return [];
    return roleViews[role];
  },
}));
