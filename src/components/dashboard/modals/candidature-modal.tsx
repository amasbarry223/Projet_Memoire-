"use client";

import { useState } from "react";
import { FilePlus2 } from "lucide-react";
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
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";

const NIVEAUX = ["1ère année", "2ème année", "3ème année"] as const;

export function CandidatureModal() {
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const addCandidature = useDataStore((s) => s.addCandidature);
  const filieres = useDataStore((s) => s.filieres);
  const session = useAuthStore((s) => s.session);
  const { toast } = useToast();

  const open = modal.type === "candidature";

  const [nom, setNom] = useState(session?.nom ?? "");
  const [prenom, setPrenom] = useState(session?.prenom ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [telephone, setTelephone] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [adresse, setAdresse] = useState("");
  const [filiereId, setFiliereId] = useState(filieres[0]?.id ?? "");
  const [niveau, setNiveau] = useState<string>(NIVEAUX[0]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!nom.trim() || !prenom.trim() || !filiereId) {
      toast({
        title: "Champs requis",
        description: "Nom, prénom et filière sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addCandidature({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
        dateNaissance: dateNaissance.trim(),
        adresse: adresse.trim(),
        filiereId,
        niveau,
      });
      toast({
        title: "Candidature soumise",
        description: "Votre dossier a été enregistré et est en attente de traitement.",
      });
      closeModal();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Échec de la soumission",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeModal()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus2 className="size-5 text-blue-500" />
            Nouvelle candidature
          </DialogTitle>
          <DialogDescription>
            Soumettez votre dossier d&apos;inscription (Module F3).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cand-prenom">Prénom</Label>
            <Input
              id="cand-prenom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cand-nom">Nom</Label>
            <Input
              id="cand-nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="cand-email">Email</Label>
            <Input
              id="cand-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cand-tel">Téléphone</Label>
            <Input
              id="cand-tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+223 …"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cand-naissance">Date de naissance</Label>
            <Input
              id="cand-naissance"
              value={dateNaissance}
              onChange={(e) => setDateNaissance(e.target.value)}
              placeholder="JJ/MM/AAAA"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="cand-adresse">Adresse</Label>
            <Textarea
              id="cand-adresse"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Filière</Label>
            <Select value={filiereId} onValueChange={setFiliereId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir une filière" />
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
            <Label>Niveau</Label>
            <Select value={niveau} onValueChange={setNiveau}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NIVEAUX.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeModal} disabled={loading}>
            Annuler
          </Button>
          <Button
            className="bg-blue-500 text-white hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Envoi…" : "Soumettre le dossier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
