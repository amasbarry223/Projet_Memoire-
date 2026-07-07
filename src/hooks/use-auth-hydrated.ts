"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";

/** Attend l'initialisation Supabase Auth avant le rendu authentifié. */
export function useAuthHydrated() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    useAuthStore.getState().initialize().then(() => setReady(true));
  }, []);

  return isInitialized && ready;
}
