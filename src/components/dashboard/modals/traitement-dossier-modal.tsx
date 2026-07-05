"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/lib/view-store";
import { useDataStore } from "@/lib/data-store";
import { useToast } from "@/hooks/use-toast";

const actionConfig = {
  valider: {
    title: "Valider le dossier",
    icon: CheckCircle2,
    color: "text-emerald-500",
    btnClass: "bg-emerald-500 text-white hover:bg-emerald-600",
    verb: "validé",
  },
  rejeter: {
    title: "Rejeter le dossier",
    icon: XCircle,
    color: "text-red-500",
    btnClass: "bg-red-500 text-white hover:bg-red-600",
    verb: "rejeté",
  },
  incomplet: {
    title: "Marquer le dossier incomplet",
    icon: AlertCircle,
    color: "text-orange-500",
    btnClass: "bg-orange-500 text-white hover:bg-orange-600",
    verb: "marqué incomplet",
  },
} as const;

export function TraitementDossierModal() {
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const closeDossier = useAppStore((s) => s.closeDossier);
  const traiterDossier = useDataStore((s) => s.traiterDossier);
  const candidatures = useDataStore((s) => s.candidatures);
  const { toast } = useToast();

  const action =
    modal.type === "traitement-dossier" ? modal.action : "valider";
  const dossierId =
    modal.type === "traitement-dossier" ? modal.dossierId : "";
  const dossier = candidatures.find((c) => c.id === dossierId);

  const open = modal.type === "traitement-dossier";

  const [motif, setMotif] = useState("");
  const [missing, setMissing] = useState<string[]>([]);

  const cfg = actionConfig[action];
  const Icon = cfg.icon;

  function togglePiece(nom: string) {
    setMissing((prev) =>
      prev.includes(nom) ? prev.filter((p) => p !== nom) : [...prev, nom]
    );
  }

  function reset() {
    setMotif("");
    setMissing([]);
  }

  function handleSubmit() {
    if (action === "rejeter" && !motif.trim()) {
      toast({
        title: "Motif requis",
        description: "Veuillez indiquer un motif de rejet.",
        variant: "destructive",
      });
      return;
    }
    if (action === "incomplet" && missing.length === 0) {
      toast({
        title: "Pièces manquantes",
        description: "Sélectionnez au moins une pièce manquante.",
        variant: "destructive",
      });
      return;
    }

    // Applique réellement le changement dans le store
    traiterDossier(dossierId, action, {
      motif: motif.trim() || undefined,
      piecesManquantes: missing.length > 0 ? missing : undefined,
    });

    toast({
      title: "Dossier traité",
      description: `Le dossier ${dossierId} a été ${cfg.verb}. Notification envoyée via n8n.`,
    });
    reset();
    closeModal();
    // Retour à la liste des candidatures (ferme la page détail si ouverte)
    closeDossier();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          closeModal();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`size-5 ${cfg.color}`} />
            {cfg.title}
          </DialogTitle>
          <DialogDescription>
            {dossier && (
              <>
                Candidat :{" "}
                <span className="font-medium text-gray-700">
                  {dossier.prenom} {dossier.nom}
                </span>{" "}
                ({dossier.id})
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {action === "rejeter" && (
            <div className="space-y-2">
              <Label htmlFor="motif">
                Motif du rejet <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="motif"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Indiquez le motif du rejet (visible par le candidat)…"
                rows={3}
              />
            </div>
          )}

          {action === "incomplet" && (
            <div className="space-y-2">
              <Label>Pièces manquantes</Label>
              <p className="text-xs text-gray-400">
                Sélectionnez les pièces à demander au candidat.
              </p>
              <div className="space-y-2 rounded-lg border border-gray-100 p-3">
                {dossier?.pieces.map((piece, idx) => (
                  <label
                    key={idx}
                    className="flex cursor-pointer items-center gap-3 rounded-md p-1.5 hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={missing.includes(piece.nom)}
                      onCheckedChange={() => togglePiece(piece.nom)}
                    />
                    <span className="text-sm text-gray-700">{piece.nom}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {action === "valider" && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4 text-sm text-gray-700">
              Vous êtes sur le point de <strong>valider</strong> ce dossier. Le
              candidat sera automatiquement notifié par email (via n8n) et son
              rôle passera de <code>candidat</code> à <code>étudiant</code>.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>
            Annuler
          </Button>
          <Button className={cfg.btnClass} onClick={handleSubmit}>
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
