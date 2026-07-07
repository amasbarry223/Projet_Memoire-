"use client";

import { useState } from "react";
import { CalendarX2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/view-store";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";

export function AbsenceModal() {
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const addAbsence = useDataStore((s) => s.addAbsence);
  const updateAbsence = useDataStore((s) => s.updateAbsence);
  const absences = useDataStore((s) => s.absences);
  const etudiants = useDataStore((s) => s.etudiants);
  const filieres = useDataStore((s) => s.filieres);
  const enseignants = useDataStore((s) => s.enseignants);
  const session = useAuthStore((s) => s.session);
  const { toast } = useToast();

  const open = modal.type === "absence";
  const editId = modal.type === "absence" ? modal.editId : undefined;
  const editingAbsence = editId ? absences.find((a) => a.id === editId) : undefined;
  const isEdit = Boolean(editId && editingAbsence);
  const presetEtudiantId = modal.type === "absence" ? modal.etudiant : undefined;

  const monEnseignant =
    session?.role === "enseignant"
      ? enseignants.find((e) => e.nom === session.nom && e.prenom === session.prenom)
      : undefined;

  const etudiantsScope = monEnseignant
    ? etudiants.filter((e) => monEnseignant.classes.includes(e.classe))
    : etudiants;

  const matieresScope = monEnseignant
    ? [...new Set(monEnseignant.matieres)]
    : filieres.flatMap((f) => f.matieres.map((m) => m.nom));

  const presetInScope =
    presetEtudiantId !== undefined &&
    etudiantsScope.some((e) => e.id === presetEtudiantId);

  // En édition, on résout l'étudiant/la date depuis l'absence ciblée. Le
  // <DialogContent key={...}> plus bas force un remount (donc une
  // réinitialisation propre de ces useState) à chaque changement de cible,
  // au lieu de resynchroniser via un effet.
  const editingEtudiant = editingAbsence
    ? etudiants.find((e) => `${e.prenom} ${e.nom}` === editingAbsence.etudiant)
    : undefined;
  const editingDateIso = editingAbsence
    ? editingAbsence.date.includes("/")
      ? editingAbsence.date.split("/").reverse().join("-")
      : editingAbsence.date
    : undefined;

  const [etudiantId, setEtudiantId] = useState(
    editingEtudiant?.id ??
      (presetInScope ? presetEtudiantId : undefined) ??
      etudiantsScope[0]?.id ??
      ""
  );
  const [matiere, setMatiere] = useState(editingAbsence?.matiere ?? matieresScope[0] ?? "");
  const [date, setDate] = useState(
    editingDateIso && editingDateIso.length === 10
      ? editingDateIso
      : new Date().toISOString().slice(0, 10)
  );
  const [justifiee, setJustifiee] = useState(editingAbsence?.justifiee ?? false);

  const etudiantCourant = etudiantsScope.find((e) => e.id === etudiantId);

  async function handleSubmit() {
    if (!etudiantCourant) {
      toast({
        title: "Données manquantes",
        description: "Sélectionnez un étudiant.",
        variant: "destructive",
      });
      return;
    }
    if (!matiere.trim()) {
      toast({
        title: "Champ requis",
        description: "La matière est obligatoire.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEdit && editId) {
        await updateAbsence(editId, {
          matiere: matiere.trim(),
          date,
          justifiee,
          classe: etudiantCourant.classe,
        });
        toast({ title: "Absence modifiée", description: `${matiere} le ${date}.` });
      } else {
        await addAbsence({
          etudiant: `${etudiantCourant.prenom} ${etudiantCourant.nom}`,
          classe: etudiantCourant.classe,
          matiere: matiere.trim(),
          date,
          justifiee,
        });
        toast({
          title: "Absence enregistrée",
          description: `${etudiantCourant.prenom} ${etudiantCourant.nom} — ${matiere} le ${date}.`,
        });
      }
      closeModal();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Échec",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeModal()}>
      <DialogContent key={editId ?? "new"} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarX2 className="size-5 text-blue-500" />
            {isEdit ? "Modifier l'absence" : "Enregistrer une absence"}
          </DialogTitle>
          <DialogDescription>
            Saisie par l&apos;enseignant — visible par le responsable et l&apos;étudiant (F4.3).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Étudiant</Label>
            <Select value={etudiantId} onValueChange={setEtudiantId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {etudiantsScope.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.prenom} {e.nom} — {e.classe}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Matière</Label>
              <Select value={matiere} onValueChange={setMatiere}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {matieresScope.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="abs-date">Date</Label>
              <Input
                id="abs-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Absence justifiée</p>
              <p className="text-xs text-gray-400">Pièce justificative fournie</p>
            </div>
            <Switch checked={justifiee} onCheckedChange={setJustifiee} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>
            Annuler
          </Button>
          <Button
            className="bg-blue-500 text-white hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
