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
import { useAppStore } from "@/lib/view-store";
import {
  utilisateurs,
  roleLabels,
  type Role,
} from "@/components/dashboard/data";
import { useToast } from "@/hooks/use-toast";

export function UtilisateurModal() {
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const { toast } = useToast();

  const editing =
    modal.type === "utilisateur" && modal.userId
      ? utilisateurs.find((u) => u.id === modal.userId)
      : undefined;

  const open = modal.type === "utilisateur";
  // Clé de remontage pour réinitialiser les champs non contrôlés à chaque ouverture
  const formKey = editing ? editing.id : "new";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const prenom = String(data.get("prenom") ?? "");
    const nom = String(data.get("nom") ?? "");
    const email = String(data.get("email") ?? "");
    const role = String(data.get("role") ?? "enseignant") as Role;

    if (!prenom || !nom || !email) {
      toast({
        title: "Champs requis",
        description: "Veuillez renseigner le prénom, le nom et l'email.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: editing ? "Utilisateur modifié" : "Utilisateur créé",
      description: `${prenom} ${nom} — Rôle : ${roleLabels[role]}. Journalisé dans l'audit.`,
    });
    closeModal();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="size-5 text-emerald-500" />
            {editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Modifiez les informations et le rôle. R2 : un utilisateur ne peut pas modifier son propre rôle."
              : "Créez un compte enseignant ou responsable."}
          </DialogDescription>
        </DialogHeader>

        <form key={formKey} onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prenom">Prénom</Label>
            <Input
              id="prenom"
              name="prenom"
              defaultValue={editing?.prenom ?? ""}
              placeholder="Antoine"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              name="nom"
              defaultValue={editing?.nom ?? ""}
              placeholder="Dubois"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={editing?.email ?? ""}
              placeholder="d.coulibaly@scolaflow.ml"
            />
          </div>
          <div className="space-y-2">
            <Label>Rôle</Label>
            <Select name="role" defaultValue={editing?.role ?? "enseignant"}>
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
              defaultValue={editing?.statut ?? "Actif"}
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
            <Button type="button" variant="outline" onClick={closeModal}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-emerald-500 text-white hover:bg-emerald-600"
            >
              {editing ? "Enregistrer" : "Créer le compte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
