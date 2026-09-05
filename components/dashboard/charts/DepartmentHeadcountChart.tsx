'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4'];
interface DeptData { department: string; count: number; }

export function DepartmentHeadcountChart({ data }: { data: DeptData[] }) {
  if (!data?.length) return <div className="flex items-center justify-center h-full text-sm text-[#9CA3AF]">No department data</div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.15)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={90} />
        <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#F3F4F6', fontSize: 12 }} />
        <Bar dataKey="count" name="Employees" radius={[0,4,4,0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
