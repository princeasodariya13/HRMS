'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';

interface PayrollCostData { month: string; amount: number; }
function fmt(n: number) { if (n >= 100000) return `₹${(n/100000).toFixed(1)}L`; if (n >= 1000) return `₹${(n/1000).toFixed(0)}K`; return `₹${n}`; }

export function PayrollCostTrendChart({ data }: { data: PayrollCostData[] }) {
  if (!data?.length) return <div className="flex items-center justify-center h-full text-sm text-[#9CA3AF]">No payroll data</div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.15)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v) => [`₹${Number(v || 0).toLocaleString('en-IN')}`, 'Payroll Cost']} contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#F3F4F6', fontSize: 12 }} />
        <Line type="monotone" dataKey="amount" name="Payroll Cost" stroke="#6366F1" strokeWidth={2.5} dot={{ fill: '#6366F1', r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
