"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  Trash2,
  ClipboardEdit,
  CalendarX2,
  Mail,
  Hash,
  BookOpen,
  School,
  TrendingUp,
  CalendarCheck,
  CircleDot,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/view-store";
import { useDataStore } from "@/lib/data-store";
import { type Etudiant } from "@/components/dashboard/data";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge, noteSur20 } from "./shared";
import { EtudiantFormModal } from "../modals/etudiant-form-modal";
import { EtudiantDeleteDialog } from "../modals/etudiant-delete-dialog";

function moyenneColor(m: number) {
  if (m >= 14) return "text-blue-700";
  if (m >= 10) return "text-gray-700";
  return "text-red-500";
}

function InfoCard({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-gray-400" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <div className="mt-0.5 break-words text-sm font-medium text-gray-900">{children}</div>
      </div>
    </div>
  );
}

export function EtudiantDetailView({ etudiant }: { etudiant: Etudiant }) {
  const closeEtudiant = useAppStore((s) => s.closeEtudiant);
  const setView = useAppStore((s) => s.setView);
  const openModal = useAppStore((s) => s.openModal);
  const updateEtudiant = useDataStore((s) => s.updateEtudiant);
  const deleteEtudiant = useDataStore((s) => s.deleteEtudiant);
  const notes = useDataStore((s) => s.notes);
  const absences = useDataStore((s) => s.absences);
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const nomComplet = `${etudiant.prenom} ${etudiant.nom}`;
  const mesNotes = notes.filter((n) => n.etudiant === nomComplet);
  const mesAbsences = absences.filter((a) => a.etudiant === nomComplet);
  const initials = `${etudiant.prenom.charAt(0)}${etudiant.nom.charAt(0)}`.toUpperCase();

  function handleBack() {
    closeEtudiant();
    setView("etudiants");
  }

  async function handleSave(data: Omit<Etudiant, "id"> & { id?: string }) {
    try {
      await updateEtudiant(etudiant.id, data);
      toast({
        title: "Étudiant modifié",
        description: `${data.prenom} ${data.nom} a été mis à jour.`,
      });
      setFormOpen(false);
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Opération échouée",
        variant: "destructive",
      });
    }
  }

  async function handleConfirmDelete() {
    try {
      await deleteEtudiant(etudiant.id);
      toast({
        title: "Étudiant supprimé",
        description: `${etudiant.prenom} ${etudiant.nom} (${etudiant.matricule}) a été supprimé. Journalisé dans l'audit.`,
        variant: "destructive",
      });
      handleBack();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Suppression échouée",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* Barre supérieure sticky — fil d'Ariane + actions */}
      <div className="sticky top-0 z-10 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2 sm:px-4 lg:px-5">
        <div className="flex min-w-0 items-center gap-1.5 text-sm">
          <button
            type="button"
            onClick={handleBack}
            className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Étudiants</span>
          </button>
          <ChevronRight className="size-3.5 shrink-0 text-gray-300" />
          <span className="truncate font-mono text-xs font-medium text-gray-500 sm:text-sm">
            {etudiant.matricule}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
            onClick={() => openModal({ type: "note", etudiant: etudiant.id })}
          >
            <ClipboardEdit className="size-3.5 text-blue-500" />
            <span className="hidden sm:inline">Saisir une note</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
            onClick={() => openModal({ type: "absence", etudiant: etudiant.id })}
          >
            <CalendarX2 className="size-3.5 text-blue-500" />
            <span className="hidden sm:inline">Saisir une absence</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
            onClick={() => setFormOpen(true)}
          >
            <Pencil className="size-3.5" />
            <span className="hidden sm:inline">Modifier</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs text-red-600 hover:bg-red-50"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-3.5" />
            <span className="hidden sm:inline">Supprimer</span>
          </Button>
        </div>
      </div>

      {/* En-tête identité */}
      <div className="shrink-0 border-b border-gray-200 bg-white">
        <div
          className={cn(
            "h-1 w-full",
            etudiant.statut === "Actif" ? "bg-blue-500" : "bg-gray-400"
          )}
        />
        <div className="px-3 py-3 sm:px-4 lg:px-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-bold text-white shadow-md shadow-blue-500/20">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                  {etudiant.prenom} {etudiant.nom}
                </h1>
                <StatusBadge
                  label={etudiant.statut}
                  className={
                    etudiant.statut === "Actif"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                  }
                />
              </div>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Hash className="size-3" />
                  {etudiant.matricule}
                </span>
                <span className="text-gray-300">·</span>
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="size-3" />
                  {etudiant.filiere} — {etudiant.classe}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 sm:p-4 lg:grid-cols-12 lg:gap-4 lg:p-5">
        {/* Colonne gauche — informations */}
        <div className="flex flex-col gap-3 lg:col-span-4 lg:gap-4">
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5 sm:px-4">
              <CircleDot className="size-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-900">Informations</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 p-3 sm:p-4">
              <InfoCard icon={Mail} label="Email">
                {etudiant.email}
              </InfoCard>
              <InfoCard icon={Hash} label="Matricule">
                {etudiant.matricule}
              </InfoCard>
              <InfoCard icon={BookOpen} label="Filière">
                {etudiant.filiere}
              </InfoCard>
              <InfoCard icon={School} label="Classe">
                {etudiant.classe}
              </InfoCard>
              <InfoCard icon={TrendingUp} label="Moyenne">
                <span className={cn("font-bold", moyenneColor(etudiant.moyenne))}>
                  {etudiant.moyenne.toFixed(1)}/20
                </span>
              </InfoCard>
              <InfoCard icon={CalendarCheck} label="Assiduité">
                {etudiant.assiduite}%
              </InfoCard>
            </div>
          </section>
        </div>

        {/* Colonne droite — notes & absences récentes */}
        <div className="flex flex-col gap-3 lg:col-span-8 lg:gap-4">
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5 sm:px-4">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-blue-500" />
                <h2 className="text-sm font-semibold text-gray-900">Notes récentes</h2>
              </div>
              <span className="text-[11px] text-gray-400">{mesNotes.length} note{mesNotes.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {mesNotes.slice(0, 8).map((n) => (
                <div key={n.id} className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{n.matiere}</p>
                    <p className="text-[11px] text-gray-400">{n.classe} · {n.periode}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-bold",
                      moyenneColor(noteSur20(n.note, n.sur))
                    )}
                  >
                    {n.note !== null ? `${n.note}/${n.sur}` : "—"}
                  </span>
                </div>
              ))}
              {mesNotes.length === 0 && (
                <p className="px-3 py-4 text-center text-xs text-gray-400 sm:px-4">
                  Aucune note enregistrée.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5 sm:px-4">
              <div className="flex items-center gap-2">
                <CalendarX2 className="size-4 text-blue-500" />
                <h2 className="text-sm font-semibold text-gray-900">Absences récentes</h2>
              </div>
              <span className="text-[11px] text-gray-400">{mesAbsences.length} absence{mesAbsences.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {mesAbsences.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{a.matiere}</p>
                    <p className="text-[11px] text-gray-400">{a.classe} · {a.date}</p>
                  </div>
                  <StatusBadge
                    label={a.justifiee ? "Justifiée" : "Non justifiée"}
                    className={
                      a.justifiee
                        ? "bg-blue-50 text-blue-700"
                        : "bg-red-50 text-red-600"
                    }
                  />
                </div>
              ))}
              {mesAbsences.length === 0 && (
                <p className="px-3 py-4 text-center text-xs text-gray-400 sm:px-4">
                  Aucune absence enregistrée.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      <EtudiantFormModal
        open={formOpen}
        etudiant={etudiant}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
      <EtudiantDeleteDialog
        open={deleteOpen}
        etudiant={etudiant}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
