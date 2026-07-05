"use client";

import { useAuthStore } from "@/lib/auth-store";
import { roleLabels } from "./data";

export function WelcomeSection() {
  const session = useAuthStore((s) => s.session);

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour{session ? `, ${session.prenom}` : ""} ! Voici l&apos;activité
            du jour
          </h1>
          <p className="mt-1 text-sm text-gray-500 capitalize">
            {dateStr} · Session en cours
            {session ? ` · ${roleLabels[session.role]}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
