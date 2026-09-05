"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ChartPoint = { name: string; value: number };

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function PayrollDashboardCharts({
  departmentData,
  trendData,
}: {
  departmentData: ChartPoint[];
  trendData: ChartPoint[];
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Salary Cost by Department</h2>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Paid net salary for the selected period</p>
          </div>
        </div>
        <div className="h-72">
          {departmentData.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => money(Number(value))} />
                <Bar dataKey="value" name="Net salary" fill="#2563EB" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Monthly Net Salary Trend</h2>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Paid net salary across the last 12 months</p>
        </div>
        <div className="h-72">
          {trendData.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => money(Number(value))} />
                <Line type="monotone" dataKey="value" name="Net salary" stroke="#059669" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyChart() {
  return <div className="h-full flex items-center justify-center text-sm text-[#9CA3AF]">No paid payroll data for this view.</div>;
}