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
import { Input } from "@/components/ui/input";
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
import { useDataStore } from "@/lib/data-store";
import { useToast } from "@/hooks/use-toast";

export function AlerteFormModal() {
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const addAlerte = useDataStore((s) => s.addAlerte);
  const etudiants = useDataStore((s) => s.etudiants);
  const { toast } = useToast();

  const open = modal.type === "alerte-form";
  const [etudiantId, setEtudiantId] = useState(etudiants[0]?.id ?? "");
  const [niveau, setNiveau] = useState<"Faible" | "Moyen" | "Élevé">("Moyen");
  const [motif, setMotif] = useState("");
  const [loading, setLoading] = useState(false);

  const etudiant = etudiants.find((e) => e.id === etudiantId);

  async function handleSubmit() {
    if (!etudiant || !motif.trim()) {
      toast({
        title: "Champs requis",
        description: "Sélectionnez un étudiant et saisissez un motif.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await addAlerte({
        etudiant: `${etudiant.prenom} ${etudiant.nom}`,
        classe: etudiant.classe,
        niveau,
        motif: motif.trim(),
        statut: "Nouvelle",
      });
      toast({ title: "Alerte créée", description: `Alerte pour ${etudiant.prenom} ${etudiant.nom}.` });
      closeModal();
      setMotif("");
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Échec",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="size-5 text-blue-500" />
            Nouvelle alerte
          </DialogTitle>
          <DialogDescription>
            Créez une alerte pédagogique manuelle pour un étudiant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Étudiant</Label>
            <Select value={etudiantId} onValueChange={setEtudiantId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {etudiants.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.prenom} {e.nom} — {e.classe}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Niveau</Label>
            <Select value={niveau} onValueChange={(v) => setNiveau(v as typeof niveau)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Faible">Faible</SelectItem>
                <SelectItem value="Moyen">Moyen</SelectItem>
                <SelectItem value="Élevé">Élevé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Motif</Label>
            <Textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={3}
              placeholder="Décrivez la situation à risque…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeModal} disabled={loading}>
            Annuler
          </Button>
          <Button
            className="bg-blue-500 text-white hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            Créer l&apos;alerte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
