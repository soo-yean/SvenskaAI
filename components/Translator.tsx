import React, { useState } from 'react';
import { translateAndExplain } from '../services/geminiService';
import { ArrowRightLeft, Sparkles, Copy, Check } from 'lucide-react';

const Translator: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{translation: string, explanation: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const data = await translateAndExplain(input);
    setResult(data);
    setLoading(false);
  };

  const copyToClipboard = () => {
      if(result) {
          navigator.clipboard.writeText(result.translation);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Smart Translator</h2>
            <p className="text-slate-400">Not just translation. Understanding.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col h-80">
             <label className="text-sm font-semibold text-slate-400 mb-2 uppercase">Input (Swedish or English)</label>
             <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type here..."
                className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-lg text-white placeholder-slate-600"
             />
             <div className="flex justify-end mt-4">
                 <button
                    onClick={handleTranslate}
                    disabled={loading || !input.trim()}
                    className="flex items-center space-x-2 bg-sweden-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-sweden-dark transition-colors disabled:opacity-50"
                 >
                     {loading ? <Sparkles className="animate-spin" size={18} /> : <ArrowRightLeft size={18} />}
                     <span>{loading ? 'Analyzing...' : 'Translate'}</span>
                 </button>
             </div>
          </div>

          {/* Output */}
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col h-80 relative overflow-hidden">
             {result ? (
                 <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                    <label className="text-sm font-semibold text-sweden-yellow mb-2 uppercase">Result</label>
                    <div className="mb-6 relative group">
                        <p className="text-2xl font-light text-white leading-relaxed">{result.translation}</p>
                        <button 
                            onClick={copyToClipboard}
                            className="absolute top-0 right-0 p-2 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        >
                            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                    </div>
                    
                    <div className="mt-auto bg-slate-900/50 rounded-xl p-4 border border-white/5 overflow-y-auto">
                        <div className="flex items-center space-x-2 mb-2">
                             <Sparkles size={14} className="text-sweden-blue"/>
                             <span className="text-xs font-bold text-slate-400 uppercase">AI Insight</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{result.explanation}</p>
                    </div>
                 </div>
             ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                     <LanguagesIcon />
                     <p className="mt-4 text-sm">Enter text to see magic happen</p>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};

const LanguagesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20">
        <path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="m22 22-5-10-5 10" /><path d="M14 18h6" />
    </svg>
)

export default Translator;
