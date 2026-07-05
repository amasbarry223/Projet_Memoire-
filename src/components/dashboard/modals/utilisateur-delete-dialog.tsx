"use client";

import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react";
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
import type { Utilisateur } from "@/components/dashboard/data";
import { roleLabels } from "@/components/dashboard/data";

export function UtilisateurDeleteDialog({
  open,
  utilisateur,
  onClose,
  onConfirm,
}: {
  open: boolean;
  utilisateur: Utilisateur | null;
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
            Désactiver / supprimer l&apos;utilisateur ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Vous êtes sur le point de supprimer le compte de{" "}
            <span className="font-semibold text-gray-700">
              {utilisateur?.prenom} {utilisateur?.nom}
            </span>{" "}
            (rôle : {utilisateur ? roleLabels[utilisateur.role] : ""}). Cette
            action est irréversible et sera journalisée dans l&apos;audit (R5).
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-xs text-amber-700">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <span>
            R2 : vous ne pouvez pas modifier votre propre rôle. Vérifiez que
            vous ne supprimez pas votre propre compte administrateur.
          </span>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel type="button">Annuler</AlertDialogCancel>
          <AlertDialogAction
            type="button"
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
