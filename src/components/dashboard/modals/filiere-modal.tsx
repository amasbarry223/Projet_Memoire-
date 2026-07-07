"use client";

import { useState } from "react";
import { BookOpen, School, BookMarked, Pencil } from "lucide-react";
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
import { getNiveauxDisponibles } from "@/components/dashboard/data";

export function FiliereModal() {
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const filieres = useDataStore((s) => s.filieres);
  const addFiliere = useDataStore((s) => s.addFiliere);
  const updateFiliere = useDataStore((s) => s.updateFiliere);
  const addClasse = useDataStore((s) => s.addClasse);
  const updateClasse = useDataStore((s) => s.updateClasse);
  const addMatiere = useDataStore((s) => s.addMatiere);
  const updateMatiere = useDataStore((s) => s.updateMatiere);
  const { toast } = useToast();

  const sub = modal.type === "filiere" ? modal.sub : "filiere";
  const presetFiliereId = modal.type === "filiere" ? modal.filiereId : undefined;
  const editId = modal.type === "filiere" ? modal.editId : undefined;
  const open = modal.type === "filiere";
  const isEdit = Boolean(editId);

  // Résout l'entité en édition avant d'initialiser le formulaire. Le
  // <DialogContent key={...}> plus bas force un remount (donc une
  // réinitialisation propre de ces useState) à chaque changement de cible,
  // au lieu de resynchroniser via un effet.
  const editingFiliere =
    editId && sub === "filiere" ? filieres.find((x) => x.id === editId) : undefined;
  const editingClasse =
    editId && sub === "classe"
      ? filieres.find((x) => x.id === presetFiliereId)?.classes.find((x) => x.id === editId)
      : undefined;
  const editingMatiere =
    editId && sub === "matiere"
      ? filieres.find((x) => x.id === presetFiliereId)?.matieres.find((x) => x.id === editId)
      : undefined;

  const [filiereNom, setFiliereNom] = useState(editingFiliere?.nom ?? "");
  const [filiereCode, setFiliereCode] = useState(editingFiliere?.code ?? "");
  const [filiereDesc, setFiliereDesc] = useState(editingFiliere?.description ?? "");
  const [selectedFiliere, setSelectedFiliere] = useState(
    presetFiliereId ?? filieres[0]?.id ?? ""
  );
  const NIVEAUX = getNiveauxDisponibles(filieres);
  const [classeNom, setClasseNom] = useState(editingClasse?.nom ?? "");
  const [classeNiveau, setClasseNiveau] = useState(editingClasse?.niveau ?? NIVEAUX[0]);
  const [matiereNom, setMatiereNom] = useState(editingMatiere?.nom ?? "");
  const [matiereCoef, setMatiereCoef] = useState(
    editingMatiere ? String(editingMatiere.coefficient) : "1"
  );

  const config = {
    filiere: {
      title: isEdit ? "Modifier la filière" : "Nouvelle filière",
      icon: isEdit ? Pencil : BookOpen,
      desc: isEdit
        ? "Mettez à jour les informations de la filière."
        : "Ajoutez une filière de formation.",
    },
    classe: {
      title: isEdit ? "Modifier la classe" : "Nouvelle classe",
      icon: isEdit ? Pencil : School,
      desc: isEdit
        ? "Mettez à jour les informations de la classe."
        : "Ajoutez une classe rattachée à une filière.",
    },
    matiere: {
      title: isEdit ? "Modifier la matière" : "Nouvelle matière",
      icon: isEdit ? Pencil : BookMarked,
      desc: isEdit
        ? "Mettez à jour la matière et son coefficient."
        : "Ajoutez une matière et son coefficient.",
    },
  }[sub];

  const Icon = config.icon;

  async function handleSubmit() {
    try {
      if (sub === "filiere") {
        if (!filiereNom.trim() || !filiereCode.trim()) {
          toast({
            title: "Champs requis",
            description: "Le nom et le code de la filière sont obligatoires.",
            variant: "destructive",
          });
          return;
        }
        if (isEdit && editId) {
          await updateFiliere(editId, {
            nom: filiereNom.trim(),
            code: filiereCode.trim(),
            description: filiereDesc.trim(),
          });
          toast({ title: "Filière modifiée", description: `« ${filiereNom.trim()} » mise à jour.` });
        } else {
          await addFiliere({
            nom: filiereNom.trim(),
            code: filiereCode.trim(),
            description: filiereDesc.trim(),
          });
          toast({ title: "Filière créée", description: `« ${filiereNom.trim()} » ajoutée.` });
        }
      } else if (sub === "classe") {
        if (!classeNom.trim()) {
          toast({ title: "Champ requis", description: "Le nom de la classe est obligatoire.", variant: "destructive" });
          return;
        }
        const payload = {
          nom: classeNom.trim(),
          niveau: classeNiveau,
        };
        if (isEdit && editId) {
          await updateClasse(selectedFiliere, editId, payload);
          toast({ title: "Classe modifiée", description: `« ${classeNom.trim()} » mise à jour.` });
        } else {
          await addClasse(selectedFiliere, payload);
          toast({ title: "Classe créée", description: `« ${classeNom.trim()} » ajoutée.` });
        }
      } else {
        if (!matiereNom.trim()) {
          toast({ title: "Champ requis", description: "Le nom de la matière est obligatoire.", variant: "destructive" });
          return;
        }
        const payload = {
          nom: matiereNom.trim(),
          coefficient: parseInt(matiereCoef || "1", 10) || 1,
        };
        if (isEdit && editId) {
          await updateMatiere(selectedFiliere, editId, payload);
          toast({ title: "Matière modifiée", description: `« ${matiereNom.trim()} » mise à jour.` });
        } else {
          await addMatiere(selectedFiliere, payload);
          toast({ title: "Matière créée", description: `« ${matiereNom.trim()} » ajoutée.` });
        }
      }
      setFiliereNom("");
      setFiliereCode("");
      setFiliereDesc("");
      setClasseNom("");
      setMatiereNom("");
      closeModal();
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeModal()}>
      <DialogContent key={`${sub}-${editId ?? "new"}`} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="size-5 text-blue-500" />
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.desc}</DialogDescription>
        </DialogHeader>

        {sub === "filiere" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fnom">Nom de la filière</Label>
              <Input id="fnom" value={filiereNom} onChange={(e) => setFiliereNom(e.target.value)} placeholder="Ex : BTS CG" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fcode">Code</Label>
              <Input id="fcode" value={filiereCode} onChange={(e) => setFiliereCode(e.target.value)} placeholder="Ex : CG" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fdesc">Description</Label>
              <Textarea id="fdesc" value={filiereDesc} onChange={(e) => setFiliereDesc(e.target.value)} rows={2} />
            </div>
          </div>
        )}

        {sub === "classe" && (
          <div className="space-y-4">
            {!isEdit && (
              <div className="space-y-2">
                <Label>Filière</Label>
                <Select value={selectedFiliere} onValueChange={setSelectedFiliere}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {filieres.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="cnom">Nom de la classe</Label>
              <Input id="cnom" value={classeNom} onChange={(e) => setClasseNom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Niveau</Label>
              <Select value={classeNiveau} onValueChange={setClasseNiveau}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NIVEAUX.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                L&apos;effectif est calculé automatiquement à partir des étudiants inscrits dans cette classe.
              </p>
            </div>
          </div>
        )}

        {sub === "matiere" && (
          <div className="space-y-4">
            {!isEdit && (
              <div className="space-y-2">
                <Label>Filière</Label>
                <Select value={selectedFiliere} onValueChange={setSelectedFiliere}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {filieres.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="mnom">Nom de la matière</Label>
              <Input id="mnom" value={matiereNom} onChange={(e) => setMatiereNom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mcoef">Coefficient</Label>
              <Input id="mcoef" type="number" min={1} max={10} value={matiereCoef} onChange={(e) => setMatiereCoef(e.target.value)} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>Annuler</Button>
          <Button className="bg-blue-500 text-white hover:bg-blue-700" onClick={handleSubmit}>
            {isEdit ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
