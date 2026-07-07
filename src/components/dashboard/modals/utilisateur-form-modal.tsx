"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
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

export type UtilisateurFormData = Omit<Utilisateur, "id" | "derniereConnexion"> & {
  id?: string;
  password?: string;
  inviteByEmail?: boolean;
};

export function UtilisateurFormModal({
  open,
  utilisateur,
  onClose,
  onSave,
}: {
  open: boolean;
  utilisateur: Utilisateur | null;
  onClose: () => void;
  onSave: (data: UtilisateurFormData) => void;
}) {
  const { toast } = useToast();
  const isEditing = !!utilisateur;
  const formKey = utilisateur?.id ?? "new";
  const [inviteByEmail, setInviteByEmail] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const prenom = String(data.get("prenom") ?? "").trim();
    const nom = String(data.get("nom") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const role = String(data.get("role") ?? "enseignant") as Role;
    const statut = String(data.get("statut") ?? "Actif") as "Actif" | "Désactivé";
    const password = String(data.get("password") ?? "");

    if (!prenom || !nom || !email) {
      toast({
        title: "Champs requis",
        description: "Prénom, nom et email sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    if (!isEditing && !inviteByEmail) {
      if (password.length < 8) {
        toast({
          title: "Mot de passe invalide",
          description: "Le mot de passe doit contenir au moins 8 caractères.",
          variant: "destructive",
        });
        return;
      }
      const confirm = String(data.get("passwordConfirm") ?? "");
      if (password !== confirm) {
        toast({
          title: "Mots de passe différents",
          description: "La confirmation ne correspond pas.",
          variant: "destructive",
        });
        return;
      }
    }

    onSave({
      id: utilisateur?.id,
      prenom,
      nom,
      email,
      role,
      statut,
      ...(!isEditing && !inviteByEmail ? { password } : {}),
      ...(!isEditing ? { inviteByEmail } : {}),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" key={formKey}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="size-5 text-blue-500" />
            {isEditing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations et le rôle. R2 : un utilisateur ne peut pas modifier son propre rôle."
              : "Créez un compte avec mot de passe ou envoyez une invitation par email."}
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
          {!isEditing && (
            <>
              <div className="col-span-2 flex items-center gap-2">
                <Checkbox
                  id="u-invite"
                  checked={inviteByEmail}
                  onCheckedChange={(v) => setInviteByEmail(v === true)}
                />
                <Label htmlFor="u-invite" className="cursor-pointer font-normal">
                  Envoyer une invitation par email (sans mot de passe)
                </Label>
              </div>
              {!inviteByEmail && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="u-password">Mot de passe</Label>
                    <Input
                      id="u-password"
                      name="password"
                      type="password"
                      minLength={8}
                      placeholder="8 caractères min."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="u-password-confirm">Confirmation</Label>
                    <Input
                      id="u-password-confirm"
                      name="passwordConfirm"
                      type="password"
                      minLength={8}
                      placeholder="Répéter le mot de passe"
                    />
                  </div>
                </>
              )}
            </>
          )}
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
                {(Object.keys(roleLabels) as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {roleLabels[r]}
                  </SelectItem>
                ))}
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
              className="bg-blue-500 text-white hover:bg-blue-700"
            >
              {isEditing ? "Enregistrer" : inviteByEmail ? "Envoyer l'invitation" : "Créer le compte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
