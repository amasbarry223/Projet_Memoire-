"use client";

import { Workflow, ArrowRight, History } from "lucide-react";
import { useDataStore } from "@/lib/data-store";
import { useAppStore } from "@/lib/view-store";

export function N8nStatus() {
  const audit = useDataStore((s) => s.audit);
  const setView = useAppStore((s) => s.setView);

  // Workflows actifs = types d'actions distincts journalisés
  const workflowsActifs = new Set(audit.map((a) => a.action)).size;
  // Événements traités = nombre total d'entrées d'audit
  const evenementsTraites = audit.length;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-5 text-white shadow-sm">
      {/* Décor */}
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 size-28 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Automatisation n8n</h3>
          <p className="mt-1 text-sm text-white/80">Workflows en temps réel</p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
          <Workflow className="size-6" />
        </div>
      </div>

      <div className="relative mt-6 flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50">
          Workflows actifs
          <ArrowRight className="size-4" />
        </button>
        <button
          onClick={() => setView("audit")}
          className="flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <History className="size-4" />
          Historique
        </button>
      </div>

      <div className="relative mt-5 flex items-center gap-4 border-t border-white/15 pt-4 text-sm">
        <div>
          <p className="text-2xl font-bold">{workflowsActifs}</p>
          <p className="text-xs text-white/70">Workflows actifs</p>
        </div>
        <div className="h-8 w-px bg-white/20" />
        <div>
          <p className="text-2xl font-bold">
            {evenementsTraites.toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-white/70">Événements traités</p>
        </div>
      </div>
    </div>
  );
}
