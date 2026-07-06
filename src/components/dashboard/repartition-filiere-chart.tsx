"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useDataStore } from "@/lib/data-store";
import { BookOpen } from "lucide-react";

const COLORS = ["#0048C0", "#F00000", "#C8961E", "#0060A8", "#6B7280"];

type TooltipPayload = {
  payload: { name: string; value: number; total: number };
};

function FiliereTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const pct = data.total > 0 ? Math.round((data.value / data.total) * 100) : 0;
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-900">{data.name}</p>
      <p className="mt-0.5 text-blue-600">
        {data.value} étudiants · {pct}%
      </p>
    </div>
  );
}

export function RepartitionFiliereChart() {
  const etudiants = useDataStore((s) => s.etudiants);

  // Groupe les étudiants par filière
  const parFiliere = etudiants.reduce<Record<string, number>>((acc, e) => {
    acc[e.filiere] = (acc[e.filiere] ?? 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(parFiliere).map(([name, value]) => ({
    name,
    value,
    total: etudiants.length,
  }));

  const total = etudiants.length;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Répartition par filière
          </h3>
          <p className="text-xs text-gray-400">{total} étudiants au total</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-full bg-blue-50 text-blue-500">
          <BookOpen className="size-4" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="relative h-[180px] w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<FiliereTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Total au centre */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{total}</span>
            <span className="text-[10px] text-gray-400">étudiants</span>
          </div>
        </div>

        {/* Légende */}
        <div className="flex-1 space-y-2">
          {data.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="flex-1 truncate text-xs font-medium text-gray-700">
                {item.name}
              </span>
              <span className="text-xs font-bold text-gray-900">
                {item.value}
              </span>
              <span className="text-[10px] text-gray-400">
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
          {data.length === 0 && (
            <p className="text-xs text-gray-400">Aucune donnée</p>
          )}
        </div>
      </div>
    </div>
  );
}
