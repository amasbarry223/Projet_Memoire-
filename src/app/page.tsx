"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/view-store";
import { useAuthStore } from "@/lib/auth-store";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { LoginView } from "@/components/dashboard/login-view";
import { UpdatePasswordView } from "@/components/dashboard/update-password-view";
import { ModalHost } from "@/components/dashboard/modals/modal-host";
import { DashboardView } from "@/components/dashboard/views/dashboard-view";
import { CandidaturesView } from "@/components/dashboard/views/candidatures-view";
import { DossierDetailView } from "@/components/dashboard/views/dossier-detail-view";
import { EtudiantsView } from "@/components/dashboard/views/etudiants-view";
import { EtudiantDetailView } from "@/components/dashboard/views/etudiant-detail-view";
import { EnseignantsView } from "@/components/dashboard/views/enseignants-view";
import { SuiviView } from "@/components/dashboard/views/suivi-view";
import { AlertesView } from "@/components/dashboard/views/alertes-view";
import { RapportsView } from "@/components/dashboard/views/rapports-view";
import { FilieresView } from "@/components/dashboard/views/filieres-view";
import { UtilisateursView } from "@/components/dashboard/views/utilisateurs-view";
import { AuditView } from "@/components/dashboard/views/audit-view";
import { ParametresView } from "@/components/dashboard/views/parametres-view";
import { useDataStore } from "@/lib/data-store";
import { roleViews, type ViewKey } from "@/components/dashboard/data";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";

const FULL_WIDTH_VIEWS: ViewKey[] = [
  "candidatures",
  "etudiants",
  "enseignants",
  "suivi",
  "alertes",
  "rapports",
  "filieres",
  "utilisateurs",
  "audit",
];

const views: Record<ViewKey, React.ComponentType> = {
  dashboard: DashboardView,
  candidatures: CandidaturesView,
  etudiants: EtudiantsView,
  enseignants: EnseignantsView,
  suivi: SuiviView,
  alertes: AlertesView,
  rapports: RapportsView,
  filieres: FilieresView,
  utilisateurs: UtilisateursView,
  audit: AuditView,
  parametres: ParametresView,
};

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">
      {message}
    </div>
  );
}

function ConfigErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-red-700">Configuration requise</h1>
        <p className="mt-3 text-sm text-gray-600">{message}</p>
        <p className="mt-4 text-xs text-gray-500">
          Sur Vercel : Settings → Environment Variables → ajoutez{" "}
          <code className="rounded bg-gray-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
          <code className="rounded bg-gray-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>,
          puis redéployez.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const hasHydrated = useAuthHydrated();
  const session = useAuthStore((s) => s.session);
  const authInitError = useAuthStore((s) => s.initError);
  const passwordRecovery = useAuthStore((s) => s.passwordRecovery);
  const initializeData = useDataStore((s) => s.initialize);
  const isDataLoading = useDataStore((s) => s.isLoading);
  const isDataInitialized = useDataStore((s) => s.isInitialized);
  const dataError = useDataStore((s) => s.error);
  const view = useAppStore((s) => s.view);
  const selectedDossierId = useAppStore((s) => s.selectedDossierId);
  const selectedEtudiantId = useAppStore((s) => s.selectedEtudiantId);
  const candidatures = useDataStore((s) => s.candidatures);
  const etudiants = useDataStore((s) => s.etudiants);
  const [dataLoadTimedOut, setDataLoadTimedOut] = useState(false);

  useEffect(() => {
    if (session) {
      void initializeData();
    }
  }, [session, initializeData]);

  useEffect(() => {
    if (!session || isDataInitialized || !isDataLoading) {
      setDataLoadTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => setDataLoadTimedOut(true), 15000);
    return () => window.clearTimeout(timer);
  }, [session, isDataInitialized, isDataLoading]);

  // RBAC côté rendu : si la vue courante n'est pas autorisée pour le rôle,
  // on affiche la première vue autorisée (sans écrire dans le store pendant le rendu).
  const allowed = session ? roleViews[session.role] : [];
  const safeView: ViewKey =
    !session || allowed.includes(view) ? view : allowed[0] ?? "dashboard";

  if (!hasHydrated) {
    return <LoadingScreen message="Chargement…" />;
  }

  if (authInitError) {
    return <ConfigErrorScreen message={authInitError} />;
  }

  // Lien "mot de passe oublié" suivi — on bloque l'accès normal tant que
  // l'utilisateur n'a pas défini un nouveau mot de passe.
  if (passwordRecovery) {
    return <UpdatePasswordView />;
  }

  if (
    session &&
    isDataLoading &&
    !isDataInitialized &&
    !dataLoadTimedOut &&
    candidatures.length === 0
  ) {
    return <LoadingScreen message="Chargement des données…" />;
  }

  if (session && dataError && !isDataInitialized && candidatures.length === 0) {
    return (
      <ConfigErrorScreen
        message={`Impossible de charger les données : ${dataError}`}
      />
    );
  }

  // Non authentifié → écran de connexion
  if (!session) {
    return <LoginView />;
  }

  // Sous-vue détail de dossier — pleine largeur, padding réduit
  if (safeView === "candidatures" && selectedDossierId) {
    const dossier = candidatures.find((c) => c.id === selectedDossierId);
    if (dossier) {
      return (
        <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <DossierDetailView dossier={dossier} />
            </main>
          </div>
          <ModalHost />
        </div>
      );
    }
  }

  // Sous-vue détail d'étudiant — pleine largeur, padding réduit
  if (safeView === "etudiants" && selectedEtudiantId) {
    const etudiant = etudiants.find((e) => e.id === selectedEtudiantId);
    if (etudiant) {
      return (
        <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <EtudiantDetailView etudiant={etudiant} />
            </main>
          </div>
          <ModalHost />
        </div>
      );
    }
  }

  const ActiveView = views[safeView] ?? DashboardView;
  const isFullWidthView = FULL_WIDTH_VIEWS.includes(safeView);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main
          className={
            isFullWidthView
              ? "flex-1 overflow-y-auto"
              : "flex-1 overflow-y-auto px-4 py-6 lg:px-8"
          }
        >
          <ActiveView />
        </main>
      </div>

      <ModalHost />
    </div>
  );
}

