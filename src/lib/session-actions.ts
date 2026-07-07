"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useAppStore } from "@/lib/view-store";

/** Déconnexion + réinitialisation de la navigation (évite la dépendance circulaire auth ↔ view). */
export async function logoutSession() {
  await useAuthStore.getState().logout();
  const app = useAppStore.getState();
  app.setView("dashboard");
  app.closeDossier();
  app.closeModal();
}
