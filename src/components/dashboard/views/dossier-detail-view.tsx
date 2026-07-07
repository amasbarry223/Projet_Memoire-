"use client";

import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BrainCircuit,
  GraduationCap,
  Hash,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/view-store";
import { type Candidature } from "@/components/dashboard/data";
import { useToast } from "@/hooks/use-toast";

function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-100 bg-white px-2.5 py-2">
      <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", color)}>
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] leading-none text-gray-400">{label}</p>
        <p className="mt-0.5 truncate text-xs font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5">
      <Icon className={cn("mt-0.5 size-3.5 shrink-0", iconColor)} />
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function statutBadgeClass(statut: string) {
  switch (statut) {
    case "Validé":
      return "bg-blue-50 text-blue-800 border-blue-200";
    case "En attente":
      return "bg-yellow-50 text-yellow-800 border-yellow-200";
    case "Incomplet":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Rejeté":
      return "bg-red-50 text-red-600 border-red-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function statutAccent(statut: string) {
  switch (statut) {
    case "Validé":
      return "bg-blue-500";
    case "En attente":
      return "bg-yellow-500";
    case "Incomplet":
      return "bg-orange-500";
    case "Rejeté":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

export function DossierDetailView({ dossier }: { dossier: Candidature }) {
  const closeDossier = useAppStore((s) => s.closeDossier);
  const setView = useAppStore((s) => s.setView);
  const openModal = useAppStore((s) => s.openModal);
  const { toast } = useToast();

  function handleAction(action: "valider" | "rejeter" | "incomplet") {
    openModal({ type: "traitement-dossier", dossierId: dossier.id, action });
  }

  function handleBack() {
    closeDossier();
    setView("candidatures");
  }

  function handleDownload(piece: string) {
    toast({
      title: "Téléchargement",
      description: `${piece} — URL signée générée (durée 15 min).`,
    });
  }

  const piecesPresentes = dossier.pieces.filter((p) => p.present).length;
  const piecesManquantes = dossier.pieces.length - piecesPresentes;

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
            <span className="hidden sm:inline">Candidatures</span>
          </button>
          <ChevronRight className="size-3.5 shrink-0 text-gray-300" />
          <span className="truncate font-mono text-xs font-medium text-gray-500 sm:text-sm">
            {dossier.id}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-orange-200 px-2.5 text-xs text-orange-600 hover:bg-orange-50"
            onClick={() => handleAction("incomplet")}
          >
            <AlertCircle className="size-3.5" />
            <span className="hidden sm:inline">Incomplet</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-red-200 px-2.5 text-xs text-red-600 hover:bg-red-50"
            onClick={() => handleAction("rejeter")}
          >
            <XCircle className="size-3.5" />
            <span className="hidden sm:inline">Rejeter</span>
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 bg-blue-500 px-2.5 text-xs text-white hover:bg-blue-700"
            onClick={() => handleAction("valider")}
          >
            <CheckCircle2 className="size-3.5" />
            Valider
          </Button>
        </div>
      </div>

      {/* En-tête identité — pleine largeur */}
      <div className="shrink-0 border-b border-gray-200 bg-white">
        <div className={cn("h-1 w-full", statutAccent(dossier.statut))} />
        <div className="px-3 py-3 sm:px-4 lg:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-bold text-white shadow-md shadow-blue-500/20">
                {dossier.prenom.charAt(0)}
                {dossier.nom.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                    {dossier.prenom} {dossier.nom}
                  </h1>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                      statutBadgeClass(dossier.statut)
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full", statutAccent(dossier.statut))} />
                    {dossier.statut}
                  </span>
                </div>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Hash className="size-3" />
                    {dossier.id}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3" />
                    {dossier.dateSoumission}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="size-3" />
                    {dossier.filiere} — {dossier.niveau}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:max-w-xl xl:flex-1">
              <StatPill
                icon={GraduationCap}
                label="Filière"
                value={dossier.filiere}
                color="bg-blue-50 text-blue-500"
              />
              <StatPill
                icon={FileText}
                label="Niveau"
                value={dossier.niveau}
                color="bg-yellow-50 text-yellow-600"
              />
              <StatPill
                icon={CheckCircle2}
                label="Pièces"
                value={`${piecesPresentes}/${dossier.pieces.length}`}
                color="bg-blue-50 text-blue-500"
              />
              <StatPill
                icon={BrainCircuit}
                label="Complétude"
                value={`${dossier.completude}%`}
                color={
                  dossier.completude === 100
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-yellow-50 text-yellow-600"
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal — grille pleine largeur */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 sm:p-4 lg:grid-cols-12 lg:gap-4 lg:p-5">
        {/* Colonne gauche */}
        <div className="flex flex-col gap-3 lg:col-span-8 lg:gap-4">
          {/* Informations personnelles */}
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5 sm:px-4">
              <User className="size-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-900">Informations personnelles</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
              <InfoCard icon={User} label="Prénom" value={dossier.prenom} iconColor="text-gray-400" />
              <InfoCard icon={User} label="Nom" value={dossier.nom} iconColor="text-gray-400" />
              <InfoCard icon={Calendar} label="Naissance" value={dossier.dateNaissance} iconColor="text-gray-400" />
              <InfoCard icon={Phone} label="Téléphone" value={dossier.telephone} iconColor="text-gray-400" />
              <InfoCard icon={Mail} label="Email" value={dossier.email} iconColor="text-gray-400" />
              <InfoCard icon={MapPin} label="Adresse" value={dossier.adresse} iconColor="text-gray-400" />
            </div>
          </section>

          {/* Pièces justificatives */}
          <section className="flex-1 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5 sm:px-4">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-blue-500" />
                <h2 className="text-sm font-semibold text-gray-900">Pièces justificatives</h2>
              </div>
              <span className="text-[11px] text-gray-400">
                {piecesPresentes}/{dossier.pieces.length}
                {piecesManquantes > 0 && (
                  <span className="text-red-500"> · {piecesManquantes} manquante{piecesManquantes > 1 ? "s" : ""}</span>
                )}
              </span>
            </div>
            <ul className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-2">
              {dossier.pieces.map((piece, idx) => (
                <li
                  key={idx}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition",
                    piece.present
                      ? "border-gray-100 hover:border-blue-200 hover:bg-blue-50/40"
                      : "border-red-100 bg-red-50/40"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-md",
                      piece.present ? "bg-blue-50 text-blue-500" : "bg-red-50 text-red-500"
                    )}
                  >
                    {piece.present ? (
                      <FileText className="size-3.5" />
                    ) : (
                      <AlertCircle className="size-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{piece.nom}</p>
                    <p className="text-[11px] text-gray-400">
                      {piece.present ? `${piece.type} · ${piece.taille}` : "Pièce manquante"}
                    </p>
                  </div>
                  {piece.present ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 text-gray-400 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => handleDownload(piece.nom)}
                      aria-label={`Télécharger ${piece.nom}`}
                    >
                      <Download className="size-3.5" />
                    </Button>
                  ) : (
                    <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
                      MANQUANT
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-3 lg:col-span-4 lg:gap-4">
          {/* Synthèse IA */}
          <section className="overflow-hidden rounded-xl border border-yellow-200 bg-white">
            <div className="flex items-center gap-2 border-b border-yellow-100 bg-yellow-50/80 px-3 py-2.5 sm:px-4">
              <BrainCircuit className="size-4 text-yellow-700" />
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-gray-900">Synthèse IA</h2>
                <p className="text-[10px] text-gray-400">Analyse automatique · Claude</p>
              </div>
            </div>
            <div className="p-3 sm:p-4">
              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-500">Complétude</span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      dossier.completude === 100 ? "text-blue-700" : "text-yellow-700"
                    )}
                  >
                    {dossier.completude}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      dossier.completude === 100 ? "bg-blue-500" : "bg-yellow-500"
                    )}
                    style={{ width: `${dossier.completude}%` }}
                  />
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-700">{dossier.syntheseIA}</p>
            </div>
          </section>

          {/* Historique */}
          <section className="flex-1 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5 sm:px-4">
              <Clock className="size-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Historique</h2>
            </div>
            <ol className="space-y-3 p-3 sm:p-4">
              {dossier.historique.map((h, idx) => (
                <li key={idx} className="relative flex gap-3">
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      idx === dossier.historique.length - 1 ? "bg-blue-500 ring-4 ring-blue-100" : "bg-gray-300"
                    )}
                  />
                  <div className="min-w-0 flex-1 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-gray-900">{h.action}</p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {h.date} · {h.auteur}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
