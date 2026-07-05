"use client";

import { GraduationCap } from "lucide-react";
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
import {
  filieres,
  type Etudiant,
} from "@/components/dashboard/data";
import { useToast } from "@/hooks/use-toast";

export function EtudiantFormModal({
  open,
  etudiant,
  onClose,
  onSave,
}: {
  open: boolean;
  etudiant: Etudiant | null;
  onClose: () => void;
  onSave: (data: Omit<Etudiant, "id"> & { id?: string }) => void;
}) {
  const { toast } = useToast();
  const isEditing = !!etudiant;
  const formKey = etudiant?.id ?? "new";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const prenom = String(data.get("prenom") ?? "").trim();
    const nom = String(data.get("nom") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const matricule = String(data.get("matricule") ?? "").trim();
    const filiere = String(data.get("filiere") ?? "");
    const classe = String(data.get("classe") ?? "");
    const moyenne = parseFloat(String(data.get("moyenne") ?? "0"));
    const assiduite = parseFloat(String(data.get("assiduite") ?? "0"));
    const statut = String(data.get("statut") ?? "Actif") as "Actif" | "Suspendu";

    if (!prenom || !nom || !email || !matricule) {
      toast({
        title: "Champs requis",
        description: "Prénom, nom, email et matricule sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      id: etudiant?.id,
      prenom,
      nom,
      email,
      matricule,
      filiere,
      classe,
      moyenne: isNaN(moyenne) ? 0 : moyenne,
      assiduite: isNaN(assiduite) ? 0 : assiduite,
      statut,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="size-5 text-emerald-500" />
            {isEditing ? "Modifier l'étudiant" : "Nouvel étudiant"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Mettez à jour les informations de l'étudiant."
              : "Ajoutez un nouvel étudiant à l'établissement."}
          </DialogDescription>
        </DialogHeader>

        <form
          key={formKey}
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <Label htmlFor="prenom">Prénom</Label>
            <Input
              id="prenom"
              name="prenom"
              defaultValue={etudiant?.prenom ?? ""}
              placeholder="Moussa"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              name="nom"
              defaultValue={etudiant?.nom ?? ""}
              placeholder="Diabaté"
              required
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={etudiant?.email ?? ""}
              placeholder="moussa.diabate@etu.ml"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="matricule">Matricule</Label>
            <Input
              id="matricule"
              name="matricule"
              defaultValue={etudiant?.matricule ?? ""}
              placeholder="2024-SIO-001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Filière</Label>
            <Select
              name="filiere"
              defaultValue={etudiant?.filiere ?? filieres[0].nom}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filieres.map((f) => (
                  <SelectItem key={f.id} value={f.nom}>
                    {f.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="classe">Classe</Label>
            <Input
              id="classe"
              name="classe"
              defaultValue={etudiant?.classe ?? ""}
              placeholder="BTS SIO 1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="moyenne">Moyenne (/20)</Label>
            <Input
              id="moyenne"
              name="moyenne"
              type="number"
              step="0.1"
              min="0"
              max="20"
              defaultValue={etudiant?.moyenne?.toString() ?? "10"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assiduite">Assiduité (%)</Label>
            <Input
              id="assiduite"
              name="assiduite"
              type="number"
              min="0"
              max="100"
              defaultValue={etudiant?.assiduite?.toString() ?? "90"}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Statut</Label>
            <Select
              name="statut"
              defaultValue={etudiant?.statut ?? "Actif"}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Suspendu">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-emerald-500 text-white hover:bg-emerald-600"
            >
              {isEditing ? "Enregistrer" : "Créer l'étudiant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
