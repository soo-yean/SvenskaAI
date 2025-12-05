import React, { useState, useRef, useEffect } from 'react';
import { generateChatResponse, generateSpeech } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, User, Bot, Volume2, Loader2, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatTutor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hej! Jag heter Sven. Hur mår du idag? (Hi! I am Sven. How are you today?)' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await generateChatResponse(messages.concat(userMsg), input);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const playMessageAudio = async (msg: ChatMessage) => {
    // Stop any currently playing audio
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      setPlayingAudioId(null);
    }

    // If clicking the same message that is playing, just stop.
    if (playingAudioId === msg.id) {
        return; 
    }

    setPlayingAudioId(msg.id);
    const buffer = await generateSpeech(msg.text, 'Fenrir'); // Sven voice
    
    if (buffer) {
        if (!audioContextRef.current) {
             audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        // Check if context is suspended (browser policy)
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => setPlayingAudioId(null);
        
        audioSourceRef.current = source;
        source.start(0);
    } else {
        setPlayingAudioId(null);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-slate-800/50 rounded-2xl border border-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-slate-900/50 flex items-center justify-between">
         <div className="flex items-center space-x-3">
            <div className="bg-sweden-blue p-2 rounded-lg">
                <Bot className="text-white" size={24} />
            </div>
            <div>
                <h2 className="font-bold text-white">Sven</h2>
                <p className="text-xs text-sweden-yellow">Swedish Tutor • Gemini Powered</p>
            </div>
         </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-indigo-600' : 'bg-sweden-blue'
                }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className={`
                    p-4 rounded-2xl relative group
                    ${msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-700 text-slate-100 rounded-tl-none border border-slate-600'}
                `}>
                    <div className="prose prose-invert prose-sm">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    
                    {msg.role === 'model' && (
                        <button 
                            onClick={() => playMessageAudio(msg)}
                            className="absolute -right-10 top-2 p-2 text-slate-400 hover:text-sweden-yellow transition-colors opacity-0 group-hover:opacity-100"
                            title="Listen"
                        >
                            {playingAudioId === msg.id ? <StopCircle size={18} className="text-sweden-yellow animate-pulse"/> : <Volume2 size={18} />}
                        </button>
                    )}
                </div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-slate-700/50 p-3 rounded-2xl rounded-tl-none flex items-center space-x-2 ml-11">
                    <Loader2 size={16} className="animate-spin text-sweden-blue" />
                    <span className="text-xs text-slate-400">Sven is thinking...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/50 border-t border-white/10">
        <div className="flex items-end gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700 focus-within:border-sweden-blue transition-colors">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Skriv något... (Type something...)"
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 resize-none h-12 py-3 px-2 max-h-32"
            />
            <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-3 bg-sweden-blue text-white rounded-lg hover:bg-sweden-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Send size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTutor;
