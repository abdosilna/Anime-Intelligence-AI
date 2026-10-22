import React, { useState } from 'react';
import { Code2, Play, Copy, Check, ExternalLink, Terminal, Shield, FileText } from 'lucide-react';
import { OPENAPI_SPEC } from '../engine/openapi.ts';

interface EndpointConfig {
  method: 'GET' | 'POST';
  path: string;
  summary: string;
  description: string;
  defaultParams?: Record<string, string>;
  defaultBody?: any;
}

export const ApiDocsTab: React.FC = () => {
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [bodyText, setBodyText] = useState('');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responsePayload, setResponsePayload] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoints: EndpointConfig[] = [
    {
      method: 'GET',
      path: '/health',
      summary: 'Service & Engine Status',
      description: 'Check uptime, indexed database stats, and Gemini API attachment status.',
    },
    {
      method: 'GET',
      path: '/anime/search',
      summary: 'Search Anime Records',
      description: 'Search anime across English, Romaji, Japanese, and Arabic titles & aliases.',
      defaultParams: { q: 'هجوم العمالقة', limit: '3' },
    },
    {
      method: 'GET',
      path: '/anime/{id}',
      summary: 'Get Specific Anime Record',
      description: 'Retrieve full metadata, synopsis, canon notes, and characters for an ID.',
      defaultParams: { id: 'attack-on-titan' },
    },
    {
      method: 'GET',
      path: '/anime/{id}/characters',
      summary: 'Get Anime Characters & Voice Cast',
      description: 'Retrieve characters, descriptions, voice actors, and abilities.',
      defaultParams: { id: 'frieren-beyond-journeys-end' },
    },
    {
      method: 'GET',
      path: '/anime/{id}/episodes',
      summary: 'Get Episodes & Canon Notes',
      description: 'Retrieve episode counts, canon manga source chapters, and filler status.',
      defaultParams: { id: 'detective-conan' },
    },
    {
      method: 'POST',
      path: '/chat',
      summary: 'Intelligent RAG Anime Q&A',
      description: 'Submit an anime query with spoiler shield control and multi-language support.',
      defaultBody: {
        message: 'اشرح لي قصة هجوم العمالقة بدون حرق',
        spoilerMode: 'safe',
        language: 'ar',
      },
    },
    {
      method: 'POST',
      path: '/recommendations',
      summary: 'Multi-Criteria Recommendation Engine',
      description: 'Discover anime based on genres, mood, pacing, episode budget, and country.',
      defaultBody: {
        genres: ['Suspense', 'Action'],
        mood: 'dark psychological',
        pacing: 'fast',
        maxEpisodes: 40,
        targetCountry: 'MA',
      },
    },
    {
      method: 'GET',
      path: '/availability',
      summary: 'Legal Streaming Availability',
      description: 'Region-aware streaming availability query with deep links and confidence score.',
      defaultParams: { anime_id: 'attack-on-titan', country: 'MA' },
    },
    {
      method: 'POST',
      path: '/scenes/search',
      summary: 'Natural Language Scene Discovery',
      description: 'Search iconic anime moments by natural language description.',
      defaultBody: {
        query: 'Levi ambushes beast titan in the smoke',
        limit: 3,
      },
    },
    {
      method: 'GET',
      path: '/images/search',
      summary: 'High-Resolution Art & Poster Search',
      description: 'Find official high-res posters, banners, and character images with attribution.',
      defaultParams: { q: 'Death Note', type: 'poster' },
    },
    {
      method: 'GET',
      path: '/sources/{id}',
      summary: 'Data Provenance & Audit Trail',
      description: 'Inspect verified source registries and last verification timestamps.',
      defaultParams: { id: 'attack-on-titan' },
    },
  ];

  const currentEndpoint = endpoints[selectedEndpointIndex];

  // Initialize inputs on endpoint switch
  React.useEffect(() => {
    setParamValues(currentEndpoint.defaultParams || {});
    setBodyText(currentEndpoint.defaultBody ? JSON.stringify(currentEndpoint.defaultBody, null, 2) : '');
    setResponsePayload(null);
    setResponseStatus(null);
  }, [selectedEndpointIndex]);

  const executeCall = async () => {
    setLoading(true);
    let resolvedPath = currentEndpoint.path;

    // Substitute path params like {id}
    for (const [key, val] of Object.entries(paramValues)) {
      if (resolvedPath.includes(`{${key}}`)) {
        resolvedPath = resolvedPath.replace(`{${key}}`, encodeURIComponent(val));
      }
    }

    // Add query params if method is GET and not a path param
    if (currentEndpoint.method === 'GET') {
      const searchParams = new URLSearchParams();
      for (const [key, val] of Object.entries(paramValues)) {
        if (!currentEndpoint.path.includes(`{${key}}`) && val) {
          searchParams.append(key, val);
        }
      }
      const qs = searchParams.toString();
      if (qs) resolvedPath += `?${qs}`;
    }

    try {
      const options: RequestInit = {
        method: currentEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      };

      if (currentEndpoint.method === 'POST' && bodyText) {
        options.body = bodyText;
      }

      const res = await fetch(resolvedPath, options);
      setResponseStatus(res.status);
      const json = await res.json();
      setResponsePayload(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setResponseStatus(500);
      setResponsePayload(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const getCurlSnippet = () => {
    let resolvedPath = currentEndpoint.path;
    for (const [key, val] of Object.entries(paramValues)) {
      if (resolvedPath.includes(`{${key}}`)) {
        resolvedPath = resolvedPath.replace(`{${key}}`, val);
      }
    }
    if (currentEndpoint.method === 'GET') {
      const searchParams = new URLSearchParams();
      for (const [key, val] of Object.entries(paramValues)) {
        if (!currentEndpoint.path.includes(`{${key}}`) && val) {
          searchParams.append(key, val);
        }
      }
      const qs = searchParams.toString();
      if (qs) resolvedPath += `?${qs}`;
      return `curl -X GET "http://localhost:3000${resolvedPath}" -H "Accept: application/json"`;
    } else {
      return `curl -X POST "http://localhost:3000${resolvedPath}" \\
  -H "Content-Type: application/json" \\
  -d '${bodyText.replace(/\n/g, '')}'`;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getCurlSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Overview Card */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-rose-500" />
            <span>Documented REST API &amp; Interactive Workbench</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Standardized JSON endpoints with error codes, pagination, source citations, and OpenAPI 3.0.3 specification.
          </p>
        </div>

        <a
          href="/api/openapi.json"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 border border-zinc-700 text-xs font-mono transition"
        >
          <FileText className="w-4 h-4" />
          <span>OpenAPI 3.0 JSON</span>
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </a>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoint Selector List */}
        <div className="space-y-2 lg:col-span-1">
          <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider block mb-1">
            Available Endpoints ({endpoints.length})
          </span>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {endpoints.map((ep, idx) => {
              const isSelected = selectedEndpointIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedEndpointIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-rose-600/15 border-rose-500 text-white'
                      : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800/80 text-zinc-300'
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      ep.method === 'GET' ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-xs block truncate">{ep.path}</span>
                    <span className="text-[11px] text-zinc-500 block truncate">{ep.summary}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Playground & Response Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    currentEndpoint.method === 'GET' ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {currentEndpoint.method}
                </span>
                <span className="font-mono text-sm font-bold text-white">{currentEndpoint.path}</span>
              </div>

              <button
                onClick={executeCall}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium text-xs shadow-md shadow-rose-950 transition"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{loading ? 'Running...' : 'Execute Call'}</span>
              </button>
            </div>

            <p className="text-xs text-zinc-400">{currentEndpoint.description}</p>

            {/* Path/Query Parameters */}
            {Object.keys(paramValues).length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono text-zinc-500 uppercase block">Parameters:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(paramValues).map(([key, val]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400">{key}:</label>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => setParamValues({ ...paramValues, [key]: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request Body Editor */}
            {currentEndpoint.method === 'POST' && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono text-zinc-500 uppercase block">JSON Request Body:</span>
                <textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={6}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            {/* cURL Snippet */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                  <span>cURL Command:</span>
                </span>
                <button
                  onClick={copyToClipboard}
                  className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition font-mono"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto">
                {getCurlSnippet()}
              </pre>
            </div>
          </div>

          {/* Response Inspector */}
          {responsePayload && (
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-zinc-400">Response Payload</span>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                    responseStatus === 200 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  HTTP Status {responseStatus}
                </span>
              </div>
              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-96 scrollbar-thin">
                {responsePayload}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
