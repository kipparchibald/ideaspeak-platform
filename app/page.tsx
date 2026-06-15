'use client';

import { useState } from 'react';
import { Send, Mic, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function IdeaSpeak() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Welcome to IdeaSpeak! Speak or type your app idea, and I'll use Grok Build + xAI to bring it to life. What do you want to build today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages }),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || "I've got your idea! Grok is now planning the build..."
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, something went wrong. Try again!"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Projects</div>
            <div className="space-y-1">
              <div className="px-4 py-2 bg-zinc-800 rounded-lg text-sm cursor-pointer">New Project</div>
              <div className="px-4 py-2 hover:bg-zinc-800 rounded-lg text-sm cursor-pointer">Real Estate CRM</div>
              <div className="px-4 py-2 hover:bg-zinc-800 rounded-lg text-sm cursor-pointer">Council Voice Agent</div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800">
            <button 
              onClick={() => alert('Voice mode coming soon - powered by xAI Voice!')}
              className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl font-medium hover:bg-zinc-200 transition-colors"
            >
              <Mic className="w-5 h-5" /> Speak Your Idea
            </button>
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
                  <Bot size={18} />
                </div>
                <div className="p-5 rounded-3xl bg-zinc-800">Thinking with Grok Build...</div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Describe your app idea in natural language... (e.g. Build a real estate listing generator with voice input)"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-3xl px-6 py-5 text-lg resize-y min-h-[60px] max-h-[200px] focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="h-[60px] w-[60px] bg-violet-600 hover:bg-violet-500 rounded-2xl flex items-center justify-center disabled:opacity-50 transition-all"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          <p className="text-center text-xs text-zinc-500 mt-3">Powered by Grok • Voice coming soon</p>
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
        <div className="mt-8 space-y-4">
          <div className="text-sm font-medium">Grok Build Status</div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-2 bg-emerald-500 w-1/3 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}