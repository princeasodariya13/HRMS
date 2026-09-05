'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LeaveTrendData { month: string; approved: number; rejected: number; pending: number; }
export function LeaveTrendChart({ data }: { data: LeaveTrendData[] }) {
  if (!data?.length) return <div className="flex items-center justify-center h-full text-sm text-[#9CA3AF]">No leave data available</div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.15)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#F3F4F6', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="approved" name="Approved" fill="#10B981" radius={[3,3,0,0]} />
        <Bar dataKey="rejected" name="Rejected" fill="#EF4444" radius={[3,3,0,0]} />
        <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[3,3,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
