"use client";

import { BookOpen, School, BookMarked, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/view-store";
import { filieres } from "@/components/dashboard/data";
import { PageHeader, Panel } from "./shared";

export function FilieresView() {
  const openModal = useAppStore((s) => s.openModal);

  return (
    <div>
      <PageHeader
        title="Filières & Classes"
        description="Référentiels : filières, classes, matières et affectations (F6.2)"
        icon={BookOpen}
      />

      <div className="space-y-6">
        {filieres.map((f) => {
          const effectifTotal = f.classes.reduce((sum, c) => sum + c.effectif, 0);
          return (
            <Panel key={f.id} className="p-5">
              {/* En-tête filière */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500 text-white">
                    <BookOpen className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {f.nom}
                      </h3>
                      <Badge variant="secondary" className="bg-gray-100 font-mono text-gray-500">
                        {f.code}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {f.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-sm text-gray-600">
                    <Users className="size-4 text-gray-400" />
                    <span className="font-semibold">{effectifTotal}</span> étudiants
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      openModal({ type: "filiere", sub: "classe", filiereId: f.id })
                    }
                  >
                    <Plus className="size-4" />
                    Classe
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      openModal({ type: "filiere", sub: "matiere", filiereId: f.id })
                    }
                  >
                    <Plus className="size-4" />
                    Matière
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Classes */}
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <School className="size-3.5" />
                    Classes ({f.classes.length})
                  </h4>
                  <div className="space-y-2">
                    {f.classes.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {c.nom}
                          </p>
                          <p className="text-xs text-gray-400">{c.niveau}</p>
                        </div>
                        <Badge variant="secondary" className="bg-emerald-50 font-normal text-emerald-700">
                          {c.effectif} élèves
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Matières */}
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <BookMarked className="size-3.5" />
                    Matières ({f.matieres.length})
                  </h4>
                  <div className="space-y-2">
                    {f.matieres.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {m.nom}
                        </p>
                        <Badge variant="secondary" className="bg-gray-100 font-normal text-gray-600">
                          Coef. {m.coefficient}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Bouton ajouter filière */}
      <div className="mt-6 flex justify-center">
        <Button
          variant="outline"
          className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
          onClick={() => openModal({ type: "filiere", sub: "filiere" })}
        >
          <Plus className="size-4" />
          Ajouter une filière
        </Button>
      </div>
    </div>
  );
}
