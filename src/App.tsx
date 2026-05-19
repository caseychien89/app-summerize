/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Send, 
  Copy, 
  Check, 
  Trash2, 
  Loader2, 
  Globe, 
  ListTodo, 
  Calendar,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

// Utility for Tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Stats for the Bento grid
  const charCount = input.length;
  const estimatedTime = Math.ceil(charCount / 500) * 1.5 || 0;

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('請輸入會議內容或逐字稿');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '生成的過程中發生錯誤');
      }

      const data = await response.json();
      setOutput(data.result);
      
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setError(err.message || '連線失敗，請檢查網路或稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 flex flex-col">
      {/* Navbar */}
      <nav className="h-16 border-b border-slate-200 bg-white px-6 md:px-12 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">AI 會議助手</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider hidden sm:inline">v2.4 PRO</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 text-sm text-slate-500 font-medium">
            <span className="text-indigo-600 border-b-2 border-indigo-600 px-1 pb-1">記錄生成</span>
            <span className="hover:text-slate-800 cursor-pointer transition-colors px-1">翻譯歷史</span>
            <span className="hover:text-slate-800 cursor-pointer transition-colors px-1">設定</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
            <Globe className="w-5 h-5" />
          </div>
        </div>
      </nav>

      {/* Main Content Area (Bento Layout) */}
      <main className="flex-1 p-6 md:p-10 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 auto-rows-min">
          
          {/* Input Panel (Bento Card - spans rows) */}
          <section className="lg:col-span-5 lg:row-span-2 flex flex-col min-h-[600px] bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                會議內容輸入
              </h3>
              <div className="flex items-center gap-3">
                {input && (
                  <button 
                    onClick={() => setInput('')}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    清除
                  </button>
                )}
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">逐字稿 / 筆記</span>
              </div>
            </div>
            
            <div className="flex-1 relative flex flex-col">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此貼上您的會議記錄或逐字稿，按下方按鈕讓 AI 幫您整理..."
                className={cn(
                  "flex-1 w-full p-5 bg-slate-50/50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-300",
                  "resize-none text-[15px] leading-relaxed text-slate-600 placeholder:text-slate-300 transition-all",
                  error && "border-red-200 focus:ring-red-500/5 focus:border-red-300"
                )}
              />
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-red-500 font-bold flex items-center gap-1">
                  * {error}
                </motion.p>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                disabled={isLoading || !input.trim()}
                onClick={handleGenerate}
                className={cn(
                  "flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl",
                  "shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]",
                  "disabled:opacity-30 disabled:shadow-none disabled:active:scale-100"
                )}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>AI 正在分析中...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>生成總結與翻譯</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Results Area (The main output) */}
          <section className="lg:col-span-7 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden" ref={outputRef}>
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                AI 整理結果
              </h3>
              {output && !isLoading && (
                <button
                  onClick={handleCopy}
                  className={cn(
                    "text-xs font-bold px-4 py-2 rounded-xl transition-all border",
                    isCopied 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                      : "bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                  )}
                >
                  {isCopied ? "已複製到剪貼簿" : "一鍵複製全文"}
                </button>
              )}
            </div>
            
            <div className="flex-1 p-8 md:p-10 min-h-[400px]">
              <AnimatePresence mode="wait">
                {!output && !isLoading ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30"
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center rotate-3">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-medium">準備緒 ... 點擊生成按鈕展開魔法</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={cn("transition-opacity", isLoading && "opacity-40")}
                  >
                    {isLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[2px] z-20">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 transition-all" />
                        <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">正在建構結構化文稿...</p>
                      </div>
                    )}
                    <div className="prose prose-slate prose-indigo max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-strong:text-indigo-900 prose-li:my-1">
                      <ReactMarkdown>{output}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Configuration Card */}
          <section className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5">設定與參數</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-bold text-slate-500">輸出的語言</span>
                <span className="text-xs font-bold text-indigo-600 bg-white px-2 py-1 rounded-md border border-indigo-100">繁中 + 英文</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-bold text-slate-500">使用的模型</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Gemini Flash</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-bold text-slate-500">專注模式</span>
                <div className="w-8 h-4 bg-indigo-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Processing Info Info Card */}
          <section className="lg:col-span-3 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-200 border border-indigo-500 p-6 text-white flex flex-col justify-between">
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em]">處理資訊</h4>
              <div className="text-3xl font-black">{charCount.toLocaleString()} <span className="text-xs font-medium opacity-60">字元</span></div>
            </div>
            
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] bg-white/10 p-2.5 rounded-xl border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                預計處理時間約 {estimatedTime} 秒
              </div>
              <p className="text-[10px] opacity-60 font-medium">
                長內容建議分段處理以確保最佳精準度
              </p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-10 bg-white border-t border-slate-100 px-6 md:px-12 flex items-center justify-between text-[10px] text-slate-400 shrink-0 font-bold uppercase tracking-widest">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span>系統狀態：正常運作中</span>
          </div>
          <span className="hidden sm:inline">Latency: 42ms</span>
        </div>
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-1 group cursor-pointer hover:text-slate-600 transition-colors">
            <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
            版本 2.4.0
          </span>
          <span className="opacity-40">AI Meeting Assistant © 2026</span>
        </div>
      </footer>
    </div>
  );
}
