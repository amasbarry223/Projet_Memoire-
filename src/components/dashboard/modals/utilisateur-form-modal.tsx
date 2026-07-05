"use client";

import { UserCog } from "lucide-react";
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
  roleLabels,
  type Role,
  type Utilisateur,
} from "@/components/dashboard/data";
import { useToast } from "@/hooks/use-toast";

export function UtilisateurFormModal({
  open,
  utilisateur,
  onClose,
  onSave,
}: {
  open: boolean;
  utilisateur: Utilisateur | null;
  onClose: () => void;
  onSave: (data: Omit<Utilisateur, "id" | "derniereConnexion"> & { id?: string }) => void;
}) {
  const { toast } = useToast();
  const isEditing = !!utilisateur;
  const formKey = utilisateur?.id ?? "new";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const prenom = String(data.get("prenom") ?? "").trim();
    const nom = String(data.get("nom") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const role = String(data.get("role") ?? "enseignant") as Role;
    const statut = String(data.get("statut") ?? "Actif") as "Actif" | "Désactivé";

    if (!prenom || !nom || !email) {
      toast({
        title: "Champs requis",
        description: "Prénom, nom et email sont obligatoires.",
        variant: "destructive",
      });
      return;
    }
    onSave({ id: utilisateur?.id, prenom, nom, email, role, statut });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" key={formKey}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="size-5 text-emerald-500" />
            {isEditing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations et le rôle. R2 : un utilisateur ne peut pas modifier son propre rôle."
              : "Créez un compte enseignant ou responsable."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="u-prenom">Prénom</Label>
            <Input
              id="u-prenom"
              name="prenom"
              defaultValue={utilisateur?.prenom ?? ""}
              placeholder="Drissa"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="u-nom">Nom</Label>
            <Input
              id="u-nom"
              name="nom"
              defaultValue={utilisateur?.nom ?? ""}
              placeholder="Coulibaly"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="u-email">Email</Label>
            <Input
              id="u-email"
              name="email"
              type="email"
              defaultValue={utilisateur?.email ?? ""}
              placeholder="d.coulibaly@esgic.ml"
            />
          </div>
          <div className="space-y-2">
            <Label>Rôle</Label>
            <Select
              name="role"
              defaultValue={utilisateur?.role ?? "enseignant"}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enseignant">Enseignant</SelectItem>
                <SelectItem value="responsable">Responsable pédagogique</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="etudiant">Étudiant</SelectItem>
                <SelectItem value="candidat">Candidat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select
              name="statut"
              defaultValue={utilisateur?.statut ?? "Actif"}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Désactivé">Désactivé</SelectItem>
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
              {isEditing ? "Enregistrer" : "Créer le compte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
