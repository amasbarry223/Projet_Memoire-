import { cn } from "@/lib/utils";
import { stats } from "./data";

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full",
                  stat.iconBg
                )}
              >
                <Icon className={cn("size-5", stat.iconColor)} />
              </div>
              <span
                className={cn(
                  "size-2.5 rounded-full ring-4 ring-emerald-50",
                  stat.statusColor
                )}
                title="Live"
              />
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-xs font-medium text-gray-500">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
