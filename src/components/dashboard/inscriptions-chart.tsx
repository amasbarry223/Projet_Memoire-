"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { inscriptionsParMois } from "./data";

type TooltipPayload = {
  payload: { mois: string; inscriptions: number };
};

function InscriptionsTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-900">{data.mois}</p>
      <p className="mt-1 text-emerald-600">
        Inscriptions :{" "}
        <span className="font-semibold">{data.inscriptions}</span>
      </p>
    </div>
  );
}

export function InscriptionsChart() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Évolution des inscriptions
          </h3>
          <p className="text-xs text-gray-400">Nouveaux dossiers par mois</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
          <span className="size-2 rounded-full bg-emerald-500" />
          2024
        </div>
      </div>
      <div className="h-[220px] sm:h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={inscriptionsParMois}
            barGap={4}
            margin={{ top: 10, right: 0, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="mois"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              domain={[0, 300]}
              ticks={[0, 75, 150, 225, 300]}
            />
            <Tooltip
              cursor={{ fill: "rgba(16, 185, 129, 0.06)" }}
              content={<InscriptionsTooltip />}
            />
            <Bar
              dataKey="inscriptions"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
