'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { Send, Mic, Bot, User, Sparkles, Loader2, Volume2, Zap, Rocket, Heart } from 'lucide-react';

export default function IdeaSpeak() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
  });

  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Voice STT + TTS (kept from previous)
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const rec = recognitionRef.current;
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setVoiceTranscript(finalTranscript + interimTranscript);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleVoice = () => {
    const rec = recognitionRef.current;
    if (!rec) return alert('Speech recognition not supported');
    if (isListening) {
      rec.stop();
    } else {
      setVoiceTranscript('');
      rec.start();
      setIsListening(true);
    }
  };

  const useVoiceTranscript = () => {
    if (voiceTranscript.trim()) {
      append({ role: 'user', content: voiceTranscript.trim() });
      setVoiceTranscript('');
      setIsListening(false);
    }
  };

  const toggleSpeak = () => setSpeakEnabled(!speakEnabled);

  // Fun, vibrant templates with icons
  const quickTemplates = [
    { label: 'Real Estate CRM', prompt: 'Build a full real estate CRM with lead tracker, property listings, and voice search', icon: '🏠' },
    { label: 'Council Voice Agent', prompt: 'Create a voice-first council meeting assistant that summarizes discussions and answers questions', icon: '🗣️' },
  ];

  const loadTemplate = (prompt: string) => append({ role: 'user', content: prompt });

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-fuchsia-950 to-indigo-950 text-white flex flex-col">
      {/* Fun Hero Bar */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-4xl">
            ✨ <span className="font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">IdeaSpeak</span>
          </div>
          <div className="text-sm px-4 py-1 rounded-3xl bg-white/10 text-white/80 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Grok-Powered Vibe Coding
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={toggleSpeak} className="flex items-center gap-2 text-sm hover:scale-105 transition-transform">
            <Volume2 className="w-5 h-5" /> <span className="hidden md:inline">Voice Replies</span>
          </button>
          <div className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-semibold rounded-3xl shadow-xl flex items-center gap-2 hover:shadow-2xl transition-all">
            <Rocket className="w-5 h-5" /> Deploy Magic
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fun & Visual */}
        <div className="w-80 bg-white/10 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col">
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" /> Pick a vibe to start
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickTemplates.map((t, i) => (
                <button
                  key={i}
                  onClick={() => loadTemplate(t.prompt)}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-3xl p-4 text-left transition-all hover:scale-105 flex flex-col items-center gap-3"
                >
                  <div className="text-4xl">{t.icon}</div>
                  <div className="font-medium text-sm text-center">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-white/10">
            <button 
              onClick={toggleVoice}
              className={`w-full py-6 rounded-3xl font-bold text-xl flex items-center justify-center gap-4 transition-all ${isListening ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-2xl animate-pulse' : 'bg-gradient-to-r from-violet-400 to-fuchsia-400 text-white hover:scale-105'}`}
            >
              <Mic className="w-8 h-8" /> 
              {isListening ? '🎙️ Listening…' : 'Speak Your Wild Idea'}
            </button>
            {voiceTranscript && (
              <div className="mt-4 p-4 bg-white/10 rounded-3xl text-sm">
                “{voiceTranscript}” <button onClick={useVoiceTranscript} className="ml-3 text-emerald-400 underline">Send →</button>
              </div>
            )}
          </div>
        </div>

        {/* Main Area - Fun Chat */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto p-8 space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-violet-400 to-fuchsia-400 rounded-3xl flex items-center justify-center text-6xl mb-6 animate-bounce">✨</div>
                <h2 className="text-3xl font-bold mb-2">Speak it. Build it. Magic happens.</h2>
                <p className="text-white/70 max-w-md mx-auto">Your voice turns into real working apps instantly. Try a template or just start talking!</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-gradient-to-br from-emerald-400 to-teal-400' : 'bg-gradient-to-br from-violet-400 to-fuchsia-400'}`}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`px-6 py-4 rounded-3xl text-lg ${msg.role === 'user' ? 'bg-white text-zinc-900' : 'bg-white/10 text-white'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-violet-400 to-fuchsia-400 rounded-2xl flex items-center justify-center animate-spin">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-lg">Grok is building something awesome… ✨</div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-black/30 backdrop-blur-md border-t border-white/10">
            <div className="flex gap-4 max-w-3xl mx-auto">
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Describe your dream app… or just speak it!"
                className="flex-1 bg-white/10 border border-white/20 rounded-3xl px-6 py-5 text-lg resize-y min-h-[68px] focus:outline-none focus:border-fuchsia-400"
              />
              <button
                onClick={toggleVoice}
                className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 animate-pulse shadow-lg shadow-rose-500/50' : 'bg-gradient-to-br from-violet-400 to-fuchsia-400 hover:scale-110'}`}
              >
                <Mic className="w-7 h-7 text-white" />
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !input.trim()}
                className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-3xl flex items-center justify-center disabled:opacity-50"
              >
                <Send className="w-7 h-7 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Fun Visual Preview */}
        <div className="w-96 bg-gradient-to-b from-white/5 to-transparent border-l border-white/10 p-6 hidden lg:flex flex-col">
          <div className="text-sm font-medium flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-yellow-400" /> Live Preview
          </div>
          <div className="flex-1 bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
            {/* Placeholder fun preview content */}
            <div className="h-full flex items-center justify-center flex-col text-center p-8">
              <div className="text-7xl mb-6">🏗️</div>
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">Your app is building…</div>
              <p className="text-white/60 mt-3">Watch it come to life in real time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}