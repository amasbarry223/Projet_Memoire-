"use client";

import { ChevronRight } from "lucide-react";
import { useDataStore } from "@/lib/data-store";
import { statutBadge } from "./views/shared";
import { useAppStore } from "@/lib/view-store";

export function DossiersRecents() {
  const candidatures = useDataStore((s) => s.candidatures);
  const setView = useAppStore((s) => s.setView);

  // 4 dossiers les plus récents (déjà triés par date de soumission desc dans les data)
  const recents = [...candidatures]
    .sort((a, b) => b.dateSoumission.localeCompare(a.dateSoumission))
    .slice(0, 4);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Dossiers récents
          </h3>
          <p className="text-xs text-gray-400">Candidatures soumises</p>
        </div>
        <button
          onClick={() => setView("candidatures")}
          className="flex items-center gap-1 text-xs font-medium text-emerald-600 transition hover:text-emerald-700"
        >
          Voir tout
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      <ul className="space-y-3">
        {recents.map((dossier) => (
          <li
            key={dossier.id}
            className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-base font-bold text-white">
              {dossier.prenom.charAt(0)}
              {dossier.nom.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {dossier.prenom} {dossier.nom}
              </p>
              <p className="text-xs text-gray-400">
                {dossier.filiere} · {dossier.dateSoumission}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statutBadge(dossier.statut)}`}
            >
              {dossier.statut}
            </span>
          </li>
        ))}
        {recents.length === 0 && (
          <li className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
            Aucune candidature pour le moment.
          </li>
        )}
      </ul>
    </div>
  );
}
