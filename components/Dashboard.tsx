import React, { useEffect, useState } from 'react';
import { generateDailyWord, generateSpeech } from '../services/geminiService';
import { Loader2, Volume2, RefreshCw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [wordData, setWordData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const fetchWord = async () => {
    setLoading(true);
    const data = await generateDailyWord();
    setWordData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playPronunciation = async () => {
    if (!wordData || audioPlaying) return;
    setAudioPlaying(true);
    
    try {
        const audioBuffer = await generateSpeech(wordData.swedish);
        if (audioBuffer) {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => {
                setAudioPlaying(false);
                ctx.close();
            };
            source.start(0);
        } else {
            setAudioPlaying(false);
        }
    } catch (e) {
        console.error("Playback failed", e);
        setAudioPlaying(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Välkommen tillbaka!</h1>
        <p className="text-slate-400">Ready to learn some Swedish today?</p>
      </header>

      {/* Word of the Day Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-50">
            <div className="w-24 h-24 bg-sweden-yellow/20 rounded-full blur-2xl"></div>
        </div>
        
        <div className="flex justify-between items-start mb-6">
            <h2 className="text-sweden-yellow font-semibold tracking-wider uppercase text-sm">Dagens Ord (Word of the Day)</h2>
            <button onClick={fetchWord} className="text-slate-400 hover:text-white transition-colors" disabled={loading}>
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="animate-spin text-sweden-blue" size={40} />
          </div>
        ) : wordData ? (
          <div className="space-y-6">
            <div className="flex items-end space-x-4">
                <h3 className="text-5xl md:text-6xl font-bold text-white tracking-tight">{wordData.swedish}</h3>
                <button 
                    onClick={playPronunciation}
                    className="p-3 rounded-full bg-sweden-blue/20 hover:bg-sweden-blue text-sweden-blue hover:text-white transition-all mb-2"
                    aria-label="Listen"
                >
                    <Volume2 size={24} className={audioPlaying ? 'animate-pulse' : ''} />
                </button>
            </div>
            
            <p className="text-2xl text-slate-300 font-light">{wordData.english}</p>

            <div className="bg-black/20 rounded-xl p-4 border-l-4 border-sweden-yellow">
                <p className="text-lg text-white mb-1 italic">"{wordData.exampleSentence}"</p>
                <p className="text-slate-400 text-sm">{wordData.exampleTranslation}</p>
            </div>

            <div className="flex items-center space-x-2 text-sm text-sweden-blue bg-sweden-blue/10 px-3 py-2 rounded-lg w-fit">
                <span className="font-semibold">Tip:</span>
                <span>{wordData.pronunciationTip}</span>
            </div>
          </div>
        ) : (
          <div className="text-center text-red-400">Failed to load word. Try again.</div>
        )}
      </div>

      {/* Quick Stats / Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5 hover:border-sweden-blue/50 transition-colors">
            <div className="text-3xl mb-2">🇸🇪</div>
            <h3 className="font-semibold text-white">Total Immersion</h3>
            <p className="text-sm text-slate-400 mt-1">Chat with Sven to practice natural conversations.</p>
         </div>
         <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5 hover:border-sweden-blue/50 transition-colors">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold text-white">Test Skills</h3>
            <p className="text-sm text-slate-400 mt-1">Take a generated quiz on Food, Travel, or Grammar.</p>
         </div>
         <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5 hover:border-sweden-blue/50 transition-colors">
            <div className="text-3xl mb-2">🔊</div>
            <h3 className="font-semibold text-white">Listen & Speak</h3>
            <p className="text-sm text-slate-400 mt-1">High-quality AI voices to help perfect your accent.</p>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;