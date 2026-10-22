import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar.tsx';
import { ChatTab } from './components/ChatTab.tsx';
import { KnowledgeTab } from './components/KnowledgeTab.tsx';
import { AvailabilityTab } from './components/AvailabilityTab.tsx';
import { ScenesTab } from './components/ScenesTab.tsx';
import { RecommendationsTab } from './components/RecommendationsTab.tsx';
import { ApiDocsTab } from './components/ApiDocsTab.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [indexedCount, setIndexedCount] = useState<number>(10);

  useEffect(() => {
    // Check URL query param for direct deep link
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as ActiveTab | null;
    if (tabParam && ['chat', 'knowledge', 'availability', 'scenes', 'recommendations', 'api'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    // Ping /health
    const checkHealth = async () => {
      try {
        const res = await fetch('/health');
        if (res.ok) {
          const data = await res.json();
          setIsHealthy(true);
          if (data.database?.indexedAnimeCount) {
            setIndexedCount(data.database.indexedAnimeCount);
          }
        } else {
          setIsHealthy(false);
        }
      } catch (err) {
        setIsHealthy(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isHealthy={isHealthy}
        indexedCount={indexedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'chat' && <ChatTab onSelectAnime={() => setActiveTab('knowledge')} />}
        {activeTab === 'knowledge' && <KnowledgeTab />}
        {activeTab === 'availability' && <AvailabilityTab />}
        {activeTab === 'scenes' && <ScenesTab />}
        {activeTab === 'recommendations' && <RecommendationsTab />}
        {activeTab === 'api' && <ApiDocsTab />}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-4 px-4 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Anime Intelligence AI • Architectural Engine Core v1.0.0</span>
          <span>Sourced from AniList GraphQL, Jikan/MAL, Kitsu, and Verified Studio Releases</span>
          <span>Zero Hallucination Protocol • Multilingual MSA/Darija/EN/JA</span>
        </div>
      </footer>
    </div>
  );
}
