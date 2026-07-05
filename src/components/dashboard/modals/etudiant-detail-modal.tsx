"use client";

import {
  GraduationCap,
  Mail,
  Hash,
  BookOpen,
  School,
  TrendingUp,
  CalendarCheck,
  CircleDot,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Etudiant } from "@/components/dashboard/data";
import { StatusBadge } from "../views/shared";

function moyenneColor(m: number) {
  if (m >= 14) return "text-emerald-600";
  if (m >= 10) return "text-gray-700";
  return "text-red-500";
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-500 shadow-sm">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <div className="text-sm font-medium text-gray-900 truncate">{children}</div>
      </div>
    </div>
  );
}

export function EtudiantDetailModal({
  open,
  etudiant,
  onClose,
  onEdit,
}: {
  open: boolean;
  etudiant: Etudiant | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  if (!etudiant) return null;
  const initials = `${etudiant.prenom.charAt(0)}${etudiant.nom.charAt(0)}`.toUpperCase();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-700">
              {initials}
            </div>
            <div>
              <span className="flex items-center gap-2">
                {etudiant.prenom} {etudiant.nom}
              </span>
              <DialogDescription className="mt-0.5 font-mono text-xs">
                {etudiant.matricule}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <InfoRow icon={Mail} label="Email">
            {etudiant.email}
          </InfoRow>
          <InfoRow icon={Hash} label="Matricule">
            {etudiant.matricule}
          </InfoRow>
          <InfoRow icon={BookOpen} label="Filière">
            {etudiant.filiere}
          </InfoRow>
          <InfoRow icon={School} label="Classe">
            {etudiant.classe}
          </InfoRow>
          <InfoRow icon={TrendingUp} label="Moyenne">
            <span className={`font-bold ${moyenneColor(etudiant.moyenne)}`}>
              {etudiant.moyenne.toFixed(1)}/20
            </span>
          </InfoRow>
          <InfoRow icon={CalendarCheck} label="Assiduité">
            {etudiant.assiduite}%
          </InfoRow>
          <InfoRow icon={CircleDot} label="Statut">
            <StatusBadge
              label={etudiant.statut}
              className={
                etudiant.statut === "Actif"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-gray-100 text-gray-500"
              }
            />
          </InfoRow>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button
            className="bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={onEdit}
          >
            <GraduationCap className="size-4" />
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
