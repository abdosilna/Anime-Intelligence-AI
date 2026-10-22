import { AnimeRecord } from './types.ts';
import { animeDb } from './database.ts';

/**
 * Ingestion and Data Sync Client
 * Integrates with:
 * 1. AniList GraphQL API (Public, no API key required, 90 req/min limit)
 * 2. Jikan API v4 (Public MyAnimeList mirror, 3 req/sec limit)
 * 3. Kitsu API (Public JSON:API)
 */

interface AniListResponse {
  data?: {
    Media?: {
      id: number;
      idMal?: number;
      title?: {
        romaji?: string;
        english?: string;
        native?: string;
      };
      format?: string;
      status?: string;
      episodes?: number;
      duration?: number;
      season?: string;
      seasonYear?: number;
      description?: string;
      genres?: string[];
      averageScore?: number;
      coverImage?: {
        large?: string;
        extraLarge?: string;
      };
      bannerImage?: string;
      studios?: {
        nodes?: Array<{ name: string; isAnimationStudio: boolean }>;
      };
      trailer?: {
        id?: string;
        site?: string;
      };
    };
  };
}

export class IngestionService {
  private lastAniListRequestTime = 0;
  private lastJikanRequestTime = 0;

  /**
   * Fetches an anime from AniList GraphQL and normalizes it
   */
  public async fetchFromAniList(searchQuery: string): Promise<AnimeRecord | null> {
    const query = `
      query ($search: String) {
        Media(search: $search, type: ANIME) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          format
          status
          episodes
          duration
          season
          seasonYear
          description(asHtml: false)
          genres
          averageScore
          coverImage {
            large
            extraLarge
          }
          bannerImage
          studios(isMain: true) {
            nodes {
              name
              isAnimationStudio
            }
          }
          trailer {
            id
            site
          }
        }
      }
    `;

    // Rate-limiting pause (ensure at least 700ms between calls)
    const now = Date.now();
    const elapsed = now - this.lastAniListRequestTime;
    if (elapsed < 700) {
      await new Promise((res) => setTimeout(res, 700 - elapsed));
    }
    this.lastAniListRequestTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { search: searchQuery },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[AniList Ingestion] Status ${res.status} for query "${searchQuery}"`);
        return null;
      }

      const json: AniListResponse = await res.json();
      const media = json.data?.Media;
      if (!media) return null;

      const slug = (media.title?.english || media.title?.romaji || `anime-${media.id}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Check if already in DB to preserve verified local translations & canon notes
      const existing = animeDb.getById(slug);

      const record: AnimeRecord = {
        id: slug,
        aniListId: media.id,
        malId: media.idMal,
        titles: {
          romaji: media.title?.romaji || '',
          english: media.title?.english || media.title?.romaji || '',
          native: media.title?.native || '',
          arabic: existing?.titles.arabic || media.title?.romaji || '',
          arabicAliases: existing?.titles.arabicAliases || [],
          synonyms: existing?.titles.synonyms || [],
        },
        format: (media.format as any) || 'TV',
        status: (media.status as any) || 'FINISHED',
        episodes: media.episodes || null,
        durationMinutes: media.duration || null,
        season: media.season || 'UNKNOWN',
        seasonYear: media.seasonYear || new Date().getFullYear(),
        startDate: `${media.seasonYear || '2020'}-01-01`,
        synopsis: media.description ? media.description.replace(/<[^>]*>?/gm, '') : 'No synopsis provided.',
        synopsisArabic: existing?.synopsisArabic || 'تفاصيل القصة قيد التوثيق.',
        genres: media.genres || [],
        themes: existing?.themes || [],
        score: media.averageScore ? Number((media.averageScore / 10).toFixed(2)) : 8.0,
        popularityRank: existing?.popularityRank || 99,
        studios: (media.studios?.nodes || []).map((s) => ({ name: s.name, isMain: true })),
        staff: existing?.staff || [],
        characters: existing?.characters || [],
        relations: existing?.relations || [],
        streaming: existing?.streaming || [],
        images: {
          poster: media.coverImage?.extraLarge || media.coverImage?.large || '',
          banner: media.bannerImage,
          keyVisuals: existing?.images.keyVisuals || [],
          sourceAttribution: 'AniList GraphQL API / Official Publisher Media',
        },
        trailer: media.trailer?.id
          ? {
              site: 'youtube',
              id: media.trailer.id,
              url: `https://www.youtube.com/watch?v=${media.trailer.id}`,
            }
          : undefined,
        canonNotes: existing?.canonNotes || {
          canonSource: 'Official release record',
          fillerEpisodes: [],
          keyArcChronology: [],
        },
        spoilers: existing?.spoilers || {
          majorPlotTwists: [],
          characterFates: [],
          endingSummary: 'No spoilers indexed for this entry.',
        },
        source: {
          verifiedBy: ['AniList GraphQL Live API'],
          lastUpdated: new Date().toISOString().split('T')[0],
        },
      };

      animeDb.addOrUpdate(record);
      return record;
    } catch (err: any) {
      console.warn(`[AniList Ingestion Failed] ${err.message}`);
      return null;
    }
  }

  /**
   * Fetches anime metadata from Jikan v4 (Unofficial MyAnimeList REST API)
   */
  public async fetchFromJikan(malId: number): Promise<AnimeRecord | null> {
    const now = Date.now();
    const elapsed = now - this.lastJikanRequestTime;
    if (elapsed < 1000) {
      await new Promise((res) => setTimeout(res, 1000 - elapsed));
    }
    this.lastJikanRequestTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[Jikan Ingestion] Status ${res.status} for MAL ID ${malId}`);
        return null;
      }

      const json = await res.json();
      const data = json.data;
      if (!data) return null;

      const slug = (data.title_english || data.title || `mal-${malId}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const existing = animeDb.getById(slug);

      const record: AnimeRecord = {
        id: slug,
        malId: data.mal_id,
        titles: {
          romaji: data.title || '',
          english: data.title_english || data.title || '',
          native: data.title_japanese || '',
          arabic: existing?.titles.arabic || '',
          arabicAliases: existing?.titles.arabicAliases || [],
          synonyms: data.titles ? data.titles.map((t: any) => t.title) : [],
        },
        format: data.type || 'TV',
        status: data.status === 'Finished Airing' ? 'FINISHED' : 'RELEASING',
        episodes: data.episodes || null,
        durationMinutes: data.duration ? parseInt(data.duration) || 24 : 24,
        season: (data.season || 'UNKNOWN').toUpperCase(),
        seasonYear: data.year || (data.aired?.from ? new Date(data.aired.from).getFullYear() : 2020),
        startDate: data.aired?.from ? data.aired.from.split('T')[0] : '2020-01-01',
        endDate: data.aired?.to ? data.aired.to.split('T')[0] : undefined,
        synopsis: data.synopsis || 'No synopsis provided.',
        synopsisArabic: existing?.synopsisArabic || 'تفاصيل القصة قيد المراجعة.',
        genres: (data.genres || []).map((g: any) => g.name),
        themes: (data.themes || []).map((t: any) => t.name),
        score: data.score || 8.0,
        popularityRank: data.popularity || 99,
        studios: (data.studios || []).map((s: any) => ({ name: s.name, isMain: true })),
        staff: existing?.staff || [],
        characters: existing?.characters || [],
        relations: existing?.relations || [],
        streaming: existing?.streaming || [],
        images: {
          poster: data.images?.jpg?.large_image_url || data.images?.jpg?.image_url || '',
          keyVisuals: existing?.images.keyVisuals || [],
          sourceAttribution: 'MyAnimeList via Jikan REST API v4',
        },
        trailer: data.trailer?.youtube_id
          ? {
              site: 'youtube',
              id: data.trailer.youtube_id,
              url: data.trailer.url || `https://www.youtube.com/watch?v=${data.trailer.youtube_id}`,
            }
          : undefined,
        canonNotes: existing?.canonNotes || {
          canonSource: 'MyAnimeList Official Record',
          fillerEpisodes: [],
          keyArcChronology: [],
        },
        spoilers: existing?.spoilers || {
          majorPlotTwists: [],
          characterFates: [],
          endingSummary: '',
        },
        source: {
          verifiedBy: ['Jikan REST API v4'],
          lastUpdated: new Date().toISOString().split('T')[0],
        },
      };

      animeDb.addOrUpdate(record);
      return record;
    } catch (err: any) {
      console.warn(`[Jikan Ingestion Failed] ${err.message}`);
      return null;
    }
  }
}

export const ingestionService = new IngestionService();
