import { Clock } from "lucide-react";
import { todaySchedule } from "./data";

export function TodaySchedule() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Today&apos;s Schedule
          </h3>
          <p className="text-xs text-gray-400">4 meetings planned</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <Clock className="size-4" />
        </div>
      </div>

      <ul className="space-y-3">
        {todaySchedule.map((item, idx) => (
          <li key={idx} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center">
              <span className={`mt-1 size-2.5 rounded-full ${item.indicatorColor}`} />
              {idx < todaySchedule.length - 1 && (
                <span className="my-1 w-px flex-1 bg-gray-200" />
              )}
            </div>
            <div className="flex-1 pb-2">
              <p className="text-sm font-semibold text-gray-900">
                {item.title}
              </p>
              <p className="text-xs text-gray-400">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
