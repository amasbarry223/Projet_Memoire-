"use client";

import { useState } from "react";
import { BookOpen, School, BookMarked, Users, Plus, Pencil, Trash2, MoreVertical } from "lucide-react";
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
import {
  type Filiere,
  type Classe,
  type Matiere,
} from "@/components/dashboard/data";
import { PageHeader, Panel } from "./shared";
import { FiliereModal } from "../modals/filiere-modal";
import { FiliereDeleteDialog, type DeleteTarget } from "../modals/filiere-delete-dialog";
import { useToast } from "@/hooks/use-toast";

type EditState =
  | { kind: "filiere"; filiere: Filiere }
  | { kind: "classe"; filiereId: string; classe: Classe }
  | { kind: "matiere"; filiereId: string; matiere: Matiere }
  | null;

export function FilieresView() {
  const openModal = useAppStore((s) => s.openModal);
  const { toast } = useToast();

  const list = useDataStore((s) => s.filieres);
  const deleteFiliereStore = useDataStore((s) => s.deleteFiliere);
  const deleteClasseStore = useDataStore((s) => s.deleteClasse);
  const deleteMatiereStore = useDataStore((s) => s.deleteMatiere);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  function handleDeleteFiliere(f: Filiere) {
    setDeleteTarget({ type: "filiere", nom: f.nom });
    setDeleteOpen(true);
  }

  function handleDeleteClasse(filiereId: string, c: Classe) {
    const f = list.find((x) => x.id === filiereId);
    setDeleteTarget({
      type: "classe",
      nom: c.nom,
      parent: f?.nom,
    });
    setDeleteOpen(true);
  }

  function handleDeleteMatiere(filiereId: string, m: Matiere) {
    const f = list.find((x) => x.id === filiereId);
    setDeleteTarget({
      type: "matiere",
      nom: m.nom,
      parent: f?.nom,
    });
    setDeleteOpen(true);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "filiere") {
      const f = list.find((x) => x.nom === deleteTarget.nom);
      if (f) deleteFiliereStore(f.id);
      toast({
        title: "Filière supprimée",
        description: `${deleteTarget.nom} et ses classes/matières ont été supprimés. Journalisé.`,
        variant: "destructive",
      });
    } else if (deleteTarget.type === "classe") {
      const f = list.find((x) => x.nom === deleteTarget.parent);
      const c = f?.classes.find((x) => x.nom === deleteTarget.nom);
      if (f && c) deleteClasseStore(f.id, c.id);
      toast({
        title: "Classe supprimée",
        description: `${deleteTarget.nom} a été retirée. Journalisé dans l'audit.`,
        variant: "destructive",
      });
    } else {
      const f = list.find((x) => x.nom === deleteTarget.parent);
      const m = f?.matieres.find((x) => x.nom === deleteTarget.nom);
      if (f && m) deleteMatiereStore(f.id, m.id);
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
    <div>
      <PageHeader
        title="Filières & Classes"
        description="Référentiels : filières, classes, matières et affectations (F6.2)"
        icon={BookOpen}
      />

      <div className="space-y-6">
        {list.map((f) => {
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
                        className="group flex items-center justify-between rounded-lg border border-gray-100 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {c.nom}
                          </p>
                          <p className="text-xs text-gray-400">{c.niveau}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-emerald-50 font-normal text-emerald-700">
                            {c.effectif} élèves
                          </Badge>
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
                        Aucune classe — cliquez sur « Classe » pour en ajouter.
                      </p>
                    )}
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
                        className="group flex items-center justify-between rounded-lg border border-gray-100 p-3"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {m.nom}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-gray-100 font-normal text-gray-600">
                            Coef. {m.coefficient}
                          </Badge>
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
                        Aucune matière — cliquez sur « Matière » pour en ajouter.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Panel>
          );
        })}
        {list.length === 0 && (
          <Panel className="p-12 text-center text-gray-400">
            Aucune filière. Cliquez sur « Ajouter une filière » ci-dessous.
          </Panel>
        )}
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

      <FiliereDeleteDialog
        open={deleteOpen}
        target={deleteTarget}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
