"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataStore } from "@/lib/data-store";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function mondayStartOffset(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function CalendarWidget() {
  const absences = useDataStore((s) => s.absences);
  const candidatures = useDataStore((s) => s.candidatures);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const eventDays = useMemo(() => {
    const days = new Map<number, string>();
    for (const a of absences) {
      const d = new Date(a.date.split("/").reverse().join("-") || a.date);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        days.set(d.getDate(), a.justifiee ? "bg-yellow-400" : "bg-red-500");
      }
    }
    for (const c of candidatures) {
      const d = new Date(c.dateSoumission);
      if (!Number.isNaN(d.getTime()) && d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        if (!days.has(d.getDate())) days.set(d.getDate(), "bg-blue-500");
      }
    }
    return days;
  }, [absences, candidatures, viewYear, viewMonth]);

  const startDay = mondayStartOffset(viewYear, viewMonth);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  const weekdayLabel = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs capitalize text-gray-400">{weekdayLabel}</p>
          <h3 className="text-base font-semibold text-gray-900">
            {MONTHS[viewMonth]} {viewYear}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="flex size-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
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
          const isToday = isCurrentMonth && day === today.getDate();
          const dotColor = eventDays.get(day);
          return (
            <button
              key={idx}
              type="button"
              className={cn(
                "relative flex h-9 items-center justify-center rounded-lg text-sm transition",
                isToday
                  ? "bg-blue-500 font-semibold text-white shadow-sm shadow-blue-500/30"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
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
          <span className="size-2 rounded-full bg-blue-500" /> Candidature
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-yellow-400" /> Absence justifiée
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-red-500" /> Absence
        </span>
      </div>
    </div>
  );
}
