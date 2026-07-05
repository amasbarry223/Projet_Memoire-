import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { InscriptionsChart } from "@/components/dashboard/inscriptions-chart";
import { AbsenteismeChart } from "@/components/dashboard/absenteisme-chart";
import { N8nStatus } from "@/components/dashboard/n8n-status";
import { DossiersRecents } from "@/components/dashboard/dossiers-recents";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { AlertesIA } from "@/components/dashboard/alertes-ia";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          {/* Contenu principal */}
          <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
            <WelcomeSection />

            <div className="space-y-6">
              <StatsCards />

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <InscriptionsChart />
                <AbsenteismeChart />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <N8nStatus />
                <DossiersRecents />
              </div>
            </div>
          </main>

          {/* Barre latérale droite */}
          <aside className="hidden w-[340px] shrink-0 overflow-y-auto border-l border-gray-100 bg-white px-4 py-6 xl:block">
            <div className="space-y-6">
              <CalendarWidget />
              <AlertesIA />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
