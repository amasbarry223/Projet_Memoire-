"use client";

import { Users, X, Plus } from "lucide-react";
import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import type { Enseignant } from "@/components/dashboard/data";
import { useToast } from "@/hooks/use-toast";
import { useDataStore } from "@/lib/data-store";

export function EnseignantFormModal({
  open,
  enseignant,
  onClose,
  onSave,
}: {
  open: boolean;
  enseignant: Enseignant | null;
  onClose: () => void;
  onSave: (data: Omit<Enseignant, "id"> & { id?: string }) => void;
}) {
  const { toast } = useToast();
  const isEditing = !!enseignant;

  const filieres = useDataStore((s) => s.filieres);
  const ALL_MATIERES = [...new Set(filieres.flatMap((f) => f.matieres.map((m) => m.nom)))].sort(
    (a, b) => a.localeCompare(b)
  );
  const ALL_CLASSES = [...new Set(filieres.flatMap((f) => f.classes.map((c) => c.nom)))].sort(
    (a, b) => a.localeCompare(b)
  );

  const [prenom, setPrenom] = useState(enseignant?.prenom ?? "");
  const [nom, setNom] = useState(enseignant?.nom ?? "");
  const [email, setEmail] = useState(enseignant?.email ?? "");
  const [statut, setStatut] = useState<"Actif" | "Congé">(
    enseignant?.statut ?? "Actif"
  );
  const [matieres, setMatieres] = useState<string[]>(enseignant?.matieres ?? []);
  const [classes, setClasses] = useState<string[]>(enseignant?.classes ?? []);

  const formKey = enseignant?.id ?? "new";

  function reset() {
    setPrenom(enseignant?.prenom ?? "");
    setNom(enseignant?.nom ?? "");
    setEmail(enseignant?.email ?? "");
    setStatut(enseignant?.statut ?? "Actif");
    setMatieres(enseignant?.matieres ?? []);
    setClasses(enseignant?.classes ?? []);
  }

  function toggle(arr: string[], val: string, setter: (v: string[]) => void) {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prenom.trim() || !nom.trim() || !email.trim()) {
      toast({
        title: "Champs requis",
        description: "Prénom, nom et email sont obligatoires.",
        variant: "destructive",
      });
      return;
    }
    onSave({
      id: enseignant?.id,
      prenom: prenom.trim(),
      nom: nom.trim(),
      email: email.trim(),
      statut,
      matieres,
      classes,
    });
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
        else reset();
      }}
    >
      <DialogContent key={formKey} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5 text-yellow-600" />
            {isEditing ? "Modifier l'enseignant" : "Nouvel enseignant"}
          </DialogTitle>
          <DialogDescription>
            Informations, matières enseignées et classes affectées (R3).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ens-prenom">Prénom</Label>
              <Input
                id="ens-prenom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Drissa"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ens-nom">Nom</Label>
              <Input
                id="ens-nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Coulibaly"
                required
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="ens-email">Email</Label>
              <Input
                id="ens-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="d.coulibaly@ecole.ml"
                required
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Statut</Label>
              <Select
                value={statut}
                onValueChange={(v) => setStatut(v as "Actif" | "Congé")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Congé">Congé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Matières */}
          <div className="space-y-2">
            <Label>Matières enseignées</Label>
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-gray-100 p-3">
              {ALL_MATIERES.map((m) => {
                const active = matieres.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggle(matieres, m, setMatieres)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                      active
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {active && <X className="mr-1 inline size-3" />}
                    {m}
                  </button>
                );
              })}
              {ALL_MATIERES.length === 0 ? (
                <span className="text-xs text-gray-400">
                  Aucune matière définie — ajoutez-en depuis Filières &amp; Classes.
                </span>
              ) : (
                matieres.length === 0 && (
                  <span className="text-xs text-gray-400">
                    Aucune matière sélectionnée
                  </span>
                )
              )}
            </div>
          </div>

          {/* Classes */}
          <div className="space-y-2">
            <Label>Classes affectées</Label>
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-gray-100 p-3">
              {ALL_CLASSES.map((c) => {
                const active = classes.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggle(classes, c, setClasses)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                      active
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {active && <X className="mr-1 inline size-3" />}
                    {c}
                  </button>
                );
              })}
              {ALL_CLASSES.length === 0 ? (
                <span className="text-xs text-gray-400">
                  Aucune classe définie — ajoutez-en depuis Filières &amp; Classes.
                </span>
              ) : (
                classes.length === 0 && (
                  <span className="text-xs text-gray-400">
                    Aucune classe affectée
                  </span>
                )
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-yellow-500 text-white hover:bg-yellow-600"
            >
              {isEditing ? "Enregistrer" : "Créer l'enseignant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
