"use client";

import { useState } from "react";
import { ClipboardEdit } from "lucide-react";
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

export function NoteModal() {
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const addNote = useDataStore((s) => s.addNote);
  const etudiants = useDataStore((s) => s.etudiants);
  const filieres = useDataStore((s) => s.filieres);
  const { toast } = useToast();

  const open = modal.type === "note";
  const presetEtudiantId =
    modal.type === "note" ? modal.etudiant : undefined;

  const [etudiantId, setEtudiantId] = useState(
    presetEtudiantId ??
      etudiants[0]?.id ??
      ""
  );
  const [filiereId, setFiliereId] = useState(filieres[0]?.id ?? "");
  const [matiere, setMatiere] = useState(filieres[0]?.matieres[0]?.nom ?? "");
  const [note, setNote] = useState("");
  const [sur, setSur] = useState("20");
  const [periode, setPeriode] = useState("Semestre 1");

  const filiereCourante =
    filieres.find((f) => f.id === filiereId) ?? filieres[0];
  const etudiantCourant = etudiants.find((e) => e.id === etudiantId);

  function handleSubmit() {
    const noteNum = parseFloat(note);
    const surNum = parseFloat(sur);
    if (isNaN(noteNum) || isNaN(surNum) || noteNum < 0 || noteNum > surNum) {
      toast({
        title: "Note invalide",
        description: `La note doit être comprise entre 0 et ${sur}.`,
        variant: "destructive",
      });
      return;
    }
    if (!etudiantCourant || !filiereCourante) {
      toast({
        title: "Données manquantes",
        description: "Sélectionnez un étudiant et une matière.",
        variant: "destructive",
      });
      return;
    }

    addNote({
      etudiant: `${etudiantCourant.prenom} ${etudiantCourant.nom}`,
      matiere,
      classe: etudiantCourant.classe,
      note: noteNum,
      sur: surNum,
      coefficient:
        filiereCourante.matieres.find((m) => m.nom === matiere)?.coefficient ?? 1,
      periode,
    });

    toast({
      title: "Note enregistrée",
      description: `${etudiantCourant.prenom} ${etudiantCourant.nom} — ${matiere} : ${noteNum}/${surNum}. Visible par l'étudiant et le responsable.`,
    });
    setNote("");
    closeModal();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardEdit className="size-5 text-emerald-500" />
            Saisir une note
          </DialogTitle>
          <DialogDescription>
            Saisie pour une matière affectée. Visible immédiatement par
            l&apos;étudiant et le responsable (CA4).
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
                {etudiants.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.prenom} {e.nom} — {e.classe}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Filière</Label>
              <Select
                value={filiereId}
                onValueChange={(v) => {
                  setFiliereId(v);
                  const f = filieres.find((x) => x.id === v);
                  if (f) setMatiere(f.matieres[0]?.nom ?? "");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filieres.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Matière</Label>
              <Select value={matiere} onValueChange={setMatiere}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filiereCourante?.matieres.map((m) => (
                    <SelectItem key={m.id} value={m.nom}>
                      {m.nom} (coef. {m.coefficient})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Input
                id="note"
                type="number"
                step="0.25"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="12.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sur">Sur</Label>
              <Input
                id="sur"
                type="number"
                value={sur}
                onChange={(e) => setSur(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Période</Label>
              <Select value={periode} onValueChange={setPeriode}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semestre 1">Semestre 1</SelectItem>
                  <SelectItem value="Semestre 2">Semestre 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>
            Annuler
          </Button>
          <Button
            className="bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={handleSubmit}
          >
            Enregistrer la note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
