"use client";

import {
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  User,
  BrainCircuit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/view-store";
import { candidatures, type Candidature } from "@/components/dashboard/data";
import { StatusBadge, statutBadge } from "../views/shared";
import { useToast } from "@/hooks/use-toast";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

export function DossierDetailModal() {
  const modal = useAppStore((s) => s.modal);
  const openModal = useAppStore((s) => s.openModal);
  const closeModal = useAppStore((s) => s.closeModal);
  const { toast } = useToast();

  const dossierId = modal.type === "dossier-detail" ? modal.dossierId : "";
  const dossier: Candidature | undefined = candidatures.find(
    (c) => c.id === dossierId
  );

  const open = modal.type === "dossier-detail";

  function handleAction(action: "valider" | "rejeter" | "incomplet") {
    if (!dossier) return;
    openModal({ type: "traitement-dossier", dossierId: dossier.id, action });
  }

  function handleDownload(piece: string) {
    toast({
      title: "Téléchargement",
      description: `${piece} — URL signée générée (durée 15 min).`,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeModal()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-8">
            <div>
              <DialogTitle className="text-xl">
                Dossier {dossier?.id}
              </DialogTitle>
              <DialogDescription>
                Soumis le {dossier?.dateSoumission}
              </DialogDescription>
            </div>
            {dossier && (
              <StatusBadge
                label={dossier.statut}
                className={statutBadge(dossier.statut)}
              />
            )}
          </div>
        </DialogHeader>

        {dossier && (
          <div className="space-y-5">
            {/* Informations personnelles */}
            <section>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <User className="size-4 text-emerald-500" />
                Informations personnelles
              </h4>
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 sm:grid-cols-3">
                <InfoRow label="Prénom" value={dossier.prenom} />
                <InfoRow label="Nom" value={dossier.nom} />
                <InfoRow label="Date de naissance" value={dossier.dateNaissance} />
                <InfoRow label="Email" value={dossier.email} />
                <InfoRow label="Téléphone" value={dossier.telephone} />
                <InfoRow label="Adresse" value={dossier.adresse} />
              </div>
            </section>

            {/* Formation visée */}
            <section>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <FileText className="size-4 text-emerald-500" />
                Formation visée
              </h4>
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <InfoRow label="Filière" value={dossier.filiere} />
                <InfoRow label="Niveau" value={dossier.niveau} />
              </div>
            </section>

            {/* Synthèse IA */}
            <section>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <BrainCircuit className="size-4 text-amber-500" />
                Synthèse d&apos;analyse IA
              </h4>
              <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    Complétude du dossier
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    {dossier.completude}%
                  </span>
                </div>
                <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${dossier.completude}%` }}
                  />
                </div>
                <p className="text-sm text-gray-700">{dossier.syntheseIA}</p>
              </div>
            </section>

            {/* Pièces justificatives */}
            <section>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">
                Pièces justificatives
              </h4>
              <ul className="space-y-2">
                {dossier.pieces.map((piece, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                  >
                    <div
                      className={`flex size-9 items-center justify-center rounded-lg ${
                        piece.present
                          ? "bg-emerald-50 text-emerald-500"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {piece.present ? (
                        <FileText className="size-4" />
                      ) : (
                        <AlertCircle className="size-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
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
                        size="sm"
                        onClick={() => handleDownload(piece.nom)}
                      >
                        <Download className="size-4" />
                      </Button>
                    ) : (
                      <span className="text-xs font-medium text-red-500">
                        Manquant
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            {/* Historique */}
            <section>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Clock className="size-4 text-gray-400" />
                Historique des actions
              </h4>
              <ul className="space-y-2">
                {dossier.historique.map((h, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500" />
                    <div>
                      <span className="font-medium text-gray-900">
                        {h.action}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        {h.date} · {h.auteur}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
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
            className="gap-2 bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={() => handleAction("valider")}
          >
            <CheckCircle2 className="size-4" />
            Valider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
