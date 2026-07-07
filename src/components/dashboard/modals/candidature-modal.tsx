"use client";

import { useState } from "react";
import { FilePlus2, Upload } from "lucide-react";
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
import { getNiveauxDisponibles } from "@/components/dashboard/data";

const PIECE_FIELDS = [
  { key: "identite", label: "Pièce d'identité (PDF, max 5 Mo)" },
  { key: "bac", label: "Baccalauréat (PDF, max 5 Mo)" },
  { key: "releve", label: "Relevé de notes (PDF, max 5 Mo)" },
  { key: "lettre", label: "Lettre de motivation (PDF, max 5 Mo)" },
] as const;

const MAX_SIZE = 5 * 1024 * 1024;

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
  const NIVEAUX = getNiveauxDisponibles(filieres);
  const [niveau, setNiveau] = useState<string>(NIVEAUX[0]);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [loading, setLoading] = useState(false);

  function handleFile(key: string, file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_SIZE) {
      toast({
        title: "Fichier trop volumineux",
        description: "Taille maximum : 5 Mo.",
        variant: "destructive",
      });
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: file }));
  }

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
      await addCandidature(
        {
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: email.trim(),
          telephone: telephone.trim(),
          dateNaissance: dateNaissance.trim(),
          adresse: adresse.trim(),
          filiereId,
          niveau,
        },
        files
      );
      toast({
        title: "Candidature soumise",
        description: "Votre dossier a été enregistré. Analyse IA en cours…",
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus2 className="size-5 text-blue-500" />
            Nouvelle candidature
          </DialogTitle>
          <DialogDescription>
            Complétez votre dossier et joignez les pièces justificatives (PDF recommandé).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Prénom</Label>
              <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+223 …" />
            </div>
            <div className="space-y-2">
              <Label>Date de naissance</Label>
              <Input value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} placeholder="JJ/MM/AAAA" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Adresse</Label>
            <Textarea value={adresse} onChange={(e) => setAdresse(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Filière</Label>
              <Select value={filiereId} onValueChange={setFiliereId}>
                <SelectTrigger>
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
                <SelectTrigger>
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

          <div className="space-y-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Upload className="size-4" />
              Pièces justificatives
            </p>
            {PIECE_FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs text-gray-500">{label}</Label>
                <Input
                  type="file"
                  accept=".pdf,image/jpeg,image/png"
                  onChange={(e) => handleFile(key, e.target.files?.[0])}
                />
                {files[key] && (
                  <p className="text-xs text-green-600">{files[key].name} — prêt</p>
                )}
              </div>
            ))}
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
