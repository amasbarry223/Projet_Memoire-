import { Bus, ArrowRight } from "lucide-react";

export function BusTracking() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-sm">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 size-28 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Bus Tracking</h3>
          <p className="mt-1 text-sm text-white/80">Real-time monitoring</p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
          <Bus className="size-6" />
        </div>
      </div>

      <div className="relative mt-6 flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-emerald-600 shadow-sm transition hover:bg-emerald-50">
          Live Buses
          <ArrowRight className="size-4" />
        </button>
        <button className="rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
          Schedule Today
        </button>
      </div>

      <div className="relative mt-5 flex items-center gap-4 border-t border-white/15 pt-4 text-sm">
        <div>
          <p className="text-2xl font-bold">24</p>
          <p className="text-xs text-white/70">Active routes</p>
        </div>
        <div className="h-8 w-px bg-white/20" />
        <div>
          <p className="text-2xl font-bold">1,842</p>
          <p className="text-xs text-white/70">Students on board</p>
        </div>
      </div>
    </div>
  );
}
