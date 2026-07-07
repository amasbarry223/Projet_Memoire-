"use client";

import { useAppStore } from "@/lib/view-store";
import { TraitementDossierModal } from "./traitement-dossier-modal";
import { FiliereModal } from "./filiere-modal";
import { AlerteModal } from "./alerte-modal";
import { NoteModal } from "./note-modal";
import { AbsenceModal } from "./absence-modal";
import { CandidatureModal } from "./candidature-modal";

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
    case "absence":
      return <AbsenceModal />;
    case "candidature":
      return <CandidatureModal />;
    default:
      return null;
  }
}
