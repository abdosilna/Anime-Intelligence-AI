import React, { useState, useEffect } from 'react';
import { Search, Star, Film, Calendar, Building, Sparkles, BookOpen, Layers, ShieldCheck, X, ExternalLink, Play } from 'lucide-react';
import { AnimeRecord } from '../engine/types.ts';

interface KnowledgeTabProps {
  initialSearch?: string;
}

export const KnowledgeTab: React.FC<KnowledgeTabProps> = ({ initialSearch = '' }) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [results, setResults] = useState<AnimeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<AnimeRecord | null>(null);

  const genres = ['All', 'Action', 'Adventure', 'Drama', 'Fantasy', 'Suspense', 'Sci-Fi', 'Comedy'];

  const quickFilters = [
    { label: 'Attack on Titan (هجوم العمالقة)', query: 'هجوم العمالقة' },
    { label: 'Detective Conan (المحقق كونان)', query: 'كونان' },
    { label: 'Frieren (葬送のフリーレン)', query: 'Sousou no Frieren' },
    { label: 'Demon Slayer (قاتل الشياطين)', query: 'Demon Slayer' },
    { label: 'One Piece (ون بيس)', query: 'One Piece' },
    { label: 'Bocchi the Rock!', query: 'Bocchi' },
    { label: 'Steins;Gate (شتاينز غيت)', query: 'Steins;Gate' },
  ];

  const fetchAnime = async (q: string, genre: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (genre && genre !== 'All') params.set('genre', genre);
      params.set('limit', '20');

      const res = await fetch(`/anime/search?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch anime');
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnime(search, selectedGenre);
  }, [search, selectedGenre]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Arabic title (هجوم العمالقة، كونان), English, Romaji, character, or plot..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedGenre === g
                    ? 'bg-rose-600 text-white'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Quick query chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-zinc-500 shrink-0 font-mono text-[11px]">Quick Tests:</span>
          {quickFilters.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setSearch(q.query)}
              className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 whitespace-nowrap transition"
            >
              {q.label}
            </button>
          ))}
          {search && (
            <button
              onClick={() => setSearch('')}
              className="px-2 py-1 text-zinc-500 hover:text-zinc-300 text-xs font-mono"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid of Anime Records */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse"></div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 p-8">
          <Film className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-zinc-300 font-semibold mb-1">No matching anime records found</h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">
            Try checking spelling or search in Arabic (e.g. هجوم العمالقة، فريرين، ون بيس) or Romaji.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((anime) => (
            <div
              key={anime.id}
              onClick={() => setSelectedAnime(anime)}
              className="group cursor-pointer rounded-2xl bg-zinc-900/90 border border-zinc-800/80 hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-950/20 transition-all overflow-hidden flex flex-col"
            >
              <div className="relative h-48 overflow-hidden bg-zinc-950">
                <img
                  src={anime.images.poster}
                  alt={anime.titles.english}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-700/60 text-xs font-semibold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{anime.score}</span>
                </div>
                <div className="absolute bottom-2.5 left-3 right-3">
                  <h3 className="font-bold text-base text-white group-hover:text-rose-400 transition truncate">
                    {anime.titles.english}
                  </h3>
                  <p className="text-xs text-rose-300/90 font-medium truncate">
                    {anime.titles.arabic} • {anime.titles.romaji}
                  </p>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {anime.synopsis}
                </p>

                <div className="space-y-2 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{anime.studios.map((s) => s.name).join(' / ')}</span>
                    </span>
                    <span className="font-mono text-zinc-500">{anime.episodes ?? 'Ongoing'} eps</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {anime.genres.slice(0, 3).map((g) => (
                      <span key={g} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Anime Detail Modal */}
      {selectedAnime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 bg-zinc-900 border border-zinc-700/80 rounded-2xl overflow-hidden shadow-2xl">
            {/* Modal Banner */}
            <div className="relative h-56 bg-zinc-950">
              <img
                src={selectedAnime.images.banner || selectedAnime.images.poster}
                alt={selectedAnime.titles.english}
                className="w-full h-full object-cover opacity-60"
              />
              <button
                onClick={() => setSelectedAnime(null)}
                aria-label="Close modal"
                className="absolute top-3 right-3 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <h2 className="text-2xl font-bold text-white mb-1">{selectedAnime.titles.english}</h2>
                <p className="text-sm text-rose-300 font-medium">
                  {selectedAnime.titles.arabic} • {selectedAnime.titles.native} ({selectedAnime.titles.romaji})
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Quick stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">MAL Score</span>
                  <span className="text-base font-bold text-amber-400">⭐ {selectedAnime.score} / 10</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Episodes</span>
                  <span className="text-base font-bold text-zinc-200">
                    {selectedAnime.episodes ?? 'Ongoing'} ({selectedAnime.durationMinutes || 24}m)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Studio</span>
                  <span className="text-base font-bold text-zinc-200 truncate block">
                    {selectedAnime.studios.map((s) => s.name).join(', ')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Premiered</span>
                  <span className="text-base font-bold text-zinc-200">{selectedAnime.seasonYear}</span>
                </div>
              </div>

              {/* Arabic & English Synopses */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-rose-400" />
                  <span>Story Synopsis (English &amp; Arabic)</span>
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/40 p-3 rounded-xl border border-zinc-800">
                  {selectedAnime.synopsis}
                </p>
                {selectedAnime.synopsisArabic && (
                  <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/40 p-3 rounded-xl border border-zinc-800 font-arabic text-right">
                    {selectedAnime.synopsisArabic}
                  </p>
                )}
              </div>

              {/* Canon Notes & Story Arcs */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Canon Source &amp; Story Chronology</span>
                </h4>
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-500 font-medium">Source: </span>
                    <span className="text-zinc-200 font-semibold">{selectedAnime.canonNotes.canonSource}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium">Filler Episodes: </span>
                    <span className="text-zinc-300">
                      {selectedAnime.canonNotes.fillerEpisodes.length > 0
                        ? selectedAnime.canonNotes.fillerEpisodes.join('; ')
                        : 'Zero Filler (100% Faithful adaptation)'}
                    </span>
                  </div>
                  {selectedAnime.canonNotes.keyArcChronology.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800">
                      <span className="text-zinc-500 block mb-1">Key Canonical Arcs:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedAnime.canonNotes.keyArcChronology.map((arc, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px] font-mono border border-zinc-700/50"
                          >
                            {arc.arcName} (eps {arc.episodes})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Character Roster */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Main Characters &amp; Voice Talents</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedAnime.characters.map((char) => (
                    <div
                      key={char.id}
                      className="flex gap-3 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80 items-center"
                    >
                      <img
                        src={char.image}
                        alt={char.name.full}
                        className="w-12 h-12 rounded-lg object-cover bg-zinc-900 shrink-0"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <span className="font-bold text-zinc-100 block truncate">
                          {char.name.full} {char.name.arabic ? `(${char.name.arabic})` : ''}
                        </span>
                        <span className="text-[11px] text-zinc-400 block truncate">
                          VA: {char.voiceActors.map((v) => `${v.name} [${v.language}]`).join(', ')}
                        </span>
                        <span className="text-[10px] text-rose-300 block truncate mt-0.5">
                          {char.abilities.join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Streaming Platforms */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Verified Official Legal Streaming
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAnime.streaming.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-rose-300 border border-zinc-700 transition"
                    >
                      <span className="font-semibold text-zinc-100">{s.platform}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">({s.countries.join(', ')})</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
