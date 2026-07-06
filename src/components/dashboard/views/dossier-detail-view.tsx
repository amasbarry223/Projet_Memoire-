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
import { useAppStore } from "@/lib/view-store";
import { useDataStore } from "@/lib/data-store";
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
    <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white px-3 py-2">
      <div className={`flex size-8 items-center justify-center rounded-md ${color}`}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] leading-none text-gray-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
          {value}
        </p>
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
    <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
        <Icon className={`size-4 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium text-gray-900">
          {value}
        </p>
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

function statutDot(statut: string) {
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
    <div className="space-y-6">
      {/* ─── Barre de navigation supérieure ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
            Candidatures
          </button>
          <ChevronRight className="size-4 text-gray-300" />
          <span className="font-mono text-gray-400">{dossier.id}</span>
        </div>
      </div>

      {/* ─── En-tête du dossier ─── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Bandeau coloré selon le statut */}
        <div className="relative h-1.5 w-full">
          <div
            className={`h-full w-full ${
              dossier.statut === "Validé"
                ? "bg-blue-500"
                : dossier.statut === "En attente"
                  ? "bg-yellow-500"
                  : dossier.statut === "Incomplet"
                    ? "bg-orange-500"
                    : "bg-red-500"
            }`}
          />
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            {/* Identité */}
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-xl font-bold text-white shadow-lg shadow-blue-500/20">
                {dossier.prenom.charAt(0)}
                {dossier.nom.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {dossier.prenom} {dossier.nom}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statutBadgeClass(dossier.statut)}`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${statutDot(dossier.statut)}`}
                    />
                    {dossier.statut}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <Hash className="size-3.5" />
                  <span className="font-mono">{dossier.id}</span>
                  <span className="text-gray-300">·</span>
                  <Calendar className="size-3.5" />
                  Soumis le {dossier.dateSoumission}
                </p>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                onClick={() => handleAction("incomplet")}
              >
                <AlertCircle className="size-4" />
                Marquer incomplet
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => handleAction("rejeter")}
              >
                <XCircle className="size-4" />
                Rejeter
              </Button>
              <Button
                className="gap-2 bg-blue-500 text-white hover:bg-blue-700"
                onClick={() => handleAction("valider")}
              >
                <CheckCircle2 className="size-4" />
                Valider
              </Button>
            </div>
          </div>

          {/* Stats pills */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <StatPill
              icon={GraduationCap}
              label="Filière visée"
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
              label="Pièces fournies"
              value={`${piecesPresentes}/${dossier.pieces.length}`}
              color="bg-blue-50 text-blue-500"
            />
            <StatPill
              icon={BrainCircuit}
              label="Complétude IA"
              value={`${dossier.completude}%`}
              color={
                dossier.completude === 100
                  ? "bg-blue-50 text-blue-500"
                  : "bg-yellow-50 text-yellow-600"
              }
            />
          </div>
        </div>
      </div>

      {/* ─── Grille principale 2 colonnes ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne gauche : infos + formation (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Informations personnelles */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50">
                <User className="size-4 text-blue-500" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">
                Informations personnelles
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoCard
                icon={User}
                label="Prénom"
                value={dossier.prenom}
                iconColor="text-gray-400"
              />
              <InfoCard
                icon={User}
                label="Nom"
                value={dossier.nom}
                iconColor="text-gray-400"
              />
              <InfoCard
                icon={Calendar}
                label="Date de naissance"
                value={dossier.dateNaissance}
                iconColor="text-gray-400"
              />
              <InfoCard
                icon={Phone}
                label="Téléphone"
                value={dossier.telephone}
                iconColor="text-gray-400"
              />
              <InfoCard
                icon={Mail}
                label="Email"
                value={dossier.email}
                iconColor="text-gray-400"
              />
              <InfoCard
                icon={MapPin}
                label="Adresse"
                value={dossier.adresse}
                iconColor="text-gray-400"
              />
            </div>
          </section>

          {/* Pièces justificatives */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50">
                  <FileText className="size-4 text-blue-500" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">
                  Pièces justificatives
                </h2>
              </div>
              <span className="text-xs text-gray-400">
                {piecesPresentes} présente{piecesPresentes > 1 ? "s" : ""}
                {piecesManquantes > 0 && (
                  <span className="text-red-500">
                    {" "}
                    · {piecesManquantes} manquante
                    {piecesManquantes > 1 ? "s" : ""}
                  </span>
                )}
              </span>
            </div>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {dossier.pieces.map((piece, idx) => (
                <li
                  key={idx}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition ${
                    piece.present
                      ? "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
                      : "border-red-100 bg-red-50/30"
                  }`}
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                      piece.present
                        ? "bg-blue-50 text-blue-500"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {piece.present ? (
                      <FileText className="size-4" />
                    ) : (
                      <AlertCircle className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {piece.nom}
                    </p>
                    <p className="text-xs text-gray-400">
                      {piece.present
                        ? `${piece.type} · ${piece.taille}`
                        : "Pièce manquante"}
                    </p>
                  </div>
                  {piece.present ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-gray-400 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => handleDownload(piece.nom)}
                      aria-label={`Télécharger ${piece.nom}`}
                    >
                      <Download className="size-4" />
                    </Button>
                  ) : (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                      MANQUANT
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Colonne droite : synthèse IA + historique (1/3) */}
        <div className="space-y-6">
          {/* Synthèse IA */}
          <section className="overflow-hidden rounded-2xl border border-yellow-100 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-yellow-100 bg-yellow-50/60 px-5 py-3.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-yellow-100">
                <BrainCircuit className="size-4 text-yellow-700" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Synthèse d&apos;analyse IA
                </h2>
                <p className="text-[11px] text-gray-400">
                  Généré automatiquement par Claude
                </p>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    Complétude du dossier
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      dossier.completude === 100
                        ? "text-blue-700"
                        : "text-yellow-700"
                    }`}
                  >
                    {dossier.completude}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      dossier.completude === 100
                        ? "bg-blue-500"
                        : "bg-yellow-500"
                    }`}
                    style={{ width: `${dossier.completude}%` }}
                  />
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-700">
                {dossier.syntheseIA}
              </p>
            </div>
          </section>

          {/* Historique / Timeline */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gray-100">
                <Clock className="size-4 text-gray-500" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">
                Historique des actions
              </h2>
            </div>
            <ol className="relative space-y-4 border-l border-gray-200 pl-4">
              {dossier.historique.map((h, idx) => (
                <li key={idx} className="relative">
                  {/* Point timeline */}
                  <span
                    className={`absolute -left-[21px] top-1 size-2.5 rounded-full ring-4 ring-white ${
                      idx === dossier.historique.length - 1
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <p className="text-sm font-medium text-gray-900">{h.action}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {h.date} · {h.auteur}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
