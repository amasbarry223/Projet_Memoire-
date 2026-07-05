"use client";

import { WelcomeSection } from "../welcome-section";
import { StatsCards } from "../stats-cards";
import { InscriptionsChart } from "../inscriptions-chart";
import { AbsenteismeChart } from "../absenteisme-chart";
import { N8nStatus } from "../n8n-status";
import { DossiersRecents } from "../dossiers-recents";
import { CalendarWidget } from "../calendar-widget";
import { AlertesIA } from "../alertes-ia";

export function DashboardView() {
  return (
    <div className="space-y-6">
      <WelcomeSection />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        {/* Colonne principale */}
        <div className="space-y-6 min-w-0">
          <StatsCards />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <InscriptionsChart />
            <AbsenteismeChart />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <N8nStatus />
            <DossiersRecents />
          </div>
        </div>

        {/* Colonne droite */}
        <aside className="hidden xl:block space-y-6">
          <div className="xl:sticky xl:top-0 space-y-6">
            <CalendarWidget />
            <AlertesIA />
          </div>
        </aside>
      </div>
    </div>
  );
}
