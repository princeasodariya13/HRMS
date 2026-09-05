'use client';
import { useState, useTransition } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import { explainMyPayslip } from './actions';

export function PayslipExplainerButton({ payslipId }: { payslipId: string }) {
  const [result, setResult] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [isPending, startTransition] = useTransition();

  const explain = () => {
    startTransition(async () => {
      const res = await explainMyPayslip(payslipId);
      if ('data' in res) { setResult(res.data); setShow(true); }
      else alert(res.error);
    });
  };

  return (
    <div>
      <button
        onClick={explain}
        disabled={isPending}
        className="flex items-center gap-1.5 text-xs font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        {isPending ? 'Generating...' : 'Explain with AI'}
      </button>
      {show && result && (
        <div className="mt-3 bg-[#111827] dark:bg-[#0F172A] rounded-xl p-5 border border-[#1f2937] relative">
          <button onClick={() => setShow(false)} className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white">AI Payslip Explanation</span>
          </div>
          <pre className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed font-sans">{result}</pre>
        </div>
      )}
    </div>
  );
}
