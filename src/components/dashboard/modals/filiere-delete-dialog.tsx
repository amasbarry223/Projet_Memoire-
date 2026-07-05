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

export type DeleteTarget = {
  type: "filiere" | "classe" | "matiere";
  nom: string;
  parent?: string;
};

export function FiliereDeleteDialog({
  open,
  target,
  onClose,
  onConfirm,
}: {
  open: boolean;
  target: DeleteTarget | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const labels = {
    filiere: "la filière",
    classe: "la classe",
    matiere: "la matière",
  } as const;

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertTriangle className="size-5" />
            </div>
            Supprimer {target ? labels[target.type] : "l'élément"} ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Vous êtes sur le point de supprimer{" "}
            <span className="font-semibold text-gray-700">{target?.nom}</span>
            {target?.parent ? (
              <>
                {" "}
                de la filière{" "}
                <span className="font-semibold text-gray-700">
                  {target.parent}
                </span>
              </>
            ) : null}
            .{" "}
            {target?.type === "filiere" &&
              "Toutes les classes et matières rattachées seront également supprimées. "}
            Cette action est irréversible et journalisée (R5).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">Annuler</AlertDialogCancel>
          <AlertDialogAction type="button"
            className="bg-red-500 text-white hover:bg-red-600"
            onClick={onConfirm}
          >
            <Trash2 className="size-4" />
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
