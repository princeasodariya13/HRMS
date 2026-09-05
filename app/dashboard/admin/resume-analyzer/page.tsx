"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  FileText, 
  UploadCloud, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Lightbulb,
  AlertTriangle,
  Loader2,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

// Simple Gauge Component for the Score
function ScoreGauge({ score }: { score: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = "text-red-500";
  if (score >= 70) color = "text-yellow-500";
  if (score >= 85) color = "text-green-500";

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
        <circle
          className="text-gray-200 dark:text-gray-800"
          strokeWidth="12"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="70"
          cy="70"
        />
        <motion.circle
          className={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="70"
          cy="70"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-bold text-gray-900 dark:text-white">
          {score}
        </span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Match
        </span>
      </div>
    </div>
  );
}

export default function ResumeAnalyzerPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [fileData, setFileData] = useState<{ base64: string, mimeType: string, name: string } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [result]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target?.result as string);
        setFileData(null);
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(',')[1];
        let mimeType = file.type;
        if (file.name.endsWith('.pdf')) mimeType = 'application/pdf';
        
        setFileData({
          base64,
          mimeType: mimeType || 'application/octet-stream',
          name: file.name
        });
        setResumeText(`[Attached File: ${file.name}]`);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      setError("Please provide the candidate's resume text.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, fileData })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      setResult(data.result);
      setIsMock(data.isMock);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Bot className="w-6 h-6" />
            </div>
            AI Resume Analyzer
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-2xl">
            Leverage Google Gemini AI to instantly analyze candidate resumes, compare them against your job descriptions, and generate actionable insights.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-all">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-500" />
              Job Description (Optional)
            </h2>
            <textarea
              className="w-full h-32 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1E293B] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Paste the job description here to get a tailored fit score..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Candidate Resume *
              </h2>
              <label className="cursor-pointer flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                <UploadCloud className="w-4 h-4" />
                Upload PDF / File
                <input type="file" className="hidden" accept=".txt,.pdf,.doc,.docx" onChange={handleFileUpload} />
              </label>
            </div>
            <textarea
              className="w-full h-64 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1E293B] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Paste the candidate's resume text here or upload a PDF document above..."
              value={resumeText}
              disabled={!!fileData}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          <button
            onClick={analyzeResume}
            disabled={isAnalyzing || !resumeText.trim()}
            className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Resume with AI...
              </>
            ) : (
              <>
                <Bot className="w-5 h-5" />
                Generate AI Analysis
              </>
            )}
          </button>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!result && !isAnalyzing ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-[#0F172A]/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700"
              >
                <div className="w-20 h-20 mb-6 rounded-full bg-white dark:bg-[#1E293B] flex items-center justify-center shadow-sm">
                  <Bot className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ready to Analyze</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Paste a resume and an optional job description on the left to get a comprehensive AI-powered breakdown of the candidate.
                </p>
              </motion.div>
            ) : isAnalyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8"
              >
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                  <Bot className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Reading Candidate Profile...</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Our AI is currently matching skills, experience, and qualifications.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                ref={resultsRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pt-4"
              >
                {isMock && (
                  <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      <strong>Demo Mode:</strong> No <code className="bg-yellow-100 dark:bg-yellow-800/40 px-1 rounded">GEMINI_API_KEY</code> was found in the environment. Displaying a mock analysis. To use live AI, add a valid API key to your <code className="bg-yellow-100 dark:bg-yellow-800/40 px-1 rounded">.env</code> file.
                    </p>
                  </div>
                )}

                <div className="bg-white dark:bg-[#0F172A] rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 mb-10">
                    <ScoreGauge score={result?.score || 0} />
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Summary</h2>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {result?.summary}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {/* Strengths */}
                    <div className="bg-gray-50 dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Key Strengths
                      </h3>
                      <ul className="space-y-3">
                        {result?.strengths?.map((strength: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <ChevronRight className="w-4 h-4 text-green-500 shrink-0 mt-1" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="bg-gray-50 dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        <XCircle className="w-5 h-5 text-red-500" />
                        Potential Weaknesses
                      </h3>
                      <ul className="space-y-3">
                        {result?.weaknesses?.map((weakness: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <ChevronRight className="w-4 h-4 text-red-500 shrink-0 mt-1" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mt-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30 relative z-10">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                      <Lightbulb className="w-5 h-5 text-blue-500" />
                      Actionable Recommendations
                    </h3>
                    <ul className="space-y-3">
                      {result?.recommendations?.map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-2"></div>
                          <span className="text-sm text-blue-800 dark:text-blue-200/80">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 flex justify-end relative z-10">
                    <button 
                      onClick={() => setResult(null)}
                      className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Analyze Another Resume
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
