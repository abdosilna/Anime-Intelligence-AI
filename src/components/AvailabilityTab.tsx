import React, { useState, useEffect } from 'react';
import { Tv, Globe, ExternalLink, ShieldCheck, AlertCircle, Search, CheckCircle2 } from 'lucide-react';
import { SUPPORTED_COUNTRIES, AvailabilityResult } from '../engine/availability.ts';
import { animeDb } from '../engine/database.ts';
import { AnimeRecord } from '../engine/types.ts';

export const AvailabilityTab: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState('MA');
  const [selectedAnimeId, setSelectedAnimeId] = useState('attack-on-titan');
  const [animeList, setAnimeList] = useState<AnimeRecord[]>([]);
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAnimeList(animeDb.getAll());
  }, []);

  const checkAvailability = async (animeId: string, country: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/availability?anime_id=${animeId}&country=${country}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        setResult(null);
      }
    } catch (err) {
      console.error(err);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAnimeId) {
      checkAvailability(selectedAnimeId, selectedCountry);
    }
  }, [selectedAnimeId, selectedCountry]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Intro Banner */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Tv className="w-5 h-5 text-rose-500" />
            <span>Region-Aware Official Streaming Checker</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Verified official legal platforms with deep title links and regional dub/sub availability.
          </p>
        </div>

        {/* Country selector */}
        <div className="flex items-center gap-2 shrink-0">
          <Globe className="w-4 h-4 text-zinc-400" />
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-rose-500"
          >
            {SUPPORTED_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.nameArabic}) [{c.code}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Select Anime */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Select Anime Title:</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {animeList.map((anime) => {
            const isSelected = selectedAnimeId === anime.id;
            return (
              <button
                key={anime.id}
                onClick={() => setSelectedAnimeId(anime.id)}
                className={`p-2.5 rounded-xl text-left border transition flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-rose-600/15 border-rose-500 text-rose-300'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                }`}
              >
                <img
                  src={anime.images.poster}
                  alt={anime.titles.english}
                  className="w-8 h-10 object-cover rounded bg-zinc-950 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">{anime.titles.english}</span>
                  <span className="text-[10px] text-zinc-400 block truncate">{anime.titles.arabic}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability Results Card */}
      {loading ? (
        <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse h-48"></div>
      ) : result ? (
        <div className="space-y-4 p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase">Availability in {result.countryName} ({result.country}):</span>
              <h3 className="text-xl font-bold text-white mt-0.5">{result.animeTitle}</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60 font-mono">
              Country Code: {result.country}
            </span>
          </div>

          {result.platforms.length > 0 ? (
            <div className="space-y-3">
              <span className="text-xs text-zinc-400 font-medium block">
                Found {result.platforms.length} confirmed legal streaming provider(s):
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.platforms.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 flex flex-col justify-between space-y-3 hover:border-zinc-700 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-base text-zinc-100">{p.platform}</span>
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{p.confidence}</span>
                        </span>
                      </div>

                      {p.notes && <p className="text-xs text-zinc-400 mb-2">{p.notes}</p>}

                      <div className="space-y-1 text-xs">
                        <div className="text-zinc-400">
                          <span className="text-zinc-500 font-medium">Subtitles: </span>
                          <span className="text-zinc-300">{p.subAvailable.join(', ')}</span>
                        </div>
                        <div className="text-zinc-400">
                          <span className="text-zinc-500 font-medium">Dubbing: </span>
                          <span className="text-zinc-300">{p.dubAvailable.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition"
                    >
                      <span>Watch on {p.platform}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-200 text-sm">No Direct License Confirmed</h4>
                  <p className="mt-1 text-amber-300/80 leading-relaxed">
                    {result.unverifiedFallbackNotice ||
                      `We could not verify an active streaming license in ${result.countryName}. Per our anti-hallucination policy, we never generate speculative deep links.`}
                  </p>
                </div>
              </div>

              {result.officialSearchFallbacks.length > 0 && (
                <div className="pt-3 border-t border-amber-500/20 space-y-2">
                  <span className="font-semibold text-zinc-300 block">Check Official Platform Search Portals:</span>
                  <div className="flex flex-wrap gap-2">
                    {result.officialSearchFallbacks.map((fb, fIdx) => (
                      <a
                        key={fIdx}
                        href={fb.searchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs transition"
                      >
                        <span>{fb.platform} Search</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
