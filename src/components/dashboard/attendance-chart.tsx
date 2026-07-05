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
import { weeklyAttendance } from "./data";

type TooltipPayload = {
  payload: { day: string; present: number; absent: number };
};

function AttendanceTooltip({
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
      <p className="font-semibold text-gray-900">{data.day}</p>
      <p className="mt-1 text-emerald-600">
        Present: <span className="font-semibold">{data.present.toLocaleString()}</span>
      </p>
      <p className="text-red-500">
        Absent: <span className="font-semibold">{data.absent}</span>
      </p>
    </div>
  );
}

export function AttendanceChart() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Weekly Attendance
          </h3>
          <p className="text-xs text-gray-400">Present vs Absent students</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-gray-600">
            <span className="size-2.5 rounded-full bg-emerald-500" /> Present
          </span>
          <span className="flex items-center gap-1.5 text-gray-600">
            <span className="size-2.5 rounded-full bg-emerald-200" /> Absent
          </span>
        </div>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyAttendance}
            barGap={4}
            margin={{ top: 10, right: 0, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              domain={[0, 2500]}
              ticks={[0, 500, 1000, 1500, 2000, 2500]}
            />
            <Tooltip
              cursor={{ fill: "rgba(16, 185, 129, 0.06)" }}
              content={<AttendanceTooltip />}
            />
            <Bar
              dataKey="present"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="absent"
              fill="#a7f3d0"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
