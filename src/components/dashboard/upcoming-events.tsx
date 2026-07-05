import { ChevronRight } from "lucide-react";
import { upcomingEvents } from "./data";

const extraEvents = [
  {
    day: "08",
    title: "Parent-Teacher Meeting",
    date: "Nov 08, 2023",
    tag: "Meeting",
    tagBg: "bg-amber-50 text-amber-600",
  },
  {
    day: "15",
    title: "Mid-Term Examinations",
    date: "Nov 15, 2023",
    tag: "Exam",
    tagBg: "bg-red-50 text-red-500",
  },
];

export function UpcomingEvents() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          Upcoming Events
        </h3>
        <button className="flex items-center gap-1 text-xs font-medium text-emerald-600 transition hover:text-emerald-700">
          View All
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      <ul className="space-y-3">
        {upcomingEvents.map((event, idx) => (
          <li
            key={idx}
            className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50"
          >
            <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-emerald-500 text-white">
              <span className="text-lg font-bold leading-none">
                {event.day}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-white/80">
                Nov
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {event.title}
              </p>
              <p className="text-xs text-gray-400">{event.date}</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${event.tagBg}`}
            >
              {event.tag}
            </span>
          </li>
        ))}

        {extraEvents.map((event, idx) => (
          <li
            key={`extra-${idx}`}
            className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50"
          >
            <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <span className="text-lg font-bold leading-none">
                {event.day}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-gray-400">
                Nov
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {event.title}
              </p>
              <p className="text-xs text-gray-400">{event.date}</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${event.tagBg}`}
            >
              {event.tag}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
