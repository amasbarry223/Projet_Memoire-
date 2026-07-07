"use client";

import { useEffect, useState } from "react";
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

  const [filiereNom, setFiliereNom] = useState("");
  const [filiereCode, setFiliereCode] = useState("");
  const [filiereDesc, setFiliereDesc] = useState("");
  const [selectedFiliere, setSelectedFiliere] = useState(
    presetFiliereId ?? filieres[0]?.id ?? ""
  );
  const [classeNom, setClasseNom] = useState("");
  const [classeNiveau, setClasseNiveau] = useState("1ère année");
  const [classeEffectif, setClasseEffectif] = useState("");
  const [matiereNom, setMatiereNom] = useState("");
  const [matiereCoef, setMatiereCoef] = useState("1");

  useEffect(() => {
    if (!open || !editId) return;
    if (sub === "filiere") {
      const f = filieres.find((x) => x.id === editId);
      if (f) {
        setFiliereNom(f.nom);
        setFiliereCode(f.code);
        setFiliereDesc(f.description);
      }
    } else if (sub === "classe") {
      const f = filieres.find((x) => x.id === presetFiliereId);
      const c = f?.classes.find((x) => x.id === editId);
      if (c) {
        setClasseNom(c.nom);
        setClasseNiveau(c.niveau);
        setClasseEffectif(String(c.effectif));
      }
    } else if (sub === "matiere") {
      const f = filieres.find((x) => x.id === presetFiliereId);
      const m = f?.matieres.find((x) => x.id === editId);
      if (m) {
        setMatiereNom(m.nom);
        setMatiereCoef(String(m.coefficient));
      }
    }
  }, [open, editId, sub, presetFiliereId, filieres]);

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
          effectif: parseInt(classeEffectif || "0", 10) || 0,
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
      setClasseEffectif("");
      setMatiereNom("");
      closeModal();
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeModal()}>
      <DialogContent className="sm:max-w-md">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select value={classeNiveau} onValueChange={setClasseNiveau}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1ère année">1ère année</SelectItem>
                    <SelectItem value="2ème année">2ème année</SelectItem>
                    <SelectItem value="3ème année">3ème année</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ceff">Effectif</Label>
                <Input id="ceff" type="number" value={classeEffectif} onChange={(e) => setClasseEffectif(e.target.value)} />
              </div>
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
