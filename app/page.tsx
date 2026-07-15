'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { Send, Mic, Bot, User, Sparkles, Loader2, Volume2 } from 'lucide-react';

export default function IdeaSpeak() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
  });

  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Voice STT
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

  // TTS for assistant responses
  useEffect(() => {
    if (speakEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content) {
        const utterance = new SpeechSynthesisUtterance(lastMessage.content);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [messages, speakEnabled]);

  const toggleVoice = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
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

  // Basic templates for real-estate
  const quickTemplates = [
    { label: 'Real Estate CRM', prompt: 'Build a full real estate CRM with lead tracker, property listings, and voice search' },
    { label: 'Council Voice Agent', prompt: 'Create a voice-first council meeting assistant that summarizes discussions and answers questions' },
  ];

  const loadTemplate = (prompt: string) => {
    append({ role: 'user', content: prompt });
  };

  // Simple persistence (messages saved to localStorage)
  useEffect(() => {
    const saved = localStorage.getItem('ideaspeak-messages');
    if (saved) {
      // Note: useChat manages its own state; for full persistence we'd need more, but this is starter
    }
  }, []);

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-zinc-800 bg-zinc-900 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">IdeaSpeak</h1>
            <p className="text-xs text-zinc-500">Grok-Powered Vibe Coding</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Quick Templates</div>
            <div className="space-y-2">
              {quickTemplates.map((t, i) => (
                <button
                  key={i}
                  onClick={() => loadTemplate(t.prompt)}
                  className="w-full px-4 py-2 text-left hover:bg-zinc-800 rounded-lg text-sm transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800">
            <button 
              onClick={toggleVoice}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-black hover:bg-zinc-200'}`}
            >
              <Mic className="w-5 h-5" /> 
              {isListening ? 'Listening... (click to stop)' : 'Speak Your Idea'}
            </button>
            {voiceTranscript && (
              <button onClick={useVoiceTranscript} className="mt-2 w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl">
                Use: "{voiceTranscript.substring(0, 50)}..."
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-zinc-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-violet-400" />
            <div>
              <div className="font-semibold">Grok Council Builder</div>
              <div className="text-xs text-emerald-400">● Online • xAI Powered</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <button onClick={toggleSpeak} className="flex items-center gap-1 px-3 py-1 rounded-full border border-zinc-700 hover:bg-zinc-900">
              <Volume2 className="w-4 h-4" />
              {speakEnabled ? 'TTS On' : 'TTS Off'}
            </button>
            <button className="px-4 py-1.5 rounded-full border border-zinc-700 hover:bg-zinc-900">Preview</button>
            <button className="px-4 py-1.5 bg-white text-black rounded-full font-medium">Deploy to Vercel</button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 space-y-8" id="chat-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-white text-black' : 'bg-zinc-800'}`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`p-5 rounded-3xl ${msg.role === 'user' ? 'bg-white text-black' : 'bg-zinc-800'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] flex gap-4">
                <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div className="p-5 rounded-3xl bg-zinc-800 flex items-center gap-2">
                  Grok is building... <span className="animate-pulse">(Planning • Coding • Previewing)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area with voice refinement always available */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Continue refining or speak next idea..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-3xl px-6 py-5 text-lg resize-y min-h-[60px] max-h-[200px] focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={toggleVoice}
              className={`h-[60px] w-[60px] flex items-center justify-center rounded-2xl transition-all ${isListening ? 'bg-red-500 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}`}
            >
              <Mic className="w-6 h-6" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="h-[60px] w-[60px] bg-violet-600 hover:bg-violet-500 rounded-2xl flex items-center justify-center disabled:opacity-50 transition-all"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          <p className="text-center text-xs text-zinc-500 mt-3">Voice + TTS enabled • Powered by Grok • xAI</p>
        </div>
      </div>

      {/* Right Sidebar - Preview */}
      <div className="w-96 border-l border-zinc-800 bg-zinc-900 p-6 hidden lg:block">
        <div className="text-sm uppercase tracking-widest text-zinc-500 mb-4">Live Preview</div>
        <div className="aspect-video bg-black rounded-2xl flex items-center justify-center border border-zinc-700">
          <div className="text-center text-zinc-500">
            <Sparkles className="mx-auto mb-3" />
            Preview appears here after build
          </div>
        </div>
      </div>
    </div>
  );
}