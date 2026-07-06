"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useAppStore } from "@/lib/view-store";
import { roleLabels } from "./data";
import { Users, FileText, BrainCircuit, BarChart3 } from "lucide-react";

export function WelcomeSection() {
  const session = useAuthStore((s) => s.session);
  const setView = useAppStore((s) => s.setView);

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const quickActions = [
    { label: "Candidatures", icon: FileText, view: "candidatures" as const },
    { label: "Étudiants", icon: Users, view: "etudiants" as const },
    { label: "Alertes IA", icon: BrainCircuit, view: "alertes" as const },
    { label: "Rapports", icon: BarChart3, view: "rapports" as const },
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        {/* Actions rapides */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.view}
                onClick={() => setView(action.view)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              >
                <Icon className="size-4 text-gray-400" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
