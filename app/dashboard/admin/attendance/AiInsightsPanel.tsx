'use client';
import { useState, useTransition } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { getAttendanceInsights } from '@/lib/ai/attendance-insights';

export function AiInsightsPanel({ companyId, userId }: { companyId: string; userId: string }) {
  const [result, setResult] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const runScan = () => {
    startTransition(async () => {
      const text = await getAttendanceInsights(companyId, userId);
      setResult(text);
      setOpen(true);
    });
  };

  return (
    <div className="bg-[#111827] dark:bg-[#F3F4F6] rounded-2xl p-5 text-white dark:text-[#111827]">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-semibold text-sm">AI Attendance Insights</h3>
            <p className="text-xs text-white/60 dark:text-[#6B7280]">Get AI-powered insights from last 30 days</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <button onClick={() => setOpen(o => !o)} className="text-xs text-white/70 dark:text-[#6B7280] flex items-center gap-1 hover:text-white transition-colors">
              {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />} {open ? 'Hide' : 'Show'} Insights
            </button>
          )}
          <button
            onClick={runScan}
            disabled={isPending}
            className="flex items-center gap-2 bg-white dark:bg-[#111827] text-[#111827] dark:text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#F3F4F6] dark:hover:bg-[#1f2937] transition-colors disabled:opacity-60"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isPending ? 'Analyzing...' : 'Get AI Insights'}
          </button>
        </div>
      </div>
      {open && result && (
        <div className="mt-4 pt-4 border-t border-white/10 dark:border-[#111827]/10">
          <pre className="text-xs text-white/80 dark:text-[#374151] whitespace-pre-wrap leading-relaxed font-sans">{result}</pre>
        </div>
      )}
    </div>
  );
}
