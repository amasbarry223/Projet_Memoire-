"use client";

import { useMemo } from "react";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { useDataStore } from "@/lib/data-store";
import { useAppStore } from "@/lib/view-store";
import { noteSur20 } from "./views/shared";

export function ClassesARisque() {
  const etudiants = useDataStore((s) => s.etudiants);
  const notes = useDataStore((s) => s.notes);
  const setView = useAppStore((s) => s.setView);

  // Moyenne réelle par étudiant, calculée depuis les vraies notes (comme
  // dans Suivi/Rapports) — etudiants.moyenne est un champ saisi à la main,
  // jamais resynchronisé, donc pas utilisable ici.
  const moyenneParEtudiant = useMemo(() => {
    const parEtudiant = new Map<string, { note: number | null; sur: number; coefficient: number }[]>();
    for (const n of notes) {
      const list = parEtudiant.get(n.etudiant) ?? [];
      list.push(n);
      parEtudiant.set(n.etudiant, list);
    }
    const result = new Map<string, number>();
    for (const [etu, list] of parEtudiant) {
      const notees = list.filter((n) => n.note !== null);
      const sommeCoef = notees.reduce((s, n) => s + n.coefficient, 0);
      if (sommeCoef === 0) continue;
      const moyenne = notees.reduce((s, n) => s + noteSur20(n.note, n.sur) * n.coefficient, 0) / sommeCoef;
      result.set(etu, moyenne);
    }
    return result;
  }, [notes]);

  // Groupe par classe : moyenne (uniquement les étudiants notés) et
  // assiduité moyennes
  const parClasse = etudiants.reduce<
    Record<string, { moyennes: number[]; assiduites: number[]; count: number }>
  >((acc, e) => {
    if (!acc[e.classe]) {
      acc[e.classe] = { moyennes: [], assiduites: [], count: 0 };
    }
    const moyenneReelle = moyenneParEtudiant.get(`${e.prenom} ${e.nom}`);
    if (moyenneReelle !== undefined) acc[e.classe].moyennes.push(moyenneReelle);
    acc[e.classe].assiduites.push(e.assiduite);
    acc[e.classe].count += 1;
    return acc;
  }, {});

  const classes = Object.entries(parClasse)
    // Classes sans aucune note saisie : pas de moyenne réelle calculable,
    // on ne peut pas les classer par risque de moyenne.
    .filter(([, data]) => data.moyennes.length > 0)
    .map(([nom, data]) => ({
      nom,
      moyenne:
        data.moyennes.reduce((s, m) => s + m, 0) / data.moyennes.length,
      assiduite:
        data.assiduites.reduce((s, a) => s + a, 0) / data.assiduites.length,
      effectif: data.count,
    }))
    .sort((a, b) => a.moyenne - b.moyenne) // tri par moyenne croissante
    .slice(0, 5); // top 5 des classes à risque

  function risqueNiveau(moyenne: number, assiduite: number) {
    if (moyenne < 10 || assiduite < 75) return "élevé";
    if (moyenne < 12 || assiduite < 85) return "moyen";
    return "faible";
  }

  function risqueColor(niveau: string) {
    if (niveau === "élevé") return "bg-red-50 text-red-600 border-red-200";
    if (niveau === "moyen")
      return "bg-orange-50 text-orange-600 border-orange-200";
    return "bg-blue-50 text-blue-600 border-blue-200";
  }

  function moyenneColor(m: number) {
    if (m >= 14) return "text-blue-600";
    if (m >= 10) return "text-gray-700";
    return "text-red-500";
  }

  function assiduiteColor(a: number) {
    if (a >= 90) return "bg-blue-500";
    if (a >= 75) return "bg-yellow-500";
    return "bg-red-500";
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Classes à risque
          </h3>
          <p className="text-xs text-gray-400">
            Classes triées par moyenne la plus basse
          </p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle className="size-4" />
        </div>
      </div>

      <ul className="space-y-2.5">
        {classes.map((c) => {
          const niveau = risqueNiveau(c.moyenne, c.assiduite);
          return (
            <li
              key={c.nom}
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {c.nom}
                  </p>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${risqueColor(niveau)}`}
                  >
                    Risque {niveau}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{c.effectif} étudiants</p>
              </div>

              {/* Moyenne */}
              <div className="text-right">
                <p className={`text-sm font-bold ${moyenneColor(c.moyenne)}`}>
                  {c.moyenne.toFixed(1)}/20
                </p>
                <p className="text-[10px] text-gray-400">Moyenne</p>
              </div>

              {/* Barre assiduité */}
              <div className="w-16 shrink-0">
                <div className="mb-0.5 flex items-center justify-end gap-1">
                  <TrendingDown className="size-3 text-gray-300" />
                  <span className="text-[10px] font-medium text-gray-500">
                    {Math.round(c.assiduite)}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full ${assiduiteColor(c.assiduite)}`}
                    style={{ width: `${c.assiduite}%` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
        {classes.length === 0 && (
          <li className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
            Aucune classe enregistrée.
          </li>
        )}
      </ul>

      <button
        onClick={() => setView("etudiants")}
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-gray-100 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
      >
        Voir tous les étudiants
      </button>
    </div>
  );
}
