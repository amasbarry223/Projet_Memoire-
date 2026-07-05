import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { FeesChart } from "@/components/dashboard/fees-chart";
import { BusTracking } from "@/components/dashboard/bus-tracking";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { TodaySchedule } from "@/components/dashboard/today-schedule";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
            <WelcomeSection />

            <div className="space-y-6">
              <StatsCards />

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <AttendanceChart />
                <FeesChart />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <BusTracking />
                <UpcomingEvents />
              </div>
            </div>
          </main>

          {/* Right sidebar */}
          <aside className="hidden w-[340px] shrink-0 overflow-y-auto border-l border-gray-100 bg-white px-4 py-6 xl:block">
            <div className="space-y-6">
              <CalendarWidget />
              <TodaySchedule />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
