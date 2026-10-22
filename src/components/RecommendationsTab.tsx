import React, { useState } from 'react';
import { Compass, Sparkles, Filter, Star, CheckCircle, Diamond, ArrowRight, ExternalLink } from 'lucide-react';
import { RecommendationResult } from '../engine/types.ts';
import { SUPPORTED_COUNTRIES } from '../engine/availability.ts';

export const RecommendationsTab: React.FC = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Action', 'Suspense']);
  const [mood, setMood] = useState('dark psychological');
  const [pacing, setPacing] = useState<'fast' | 'moderate' | 'slow'>('fast');
  const [maxEpisodes, setMaxEpisodes] = useState<number>(50);
  const [targetCountry, setTargetCountry] = useState('MA');
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(false);

  const availableGenres = ['Action', 'Adventure', 'Drama', 'Fantasy', 'Suspense', 'Sci-Fi', 'Comedy', 'Supernatural'];

  const moodPresets = [
    { label: 'Dark & Psychological (غموض وتوتر)', value: 'dark psychological' },
    { label: 'Chill, Warm & Reflective (تأملي وهادئ)', value: 'chill relax warm' },
    { label: 'High-Octane Adrenaline (حماس وأكشن)', value: 'hype action combat' },
  ];

  const handleToggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genres: selectedGenres,
          mood,
          pacing,
          maxEpisodes,
          targetCountry,
          includeNiche: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.recommendations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Run once on load
  React.useEffect(() => {
    getRecommendations();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Configuration Header */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-rose-500" />
            <span>Multi-Criteria Anime Recommendation Engine</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Recommends anime tailored to your mood, pace, time budget, and regional legal streaming availability,
            explaining every suggestion with concrete factual justification.
          </p>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-800 text-xs">
          {/* Genres */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-mono uppercase text-[11px] block">Select Genres:</label>
            <div className="flex flex-wrap gap-1.5">
              {availableGenres.map((g) => {
                const isSelected = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => handleToggleGenre(g)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700/50'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood Preset */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-mono uppercase text-[11px] block">Story Atmosphere &amp; Mood:</label>
            <div className="space-y-1">
              {moodPresets.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg border transition ${
                    mood === m.value
                      ? 'bg-rose-600/15 border-rose-500 text-rose-300'
                      : 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700/50 text-zinc-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pacing & Episode limit */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-zinc-400 font-mono uppercase text-[11px] block mb-1">Story Pacing:</label>
              <select
                value={pacing}
                onChange={(e) => setPacing(e.target.value as any)}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg p-2 text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="fast">Fast (Relentless twists)</option>
                <option value="moderate">Moderate (Standard)</option>
                <option value="slow">Slow &amp; Contemplative</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-400 font-mono uppercase text-[11px] block mb-1">Max Episodes:</label>
              <select
                value={maxEpisodes}
                onChange={(e) => setMaxEpisodes(parseInt(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg p-2 text-xs focus:outline-none focus:border-rose-500"
              >
                <option value={15}>Under 15 eps (Quick binge)</option>
                <option value={30}>Under 30 eps (1-2 cours)</option>
                <option value={70}>Under 70 eps (Medium saga)</option>
                <option value={150}>Any length</option>
              </select>
            </div>
          </div>

          {/* Regional Availability Preference */}
          <div>
            <label className="text-zinc-400 font-mono uppercase text-[11px] block mb-1">Prioritize Legal Country License:</label>
            <div className="flex gap-2">
              <select
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg p-2 text-xs focus:outline-none focus:border-rose-500"
              >
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.nameArabic}) [{c.code}]
                  </option>
                ))}
              </select>
              <button
                onClick={getRecommendations}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-md transition shrink-0"
              >
                {loading ? 'Analyzing...' : 'Run Discovery'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-zinc-400">
            Engine Selected {results.length} Matches:
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse"></div>
            ))}
          </div>
        ) : (
          results.map((item, idx) => (
            <div
              key={item.anime.id}
              className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex gap-3 items-start">
                  <img
                    src={item.anime.images.poster}
                    alt={item.anime.titles.english}
                    className="w-16 h-24 object-cover rounded-xl bg-zinc-950 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                        {item.matchScore}% Match
                      </span>
                      {item.isNicheGem && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                          <Diamond className="w-3 h-3" />
                          <span>Critically Acclaimed Gem</span>
                        </span>
                      )}
                      <span className="text-xs text-zinc-500 font-mono">
                        ⭐ {item.anime.score}/10 • {item.anime.episodes ?? 'Ongoing'} eps
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{item.anime.titles.english}</h3>
                    <p className="text-xs text-rose-300 font-medium font-arabic mt-0.5">
                      {item.anime.titles.arabic} ({item.anime.titles.romaji})
                    </p>
                  </div>
                </div>

                {item.streamingInCountry && item.streamingInCountry.length > 0 && (
                  <div className="shrink-0 text-right">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                      Stream in {targetCountry}:
                    </span>
                    <a
                      href={item.streamingInCountry[0].url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-300 text-xs border border-zinc-700 transition"
                    >
                      <span>{item.streamingInCountry[0].platform}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Concrete Reasons */}
              <div className="space-y-1.5 pt-3 border-t border-zinc-800/60 text-xs">
                <span className="font-semibold text-zinc-300 block">Why this fits your request:</span>
                <ul className="space-y-1">
                  {item.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-zinc-300">
                      <span className="text-rose-500 font-bold shrink-0">✓</span>
                      <span>{r}</span>
                    </li>
                  ))}
                  {item.reasonsArabic.map((ra, i) => (
                    <li key={`ar-${i}`} className="flex items-start gap-2 text-zinc-400 font-arabic text-right">
                      <span className="text-rose-400 font-bold shrink-0">✓</span>
                      <span>{ra}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
