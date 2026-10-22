import React from 'react';
import { Bot, Database, Tv, Film, Compass, Code2, ShieldAlert, Sparkles } from 'lucide-react';

export type ActiveTab = 'chat' | 'knowledge' | 'availability' | 'scenes' | 'recommendations' | 'api';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isHealthy: boolean;
  indexedCount: number;
}

interface TabItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isHealthy,
  indexedCount,
}) => {
  const tabs: TabItem[] = [
    { id: 'chat', label: 'AI Q&A Assistant', icon: Bot, badge: 'RAG' },
    { id: 'knowledge', label: 'Anime Knowledge Base', icon: Database, badge: `${indexedCount} titles` },
    { id: 'availability', label: 'Legal Streaming', icon: Tv },
    { id: 'scenes', label: 'Scene Discovery', icon: Film, badge: 'NL Search' },
    { id: 'recommendations', label: 'Smart Discovery', icon: Compass },
    { id: 'api', label: 'REST API & OpenAPI', icon: Code2, badge: 'v1.0' },
  ];

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-rose-950/50 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-sm sm:text-lg text-zinc-100 tracking-tight truncate">
                  Anime Intelligence AI
                </span>
                <span className="hidden xs:inline-block text-[9px] sm:text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0">
                  Core
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-400 truncate">Multilingual Knowledge &amp; RAG</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-zinc-300 font-medium">Engine API: {isHealthy ? 'Online' : 'Initializing'}</span>
            </div>
            <a
              href="/api/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-rose-400 border border-zinc-800 transition flex items-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>OpenAPI Spec</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Main tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-rose-500/20 text-rose-300' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
