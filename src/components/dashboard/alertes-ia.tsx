"use client";

import { BrainCircuit } from "lucide-react";
import { useDataStore } from "@/lib/data-store";
import { useAppStore } from "@/lib/view-store";

const niveauBg: Record<string, string> = {
  "Élevé": "bg-red-50 text-red-600",
  "Moyen": "bg-orange-50 text-orange-600",
  "Faible": "bg-yellow-50 text-yellow-700",
};

export function AlertesIA() {
  const alertes = useDataStore((s) => s.alertes);
  const openModal = useAppStore((s) => s.openModal);
  const setView = useAppStore((s) => s.setView);

  // Alertes non clôturées, les plus récentes en premier (max 5)
  const recentes = [...alertes]
    .filter((a) => a.statut !== "Clôturée")
    .slice(0, 5);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Alertes IA récentes
          </h3>
          <p className="text-xs text-gray-400">
            Détection de risque pédagogique · {recentes.length} active
            {recentes.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setView("alertes")}
          className="flex size-9 items-center justify-center rounded-full bg-yellow-50 text-yellow-600 transition hover:bg-yellow-100"
          aria-label="Voir toutes les alertes"
        >
          <BrainCircuit className="size-4" />
        </button>
      </div>

      <ul className="space-y-3">
        {recentes.map((alerte, idx) => (
          <li
            key={alerte.id}
            className="flex cursor-pointer items-stretch gap-3"
            onClick={() => openModal({ type: "alerte", alerteId: alerte.id })}
          >
            <div className="flex flex-col items-center">
              <span className={`mt-1 size-2.5 rounded-full ${alerte.indicatorColor}`} />
              {idx < recentes.length - 1 && (
                <span className="my-1 w-px flex-1 bg-gray-200" />
              )}
            </div>
            <div className="flex flex-1 items-start justify-between gap-2 pb-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {alerte.etudiant}
                </p>
                <p className="text-xs text-gray-400">
                  {alerte.classe} · {alerte.motif}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${niveauBg[alerte.niveau]}`}
              >
                {alerte.niveau}
              </span>
            </div>
          </li>
        ))}
        {recentes.length === 0 && (
          <li className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
            Aucune alerte active. Tout est sous contrôle.
          </li>
        )}
      </ul>
    </div>
  );
}
