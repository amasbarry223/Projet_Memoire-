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
import type { Enseignant } from "@/components/dashboard/data";

export function EnseignantDeleteDialog({
  open,
  enseignant,
  onClose,
  onConfirm,
}: {
  open: boolean;
  enseignant: Enseignant | null;
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
            Supprimer l&apos;enseignant ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Vous êtes sur le point de supprimer{" "}
            <span className="font-semibold text-gray-700">
              {enseignant?.prenom} {enseignant?.nom}
            </span>{" "}
            ({enseignant?.email}). Ses affectations aux classes et matières
            seront retirées. Action irréversible, journalisée (R5).
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
