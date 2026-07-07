"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";

/** Attend l'initialisation Supabase Auth avant le rendu authentifié. */
export function useAuthHydrated() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [ready, setReady] = useState(isInitialized);

  useEffect(() => {
    if (isInitialized) {
      setReady(true);
      return;
    }
    void useAuthStore
      .getState()
      .initialize()
      .finally(() => setReady(true));
  }, [isInitialized]);

  return ready;
}
