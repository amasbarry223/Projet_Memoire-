"use client";

import { useAppStore } from "@/lib/view-store";
import { useAuthStore } from "@/lib/auth-store";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { LoginView } from "@/components/dashboard/login-view";
import { ModalHost } from "@/components/dashboard/modals/modal-host";
import { DashboardView } from "@/components/dashboard/views/dashboard-view";
import { CandidaturesView } from "@/components/dashboard/views/candidatures-view";
import { EtudiantsView } from "@/components/dashboard/views/etudiants-view";
import { EnseignantsView } from "@/components/dashboard/views/enseignants-view";
import { SuiviView } from "@/components/dashboard/views/suivi-view";
import { AlertesView } from "@/components/dashboard/views/alertes-view";
import { RapportsView } from "@/components/dashboard/views/rapports-view";
import { FilieresView } from "@/components/dashboard/views/filieres-view";
import { UtilisateursView } from "@/components/dashboard/views/utilisateurs-view";
import { AuditView } from "@/components/dashboard/views/audit-view";
import { ParametresView } from "@/components/dashboard/views/parametres-view";
import { roleViews, type ViewKey } from "@/components/dashboard/data";

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

export default function Home() {
  const session = useAuthStore((s) => s.session);
  const view = useAppStore((s) => s.view);

  // RBAC côté rendu : si la vue courante n'est pas autorisée pour le rôle,
  // on affiche la première vue autorisée (sans écrire dans le store pendant le rendu).
  const allowed = session ? roleViews[session.role] : [];
  const safeView: ViewKey =
    !session || allowed.includes(view) ? view : allowed[0] ?? "dashboard";

  // Non authentifié → écran de connexion
  if (!session) {
    return <LoginView />;
  }

  const ActiveView = views[safeView] ?? DashboardView;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          <ActiveView />
        </main>
      </div>

      <ModalHost />
    </div>
  );
}
