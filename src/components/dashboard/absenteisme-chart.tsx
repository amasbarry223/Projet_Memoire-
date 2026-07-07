"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDataStore } from "@/lib/data-store";

type TooltipPayload = {
  payload: { mois: string; taux: number };
};

function AbsenteismeTooltip({
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
      <p className="mt-1 text-red-600">
        Taux d&apos;absentéisme :{" "}
        <span className="font-semibold">{data.taux}%</span>
      </p>
    </div>
  );
}

export function AbsenteismeChart() {
  const chartData = useDataStore((s) => s.absentéismeParMois);

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900">
          Taux d&apos;absentéisme
        </h3>
        <p className="mt-8 text-center text-sm text-gray-400">
          Aucune donnée disponible pour le moment.
        </p>
      </div>
    );
  }

  const maxTaux = Math.max(...chartData.map((d) => d.taux), 1);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Taux d&apos;absentéisme
          </h3>
          <p className="text-xs text-gray-400">Moyenne mensuelle (%)</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
          <span className="size-2 rounded-full bg-red-500" />
          Objectif &lt; 8%
        </div>
      </div>
      <div className="h-[220px] sm:h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 12, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="absFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F00000" stopOpacity={0.30} />
                <stop offset="100%" stopColor="#F00000" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(value) => `${value}%`}
              domain={[0, Math.ceil(maxTaux * 1.2)]}
            />
            <Tooltip content={<AbsenteismeTooltip />} />
            <Area
              type="monotone"
              dataKey="taux"
              stroke="#F00000"
              strokeWidth={3}
              fill="url(#absFill)"
              dot={{ r: 4, fill: "#F00000", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#F00000", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
