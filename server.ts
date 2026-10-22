import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

import { animeDb } from './src/engine/database.ts';
import { ragEngine } from './src/engine/rag.ts';
import { availabilityService } from './src/engine/availability.ts';
import { sceneEngine } from './src/engine/scenes.ts';
import { recommendationEngine } from './src/engine/recommendations.ts';
import { ingestionService } from './src/engine/ingestion.ts';
import { OPENAPI_SPEC } from './src/engine/openapi.ts';
import { AnimeImage } from './src/engine/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Middleware
  app.use(express.json({ limit: '2mb' }));

  // CORS headers for external websites and client integration
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // 1. Health check & Engine status
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      engine: 'Anime Intelligence AI v1.0.0',
      database: {
        indexedAnimeCount: animeDb.getAll().length,
        verifiedScenesCount: sceneEngine.search('', undefined, 100).length,
      },
      geminiApiAttached: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    });
  });

  // 2. OpenAPI JSON Spec
  app.get('/api/openapi.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(OPENAPI_SPEC);
  });

  // 3. Search Anime
  app.get('/anime/search', (req: Request, res: Response) => {
    const q = (req.query.q as string) || '';
    const genre = req.query.genre as string | undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const results = animeDb.search(q, { genre, year, limit });
    res.json({
      query: q,
      total: results.length,
      results,
    });
  });

  // 4. Get Anime by ID
  app.get('/anime/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const anime = animeDb.getById(id);
    if (!anime) {
      res.status(404).json({ error: 'ANIME_NOT_FOUND', message: `No anime found with ID "${id}"` });
      return;
    }
    res.json(anime);
  });

  // 5. Get Characters by Anime ID
  app.get('/anime/:id/characters', (req: Request, res: Response) => {
    const id = req.params.id;
    const anime = animeDb.getById(id);
    if (!anime) {
      res.status(404).json({ error: 'ANIME_NOT_FOUND', message: `No anime found with ID "${id}"` });
      return;
    }
    res.json({
      animeId: id,
      characters: anime.characters,
    });
  });

  // 6. Get Episodes & Canon Chronology
  app.get('/anime/:id/episodes', (req: Request, res: Response) => {
    const id = req.params.id;
    const anime = animeDb.getById(id);
    if (!anime) {
      res.status(404).json({ error: 'ANIME_NOT_FOUND', message: `No anime found with ID "${id}"` });
      return;
    }
    res.json({
      animeId: id,
      totalEpisodes: anime.episodes,
      status: anime.status,
      canonNotes: anime.canonNotes,
    });
  });

  // 7. Intelligent RAG Chat
  app.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, conversationId, spoilerMode, language } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'BAD_REQUEST', message: '"message" string field is required.' });
        return;
      }

      const reply = await ragEngine.answerQuestion({
        message,
        conversationId,
        spoilerMode,
        language,
      });

      res.json(reply);
    } catch (err) {
      next(err);
    }
  });

  // 8. Multi-Criteria Recommendations
  app.post('/recommendations', (req: Request, res: Response) => {
    const recs = recommendationEngine.getRecommendations(req.body, req.body.limit || 5);
    res.json({
      count: recs.length,
      recommendations: recs,
    });
  });

  // 9. Streaming Availability
  app.get('/availability', (req: Request, res: Response) => {
    const animeId = req.query.anime_id as string;
    const country = (req.query.country as string) || 'MA';
    const platform = req.query.platform as string | undefined;

    if (!animeId) {
      res.status(400).json({ error: 'BAD_REQUEST', message: '"anime_id" query parameter is required.' });
      return;
    }

    const availability = availabilityService.getAvailability({ animeId, country, platform });
    if (!availability) {
      res.status(404).json({ error: 'ANIME_NOT_FOUND', message: `No anime found with ID "${animeId}"` });
      return;
    }

    res.json(availability);
  });

  // 10. Scene & Clip Search
  app.post('/scenes/search', (req: Request, res: Response) => {
    const { query, anime_id, limit } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'BAD_REQUEST', message: '"query" string field is required.' });
      return;
    }

    const matches = sceneEngine.search(query, anime_id, limit || 5);
    res.json({
      query,
      total: matches.length,
      matches,
    });
  });

  // 11. Image Search
  app.get('/images/search', (req: Request, res: Response) => {
    const q = (req.query.q as string || '').toLowerCase().trim();
    const type = (req.query.type as string || 'all').toLowerCase();
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;

    const allAnime = animeDb.getAll();
    const images: AnimeImage[] = [];

    for (const anime of allAnime) {
      const matchAnime =
        !q ||
        anime.titles.english.toLowerCase().includes(q) ||
        anime.titles.romaji.toLowerCase().includes(q) ||
        anime.titles.arabic.includes(q);

      if (matchAnime) {
        if (type === 'all' || type === 'poster') {
          images.push({
            id: `poster-${anime.id}`,
            url: anime.images.poster,
            type: 'poster',
            title: `${anime.titles.english} Official Poster`,
            resolution: '800x1200 (HD)',
            attribution: anime.images.sourceAttribution,
            sourceUrl: anime.images.poster,
            animeId: anime.id,
          });
        }
        if ((type === 'all' || type === 'banner') && anime.images.banner) {
          images.push({
            id: `banner-${anime.id}`,
            url: anime.images.banner,
            type: 'banner',
            title: `${anime.titles.english} Official Banner`,
            resolution: '1600x600 (Ultra-Wide)',
            attribution: anime.images.sourceAttribution,
            sourceUrl: anime.images.banner,
            animeId: anime.id,
          });
        }
        for (let i = 0; i < anime.images.keyVisuals.length; i++) {
          if (type === 'all' || type === 'key_visual') {
            images.push({
              id: `kv-${anime.id}-${i}`,
              url: anime.images.keyVisuals[i],
              type: 'key_visual',
              title: `${anime.titles.english} Key Visual ${i + 1}`,
              resolution: '1000x1400 (High-Res)',
              attribution: anime.images.sourceAttribution,
              sourceUrl: anime.images.keyVisuals[i],
              animeId: anime.id,
            });
          }
        }
      }

      // Check characters
      for (const char of anime.characters) {
        if (!q || char.name.full.toLowerCase().includes(q) || matchAnime) {
          if (type === 'all' || type === 'character') {
            images.push({
              id: `char-${char.id}`,
              url: char.image,
              type: 'character',
              title: `${char.name.full} (${anime.titles.english})`,
              resolution: '600x800',
              attribution: `${anime.studios[0]?.name || 'Studio'} Official Character Sheet`,
              sourceUrl: char.image,
              animeId: anime.id,
              characterId: char.id,
            });
          }
        }
      }
    }

    res.json({
      query: q,
      total: images.length,
      images: images.slice(0, limit),
    });
  });

  // 12. Source Provenance Audit
  app.get('/sources/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const anime = animeDb.getById(id);
    if (!anime) {
      res.status(404).json({ error: 'ANIME_NOT_FOUND', message: `No anime found with ID "${id}"` });
      return;
    }

    res.json({
      animeId: anime.id,
      verifiedBy: anime.source.verifiedBy,
      lastUpdated: anime.source.lastUpdated,
      canonSource: anime.canonNotes.canonSource,
      hasOfficialLicensing: anime.streaming.length > 0,
      databaseTier: 'Normalized Verified Knowledge Base',
    });
  });

  // 13. Incremental Sync Trigger (AniList / Jikan)
  app.post('/sync/anilist', async (req: Request, res: Response) => {
    const query = req.body.query as string;
    if (!query) {
      res.status(400).json({ error: 'BAD_REQUEST', message: '"query" string is required' });
      return;
    }
    const synced = await ingestionService.fetchFromAniList(query);
    if (!synced) {
      res.status(502).json({ error: 'INGESTION_ERROR', message: `Could not sync "${query}" from AniList` });
      return;
    }
    res.json({ success: true, anime: synced });
  });

  // Vite dev middleware vs production static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Server Error]', err);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred in the AI Engine',
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Anime Intelligence AI Engine active on http://0.0.0.0:${PORT}`);
    console.log(`📚 OpenAPI Specification ready at http://0.0.0.0:${PORT}/api/openapi.json`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
