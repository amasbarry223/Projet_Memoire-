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
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";

export function NoteModal() {
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const addNote = useDataStore((s) => s.addNote);
  const updateNote = useDataStore((s) => s.updateNote);
  const notes = useDataStore((s) => s.notes);
  const etudiants = useDataStore((s) => s.etudiants);
  const filieres = useDataStore((s) => s.filieres);
  const enseignants = useDataStore((s) => s.enseignants);
  const session = useAuthStore((s) => s.session);
  const { toast } = useToast();

  const open = modal.type === "note";
  const editId = modal.type === "note" ? modal.editId : undefined;
  const editingNote = editId ? notes.find((n) => n.id === editId) : undefined;
  const isEdit = Boolean(editId && editingNote);
  const presetEtudiantId =
    modal.type === "note" ? modal.etudiant : undefined;

  // Un enseignant ne doit pouvoir saisir des notes que pour ses propres
  // classes et matières (F4.1) — on restreint les listes en conséquence.
  const monEnseignant =
    session?.role === "enseignant"
      ? enseignants.find(
          (e) => e.nom === session.nom && e.prenom === session.prenom
        )
      : undefined;

  const etudiantsScope = monEnseignant
    ? etudiants.filter((e) => monEnseignant.classes.includes(e.classe))
    : etudiants;

  const filieresScope = monEnseignant
    ? filieres
        .map((f) => ({
          ...f,
          matieres: f.matieres.filter((m) =>
            monEnseignant.matieres.includes(m.nom)
          ),
        }))
        .filter(
          (f) =>
            f.matieres.length > 0 &&
            f.classes.some((c) => monEnseignant.classes.includes(c.nom))
        )
    : filieres;

  const presetInScope =
    presetEtudiantId !== undefined &&
    etudiantsScope.some((e) => e.id === presetEtudiantId);

  // En édition, on résout l'étudiant/la filière depuis la note ciblée.
  // Le <DialogContent key={...}> plus bas force un remount (donc une
  // réinitialisation propre de ces useState) à chaque changement de cible,
  // au lieu de resynchroniser via un effet.
  const editingEtudiant = editingNote
    ? etudiants.find((e) => `${e.prenom} ${e.nom}` === editingNote.etudiant)
    : undefined;
  const editingFiliere = editingNote
    ? filieres.find((f) => f.classes.some((c) => c.nom === editingNote.classe))
    : undefined;

  const [etudiantId, setEtudiantId] = useState(
    editingEtudiant?.id ??
      (presetInScope ? presetEtudiantId : undefined) ??
      etudiantsScope[0]?.id ??
      ""
  );
  const [filiereId, setFiliereId] = useState(
    editingFiliere?.id ?? filieresScope[0]?.id ?? ""
  );
  const [matiere, setMatiere] = useState(
    editingNote?.matiere ?? filieresScope[0]?.matieres[0]?.nom ?? ""
  );
  const [note, setNote] = useState(
    editingNote && editingNote.note !== null ? String(editingNote.note) : ""
  );
  const [sur, setSur] = useState(editingNote ? String(editingNote.sur) : "20");
  const [periode, setPeriode] = useState(editingNote?.periode ?? "Semestre 1");

  const filiereCourante =
    filieresScope.find((f) => f.id === filiereId) ?? filieresScope[0];
  const etudiantCourant = etudiantsScope.find((e) => e.id === etudiantId);

  async function handleSubmit() {
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

    try {
      if (isEdit && editId) {
        await updateNote(editId, {
          note: noteNum,
          sur: surNum,
          coefficient:
            filiereCourante.matieres.find((m) => m.nom === matiere)?.coefficient ?? 1,
          periode,
          matiere,
          classe: etudiantCourant.classe,
        });
        toast({ title: "Note modifiée", description: `${matiere} — ${noteNum}/${surNum}.` });
      } else {
        await addNote({
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
          description: `${etudiantCourant.prenom} ${etudiantCourant.nom} — ${matiere} : ${noteNum}/${surNum}.`,
        });
      }
      setNote("");
      closeModal();
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeModal()}>
      <DialogContent key={editId ?? "new"} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardEdit className="size-5 text-blue-500" />
            {isEdit ? "Modifier la note" : "Saisir une note"}
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
              <Label>Filière</Label>
              <Select
                value={filiereId}
                onValueChange={(v) => {
                  setFiliereId(v);
                  const f = filieresScope.find((x) => x.id === v);
                  if (f) setMatiere(f.matieres[0]?.nom ?? "");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filieresScope.map((f) => (
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
            className="bg-blue-500 text-white hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Enregistrer la note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
