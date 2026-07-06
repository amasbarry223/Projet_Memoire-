"use client";

import { useAppStore } from "@/lib/view-store";
import { TraitementDossierModal } from "./traitement-dossier-modal";
import { FiliereModal } from "./filiere-modal";
import { AlerteModal } from "./alerte-modal";
import { NoteModal } from "./note-modal";

// Hôte central qui rend la modale active selon l'état du store
export function ModalHost() {
  const type = useAppStore((s) => s.modal.type);

  switch (type) {
    case "traitement-dossier":
      return <TraitementDossierModal />;
    case "filiere":
      return <FiliereModal />;
    case "alerte":
      return <AlerteModal />;
    case "note":
      return <NoteModal />;
    default:
      return null;
  }
}
