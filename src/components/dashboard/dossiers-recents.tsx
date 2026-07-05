import { ChevronRight } from "lucide-react";
import { dossiersRecents } from "./data";

export function DossiersRecents() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Dossiers récents
          </h3>
          <p className="text-xs text-gray-400">Candidatures soumises</p>
        </div>
        <button className="flex items-center gap-1 text-xs font-medium text-emerald-600 transition hover:text-emerald-700">
          Voir tout
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      <ul className="space-y-3">
        {dossiersRecents.map((dossier, idx) => (
          <li
            key={idx}
            className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50"
          >
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-lg text-base font-bold text-white ${dossier.initialBg}`}
            >
              {dossier.candidat.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {dossier.candidat}
              </p>
              <p className="text-xs text-gray-400">
                {dossier.filiere} · {dossier.date}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${dossier.statutBg}`}
            >
              {dossier.statut}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
