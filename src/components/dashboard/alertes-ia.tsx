import { BrainCircuit } from "lucide-react";
import { alertesIA } from "./data";

const niveauBg: Record<string, string> = {
  "Élevé": "bg-red-50 text-red-600",
  "Moyen": "bg-orange-50 text-orange-600",
  "Faible": "bg-amber-50 text-amber-600",
};

export function AlertesIA() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Alertes IA récentes
          </h3>
          <p className="text-xs text-gray-400">Détection de risque pédagogique</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-full bg-amber-50 text-amber-500">
          <BrainCircuit className="size-4" />
        </div>
      </div>

      <ul className="space-y-3">
        {alertesIA.map((alerte, idx) => (
          <li key={idx} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center">
              <span className={`mt-1 size-2.5 rounded-full ${alerte.indicatorColor}`} />
              {idx < alertesIA.length - 1 && (
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
      </ul>
    </div>
  );
}
