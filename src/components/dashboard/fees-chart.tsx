"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { monthlyFees } from "./data";

type TooltipPayload = {
  payload: { month: string; revenue: number };
};

function FeesTooltip({
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
      <p className="font-semibold text-gray-900">{data.month}</p>
      <p className="mt-1 text-amber-500">
        Revenue:{" "}
        <span className="font-semibold">${data.revenue.toLocaleString()}</span>
      </p>
    </div>
  );
}

export function FeesChart() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Monthly Fees Revenue
          </h3>
          <p className="text-xs text-gray-400">Collected fees (USD)</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
          <span className="size-2 rounded-full bg-amber-500" />
          2024
        </div>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={monthlyFees}
            margin={{ top: 10, right: 12, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="feesLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}k`}
              domain={[15000, 26000]}
              ticks={[15000, 18000, 21000, 24000]}
            />
            <Tooltip content={<FeesTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="url(#feesLine)"
              strokeWidth={3}
              dot={{ r: 4, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
