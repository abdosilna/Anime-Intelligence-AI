import React, { useState, useEffect } from 'react';
import { Film, Search, Play, Clock, Sparkles, CheckCircle2, ShieldAlert, ExternalLink } from 'lucide-react';
import { SceneRecord } from '../engine/types.ts';

export const ScenesTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [scenes, setScenes] = useState<SceneRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    { label: '⚔️ Levi vs Beast Titan', text: 'Levi ambushes and slices the Beast Titan' },
    { label: '🔥 Tanjiro Hinokami Kagura', text: 'Tanjiro unlocks the dance of the fire god against Rui' },
    { label: '🧙 Frieren vs Aura', text: 'Frieren releases her suppressed mana and orders Aura to kill herself' },
    { label: '🏙️ Eren Declaration of War', text: 'Eren transforms in the basement during Willy Tybur declaration of war' },
    { label: '🎸 Bocchi Slide Guitar', text: 'Bocchi breaks guitar string and plays slide solo with glass bottle' },
    { label: '🔫 Spike Spiegel Bang', text: 'Spike Spiegel says bang at the end on the stairs' },
    { label: '👁️ Gojo Infinite Void', text: 'Gojo reveals domain expansion infinite void against Jogo' },
  ];

  const searchScenes = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch('/scenes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, limit: 10 }),
      });
      if (res.ok) {
        const data = await res.json();
        setScenes(data.matches || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchScenes(query);
  }, [query]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Film className="w-5 h-5 text-rose-500" />
          <span>Natural Language Scene &amp; Clip Discovery</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Describe any anime scene in natural language (characters, actions, emotions, or combat beats). Returns
          exact canonical episode, verified timestamps, and official legal clips.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe a scene (e.g. 'Levi slices beast titan', 'Gojo domain expansion', 'تانجيرو رقصة النار')..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        {/* Quick query tags */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-zinc-500 font-mono text-[11px] shrink-0">Try Scene:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(p.text)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 whitespace-nowrap transition"
            >
              {p.label}
            </button>
          ))}
          {query && (
            <button onClick={() => setQuery('')} className="px-2 py-1 text-zinc-500 hover:text-zinc-300 font-mono text-xs">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-40 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse"></div>
          ))}
        </div>
      ) : scenes.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800 p-8">
          <Film className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-zinc-300 font-semibold mb-1">No scenes matched your description</h3>
          <p className="text-zinc-500 text-xs">
            Try adjusting keywords or selecting one of the verified scene templates above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {scenes.map((scene) => (
            <div
              key={scene.id}
              className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-semibold uppercase">
                      {scene.animeTitle}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{scene.confidence}</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{scene.sceneTitle}</h3>
                  <p className="text-xs text-rose-300 font-arabic text-right sm:text-left mt-0.5">
                    {scene.sceneTitleArabic}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-zinc-200 block">
                      Season {scene.season}, Episode {scene.episode}
                    </span>
                    {scene.timestampApprox && (
                      <span className="text-[11px] text-zinc-500 font-mono flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>{scene.timestampApprox}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Scene Descriptions */}
              <div className="space-y-2 text-xs leading-relaxed">
                <p className="text-zinc-300 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/80">
                  {scene.description}
                </p>
                {scene.descriptionArabic && (
                  <p className="text-zinc-300 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/80 font-arabic text-right">
                    {scene.descriptionArabic}
                  </p>
                )}
              </div>

              {/* Characters Involved & Official Clip Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/60 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-zinc-500 font-medium">Characters:</span>
                  {scene.charactersInvolved.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px]">
                      {c}
                    </span>
                  ))}
                </div>

                {scene.officialClipUrl && (
                  <a
                    href={scene.officialClipUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Watch Official Clip ({scene.officialClipChannel || 'Verified Channel'})</span>
                    <ExternalLink className="w-3 h-3 text-zinc-200" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
