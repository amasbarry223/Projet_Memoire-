"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import type { Etudiant } from "@/components/dashboard/data";

export function EtudiantDeleteDialog({
  open,
  etudiant,
  onClose,
  onConfirm,
}: {
  open: boolean;
  etudiant: Etudiant | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertTriangle className="size-5" />
            </div>
            Supprimer l'étudiant ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Vous êtes sur le point de supprimer{" "}
            <span className="font-semibold text-gray-700">
              {etudiant?.prenom} {etudiant?.nom}
            </span>{" "}
            ({etudiant?.matricule}). Cette action est irréversible et sera
            journalisée dans l'audit (R5).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 text-white hover:bg-red-600"
            onClick={onConfirm}
          >
            <Trash2 className="size-4" />
            Supprimer définitivement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
