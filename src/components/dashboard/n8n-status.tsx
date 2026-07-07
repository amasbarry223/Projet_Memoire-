"use client";

import { useEffect, useState } from "react";
import { Workflow, ArrowRight, History, Circle } from "lucide-react";
import { useAppStore } from "@/lib/view-store";

type N8nStatus = {
  online: boolean;
  latencyMs: number | null;
  n8nConfigured: boolean;
  workflowsActifs: number;
  evenementsTraites: number;
  recentEvents: { workflow_name: string; event_type: string; created_at: string }[];
};

export function N8nStatus() {
  const setView = useAppStore((s) => s.setView);
  const [status, setStatus] = useState<N8nStatus | null>(null);

  useEffect(() => {
    void fetch("/api/n8n/status")
      .then((r) => r.json())
      .then((d) => setStatus(d as N8nStatus))
      .catch(() => setStatus(null));
  }, []);

  const workflowsActifs = status?.workflowsActifs ?? 0;
  const evenementsTraites = status?.evenementsTraites ?? 0;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-5 text-white shadow-sm">
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 size-28 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Automatisation n8n</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
            <Circle
              className={`size-2 fill-current ${status?.online ? "text-green-300" : status?.n8nConfigured ? "text-red-300" : "text-gray-300"}`}
            />
            {status === null
              ? "Vérification…"
              : !status.n8nConfigured
                ? "Non configuré"
                : status.online
                  ? `En ligne${status.latencyMs != null ? ` (${status.latencyMs} ms)` : ""}`
                  : "Hors ligne"}
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
          <Workflow className="size-6" />
        </div>
      </div>

      <div className="relative mt-6 flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
        >
          Workflows actifs
          <ArrowRight className="size-4" />
        </button>
        <button
          type="button"
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
          <p className="text-2xl font-bold">{evenementsTraites}</p>
          <p className="text-xs text-white/70">Événements récents</p>
        </div>
      </div>
    </div>
  );
}
