"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

const data = [
  { name: 'Mon', present: 1100, absent: 50, leave: 30 },
  { name: 'Tue', present: 1150, absent: 40, leave: 28 },
  { name: 'Wed', present: 1120, absent: 45, leave: 35 },
  { name: 'Thu', present: 1180, absent: 35, leave: 33 },
  { name: 'Fri', present: 1050, absent: 80, leave: 50 },
];

export function AttendanceTrendChart({ chartData }: { chartData?: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Initial check
    setIsDark(document.documentElement.classList.contains('dark'));
    
    // Observer for class changes on document.documentElement
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  if (!mounted) return <div className="w-full h-full animate-pulse bg-[#F3F4F6] dark:bg-[#1E293B] rounded-xl" />;

  const displayData = chartData || data;

  const color = isDark ? '#F3F4F6' : '#111827';
  const gridColor = isDark ? '#1E293B' : '#E5E7EB';
  const textColor = isDark ? '#9CA3AF' : '#6B7280';
  const tooltipBg = isDark ? '#0F172A' : '#ffffff';
  const tooltipBorder = isDark ? '#1E293B' : '#E5E7EB';

  return (
    <div className="h-full w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={displayData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: textColor, fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: textColor, fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: tooltipBg, borderRadius: '12px', border: `1px solid ${tooltipBorder}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
            itemStyle={{ color: color, fontSize: '14px', fontWeight: 600 }}
          />
          <Area 
            type="monotone" 
            dataKey="present" 
            stroke={color} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPresent)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
