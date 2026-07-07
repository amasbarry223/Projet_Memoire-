"use client";

import { useEffect } from "react";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/auth-store";

/** Initialise et recharge les données Supabase quand l'utilisateur est connecté. */
export function useDataInit() {
  const session = useAuthStore((s) => s.session);
  const initialize = useDataStore((s) => s.initialize);
  const isLoading = useDataStore((s) => s.isLoading);
  const isInitialized = useDataStore((s) => s.isInitialized);
  const error = useDataStore((s) => s.error);

  useEffect(() => {
    if (session) void initialize();
  }, [session, initialize]);

  return { isLoading, isInitialized, error };
}
