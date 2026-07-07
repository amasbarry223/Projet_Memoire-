"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  School,
  BookMarked,
  Users,
  Plus,
  Trash2,
  MoreVertical,
  Layers,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/view-store";
import { useDataStore } from "@/lib/data-store";
import { type Filiere, type Classe, type Matiere } from "@/components/dashboard/data";
import {
  PageHeader,
  FullWidthPage,
  FullWidthHeader,
  FullWidthKpiGrid,
  FullWidthSection,
  KpiCard,
  EmptyState,
} from "./shared";
import { FiliereDeleteDialog, type DeleteTarget } from "../modals/filiere-delete-dialog";
import { useToast } from "@/hooks/use-toast";

export function FilieresView() {
  const openModal = useAppStore((s) => s.openModal);
  const { toast } = useToast();

  const list = useDataStore((s) => s.filieres);
  const etudiants = useDataStore((s) => s.etudiants);
  const deleteFiliereStore = useDataStore((s) => s.deleteFiliere);
  const deleteClasseStore = useDataStore((s) => s.deleteClasse);
  const deleteMatiereStore = useDataStore((s) => s.deleteMatiere);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // L'effectif d'une classe est calculé depuis les vrais étudiants inscrits
  // (classes.effectif était un champ saisi à la main, jamais resynchronisé).
  const effectifParClasse = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of etudiants) {
      map.set(e.classe, (map.get(e.classe) ?? 0) + 1);
    }
    return map;
  }, [etudiants]);

  const stats = useMemo(
    () => ({
      filieres: list.length,
      classes: list.reduce((s, f) => s + f.classes.length, 0),
      effectif: etudiants.length,
    }),
    [list, etudiants]
  );

  function handleDeleteFiliere(f: Filiere) {
    setDeleteTarget({ type: "filiere", id: f.id, nom: f.nom });
    setDeleteOpen(true);
  }

  function handleDeleteClasse(filiereId: string, c: Classe) {
    const f = list.find((x) => x.id === filiereId);
    setDeleteTarget({ type: "classe", id: c.id, nom: c.nom, parentId: filiereId, parent: f?.nom });
    setDeleteOpen(true);
  }

  function handleDeleteMatiere(filiereId: string, m: Matiere) {
    const f = list.find((x) => x.id === filiereId);
    setDeleteTarget({ type: "matiere", id: m.id, nom: m.nom, parentId: filiereId, parent: f?.nom });
    setDeleteOpen(true);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "filiere") {
      deleteFiliereStore(deleteTarget.id);
      toast({
        title: "Filière supprimée",
        description: `${deleteTarget.nom} et ses classes/matières ont été supprimés. Journalisé.`,
        variant: "destructive",
      });
    } else if (deleteTarget.type === "classe") {
      if (deleteTarget.parentId) deleteClasseStore(deleteTarget.parentId, deleteTarget.id);
      toast({
        title: "Classe supprimée",
        description: `${deleteTarget.nom} a été retirée. Journalisé dans l'audit.`,
        variant: "destructive",
      });
    } else {
      if (deleteTarget.parentId) deleteMatiereStore(deleteTarget.parentId, deleteTarget.id);
      toast({
        title: "Matière supprimée",
        description: `${deleteTarget.nom} a été retirée. Journalisé dans l'audit.`,
        variant: "destructive",
      });
    }
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  return (
    <FullWidthPage>
      <FullWidthHeader>
        <PageHeader
          className="mb-0"
          title="Filières & Classes"
          badge="Module F6"
          description="Référentiels : filières, classes, matières et affectations (F6.2)"
          icon={BookOpen}
          actionLabel="Ajouter une filière"
          onAction={() => openModal({ type: "filiere", sub: "filiere" })}
        />
      </FullWidthHeader>

      <FullWidthKpiGrid cols={3}>
        <KpiCard
          label="Filières"
          value={stats.filieres}
          icon={BookOpen}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <KpiCard
          label="Classes"
          value={stats.classes}
          icon={Layers}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <KpiCard
          label="Effectif total"
          value={stats.effectif}
          icon={Users}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
      </FullWidthKpiGrid>

      <FullWidthSection title="Référentiels pédagogiques">
        {list.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Aucune filière"
            description="Ajoutez une filière pour commencer à structurer les classes et matières."
            action={
              <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => openModal({ type: "filiere", sub: "filiere" })}
              >
                <Plus className="size-4" />
                Ajouter une filière
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {list.map((f) => {
              const effectifTotal = f.classes.reduce(
                (sum, c) => sum + (effectifParClasse.get(c.nom) ?? 0),
                0
              );
              return (
                <div
                  key={f.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">
                        <BookOpen className="size-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900">{f.nom}</h3>
                          <Badge variant="secondary" className="bg-gray-100 font-mono text-gray-500">
                            {f.code}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">{f.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-sm text-gray-600">
                        <Users className="size-4 text-gray-400" />
                        <span className="font-semibold">{effectifTotal}</span> élèves
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions filière</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              openModal({ type: "filiere", sub: "filiere", editId: f.id })
                            }
                          >
                            <Pencil className="size-4" />
                            Modifier la filière
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-700"
                            onClick={() => handleDeleteFiliere(f)}
                          >
                            <Trash2 className="size-4" />
                            Supprimer la filière
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        <School className="size-3.5" />
                        Classes ({f.classes.length})
                      </h4>
                      <div className="space-y-2">
                        {f.classes.map((c) => (
                          <div
                            key={c.id}
                            className="group flex items-center justify-between rounded-lg border border-gray-100 p-2.5"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">{c.nom}</p>
                              <p className="text-xs text-gray-400">{c.niveau}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-blue-50 font-normal text-blue-800">
                                {effectifParClasse.get(c.nom) ?? 0} élèves
                              </Badge>
                              <button
                                type="button"
                                onClick={() =>
                                  openModal({
                                    type: "filiere",
                                    sub: "classe",
                                    filiereId: f.id,
                                    editId: c.id,
                                  })
                                }
                                className="flex size-7 items-center justify-center rounded-md text-gray-300 opacity-0 transition hover:bg-blue-50 hover:text-blue-600 group-hover:opacity-100"
                                aria-label="Modifier la classe"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClasse(f.id, c)}
                                className="flex size-7 items-center justify-center rounded-md text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                                aria-label="Supprimer la classe"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {f.classes.length === 0 && (
                          <p className="rounded-lg border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400">
                            Aucune classe
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        <BookMarked className="size-3.5" />
                        Matières ({f.matieres.length})
                      </h4>
                      <div className="space-y-2">
                        {f.matieres.map((m) => (
                          <div
                            key={m.id}
                            className="group flex items-center justify-between rounded-lg border border-gray-100 p-2.5"
                          >
                            <p className="text-sm font-medium text-gray-900">{m.nom}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-gray-100 font-normal text-gray-600">
                                Coef. {m.coefficient}
                              </Badge>
                              <button
                                type="button"
                                onClick={() =>
                                  openModal({
                                    type: "filiere",
                                    sub: "matiere",
                                    filiereId: f.id,
                                    editId: m.id,
                                  })
                                }
                                className="flex size-7 items-center justify-center rounded-md text-gray-300 opacity-0 transition hover:bg-blue-50 hover:text-blue-600 group-hover:opacity-100"
                                aria-label="Modifier la matière"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMatiere(f.id, m)}
                                className="flex size-7 items-center justify-center rounded-md text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                                aria-label="Supprimer la matière"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {f.matieres.length === 0 && (
                          <p className="rounded-lg border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400">
                            Aucune matière
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </FullWidthSection>

      <FiliereDeleteDialog
        open={deleteOpen}
        target={deleteTarget}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </FullWidthPage>
  );
}
