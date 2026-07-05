"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Semaine commençant le lundi (format français)
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

// Marqueurs d'événements : jour -> couleur du point
const EVENT_DAYS: Record<number, string> = {
  3: "bg-amber-400",
  8: "bg-orange-500",
  12: "bg-red-500",
  15: "bg-amber-400",
  22: "bg-emerald-500",
  28: "bg-orange-500",
};

export function CalendarWidget() {
  const [currentDay, setCurrentDay] = useState(1);

  // Novembre 2024 : le 1er est un vendredi.
  // Semaine commençant le lundi => 4 cases vides (lun, mar, mer, jeu) avant le 1.
  const startDay = 4;
  const daysInMonth = 30;
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Novembre, Jeudi 1</p>
          <h3 className="text-base font-semibold text-gray-900">
            Novembre 2024
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Mois suivant"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className="flex h-8 items-center justify-center text-xs font-semibold text-gray-400"
          >
            {d}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={idx} className="h-9" />;
          }
          const isToday = day === currentDay;
          const dotColor = EVENT_DAYS[day];
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentDay(day)}
              className={cn(
                "relative flex h-9 items-center justify-center rounded-lg text-sm transition",
                isToday
                  ? "bg-emerald-500 font-semibold text-white shadow-sm shadow-emerald-500/30"
                  : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
              )}
            >
              {day}
              {dotColor && !isToday && (
                <span
                  className={cn(
                    "absolute bottom-1 size-1.5 rounded-full",
                    dotColor
                  )}
                />
              )}
              {dotColor && isToday && (
                <span className="absolute bottom-1 size-1.5 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-400" /> Événement
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-orange-500" /> Réunion
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-red-500" /> Examen
        </span>
      </div>
    </div>
  );
}
