import React, { useState } from 'react';
import { Send, Shield, ShieldAlert, Sparkles, Globe, Link2, AlertTriangle, User, Bot, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../engine/types.ts';

interface ChatTabProps {
  onSelectAnime?: (animeId: string) => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({ onSelectAnime }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        '👋 Welcome to **Anime Intelligence AI**. I am your specialized Japanese anime knowledge architect, retrieval engine, and fact verification system.\n\nAsk me anything in **English**, **العربية الفصحى (Modern Standard Arabic)**, **الدارجة المغربية (Moroccan Darija)**, or **日本語 (Japanese)** about plot chronologies, characters, abilities, canon vs filler arcs, official legal streaming availability, or scene breakdowns.\n\n🛡️ **Spoiler Shield is currently ACTIVE**: Major plot twists and endings are safely redacted unless you choose Unrestricted mode below.',
      timestamp: Date.now(),
      citations: [
        {
          title: 'Anime Intelligence Verified Knowledge Base',
          url: '/api/openapi.json',
          source: 'AniList GraphQL, MyAnimeList/Jikan v4, Official Studio Archives',
        },
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [spoilerMode, setSpoilerMode] = useState<'safe' | 'unrestricted'>('safe');
  const [language, setLanguage] = useState<'auto' | 'ar' | 'darija' | 'ja' | 'en'>('auto');

  const samplePrompts = [
    {
      label: '🇸🇦 Attack on Titan Canon (هجوم العمالقة)',
      text: 'اشرح لي قصة أنمي هجوم العمالقة وما هو مصدر الكانون وحلقات الفيلر بدون حرق؟',
    },
    {
      label: '🇲🇦 Mystery Anime (اقتراح بالدارجة)',
      text: 'واش كاين شي أنمي زوين بزاف فيه الغموض والذكاء بحال مذكرة الموت وقصير؟',
    },
    {
      label: '🇯🇵 Frieren Story (葬送のフリーレン)',
      text: '葬送のフリーレンのあらすじと主要キャラクターの能力について教えてください。',
    },
    {
      label: '🇺🇸 FMAB vs 2003 Canon (English)',
      text: 'Explain the difference between Fullmetal Alchemist (2003) and Brotherhood in terms of manga canon and endings.',
    },
    {
      label: '⚔️ Levi vs Beast Titan Scene',
      text: 'In which episode does Levi attack the Beast Titan in the smoke, and is there an official clip?',
    },
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationId: 'demo-ui-session',
          spoilerMode,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data: ChatMessage = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Error connecting to AI Engine**: ${err.message}. Please verify the backend server is active.`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 mb-3 bg-zinc-900/70 border border-zinc-800 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-medium">Spoiler Guard:</span>
          <button
            onClick={() => setSpoilerMode(spoilerMode === 'safe' ? 'unrestricted' : 'safe')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition ${
              spoilerMode === 'safe'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
            }`}
          >
            {spoilerMode === 'safe' ? <Shield className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            <span>{spoilerMode === 'safe' ? 'Safe Mode (No Spoilers)' : '⚠️ Unrestricted (Spoilers Allowed)'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-400">Response Language:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 rounded px-2 py-1 focus:outline-none focus:border-rose-500 font-mono text-xs"
          >
            <option value="auto">Auto Detect Query Language</option>
            <option value="ar">العربية الفصحى (Arabic MSA)</option>
            <option value="darija">الدارجة المغربية (Moroccan Darija)</option>
            <option value="ja">日本語 (Japanese)</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-3 p-4 rounded-xl border ${
                isUser
                  ? 'bg-zinc-900/40 border-zinc-800/60 ml-8'
                  : 'bg-zinc-900/90 border-zinc-800 shadow-sm mr-8'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-zinc-800 text-zinc-300'
                    : 'bg-gradient-to-br from-rose-600 to-indigo-600 text-white shadow-md'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-xs text-zinc-300">
                    {isUser ? 'You' : 'Anime Intelligence AI Engine'}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="prose prose-invert prose-sm max-w-none text-zinc-200 leading-relaxed whitespace-pre-line text-sm">
                  {msg.content}
                </div>

                {/* Citations Footer */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-800/80">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Verified Knowledge Citations:</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((cite, cIdx) => (
                        <a
                          key={cIdx}
                          href={cite.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800/90 hover:bg-zinc-800 text-xs text-rose-300 border border-zinc-700/60 transition"
                        >
                          <span className="font-medium">{cite.title}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">({cite.source})</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 mr-8 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-rose-600/30 flex items-center justify-center text-rose-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
              <div className="h-3 bg-zinc-800/60 rounded w-3/4"></div>
              <div className="h-3 bg-zinc-800/40 rounded w-1/2"></div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-mono text-zinc-500 uppercase shrink-0">Try Query:</span>
        {samplePrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p.text)}
            className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 whitespace-nowrap transition"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 p-2 bg-zinc-900 border border-zinc-800 rounded-xl focus-within:border-rose-500 transition"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about anime plot, characters, canon chronology, streaming in Morocco/US, or describe a scene..."
          className="flex-1 bg-transparent px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Send query"
          className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-rose-950 transition"
        >
          <span>Ask AI</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
