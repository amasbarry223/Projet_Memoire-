"use client";

import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/view-store";
import { alertesIAComplete } from "@/components/dashboard/data";
import { StatusBadge, niveauBadge } from "../views/shared";
import { useToast } from "@/hooks/use-toast";

export function AlerteModal() {
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const { toast } = useToast();

  const alerteId = modal.type === "alerte" ? modal.alerteId : "";
  const alerte = alertesIAComplete.find((a) => a.id === alerteId);
  const open = modal.type === "alerte";

  const [nouveauStatut, setNouveauStatut] = useState("Prise en charge");
  const [commentaire, setCommentaire] = useState("");

  function handleSubmit() {
    toast({
      title: "Alerte traitée",
      description: `Alerte ${alerteId} — statut mis à jour « ${nouveauStatut} ». Journalisé dans l'audit.`,
    });
    setCommentaire("");
    closeModal();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="size-5 text-amber-500" />
            Traiter l&apos;alerte IA
          </DialogTitle>
          <DialogDescription>
            {alerte?.id} · {alerte?.etudiant}
          </DialogDescription>
        </DialogHeader>

        {alerte && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {alerte.etudiant}
                </span>
                <StatusBadge
                  label={alerte.niveau}
                  className={niveauBadge(alerte.niveau)}
                />
              </div>
              <p className="text-xs text-gray-500">
                {alerte.classe} · {alerte.date}
              </p>
              <p className="text-sm text-gray-700">{alerte.motif}</p>
            </div>

            <div className="space-y-2">
              <Label>Nouveau statut</Label>
              <Select
                value={nouveauStatut}
                onValueChange={setNouveauStatut}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prise en charge">
                    Prise en charge
                  </SelectItem>
                  <SelectItem value="Clôturée">Clôturée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commentaire">Commentaire / action menée</Label>
              <Textarea
                id="commentaire"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Décrivez l'action pédagogique mise en place…"
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>
            Annuler
          </Button>
          <Button
            className="bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={handleSubmit}
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
