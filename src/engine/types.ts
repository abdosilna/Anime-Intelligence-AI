/**
 * Core type definitions for Anime Intelligence AI
 */

export type FormatType = 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special';
export type StatusType = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED';
export type ConfidenceLevel = 'verified' | 'estimated' | 'unconfirmed';

export interface TitleCollection {
  romaji: string;
  english: string;
  native: string; // Japanese Kanji / Kana
  arabic: string; // Modern Standard Arabic
  arabicAliases: string[]; // Moroccan Darija, Middle Eastern aliases, Spacetoon titles
  synonyms: string[];
}

export interface CharacterRecord {
  id: string;
  name: {
    full: string;
    native?: string;
    arabic?: string;
  };
  role: 'MAIN' | 'SUPPORTING';
  voiceActors: Array<{
    name: string;
    language: string;
  }>;
  description: string;
  abilities: string[];
  image: string;
}

export interface RelationRecord {
  animeId: string;
  relationType: 'PREQUEL' | 'SEQUEL' | 'SIDE_STORY' | 'SPIN_OFF' | 'ALTERNATIVE';
  title: string;
}

export interface StreamingAvailability {
  platform: 'Crunchyroll' | 'Netflix' | 'Amazon Prime Video' | 'Disney+' | 'HIDIVE' | 'Shahid' | 'OSN+';
  countries: string[]; // ISO country codes: 'US', 'MA', 'JP', 'UK', 'FR', 'DE', 'EG', 'SA', 'CA', etc.
  url: string; // Deep link or official platform search URL
  isDeepLink: boolean;
  dubAvailable: string[];
  subAvailable: string[];
  lastVerified: string;
  confidence: ConfidenceLevel;
  notes?: string;
}

export interface AnimeImage {
  id: string;
  url: string;
  type: 'poster' | 'banner' | 'key_visual' | 'character' | 'promo';
  title: string;
  resolution?: string;
  attribution: string;
  sourceUrl: string;
  animeId: string;
  characterId?: string;
}

export interface CanonNotes {
  canonSource: string; // e.g. "Manga chapters 1-139 by Hajime Isayama"
  fillerEpisodes: string[];
  keyArcChronology: Array<{
    arcName: string;
    arcNameArabic?: string;
    episodes: string;
    isCanon: boolean;
  }>;
}

export interface SpoilerData {
  majorPlotTwists: string[];
  characterFates: string[];
  endingSummary: string;
}

export interface AnimeRecord {
  id: string; // Unique slug identifier
  malId?: number;
  aniListId?: number;
  kitsuId?: string;
  titles: TitleCollection;
  format: FormatType;
  status: StatusType;
  episodes: number | null;
  durationMinutes: number | null;
  season: string;
  seasonYear: number;
  startDate: string;
  endDate?: string;
  synopsis: string;
  synopsisArabic: string;
  genres: string[];
  themes: string[];
  score: number; // e.g. 9.02
  popularityRank: number;
  studios: Array<{ name: string; isMain: boolean }>;
  staff: Array<{ name: string; role: string }>;
  characters: CharacterRecord[];
  relations: RelationRecord[];
  streaming: StreamingAvailability[];
  images: {
    poster: string;
    banner?: string;
    keyVisuals: string[];
    sourceAttribution: string;
  };
  trailer?: {
    site: 'youtube' | 'dailymotion';
    id: string;
    url: string;
  };
  canonNotes: CanonNotes;
  spoilers: SpoilerData;
  source: {
    verifiedBy: string[];
    lastUpdated: string;
  };
}

export interface SceneRecord {
  id: string;
  animeId: string;
  animeTitle: string;
  season: number;
  episode: number;
  timestampApprox?: string;
  sceneTitle: string;
  sceneTitleArabic: string;
  description: string;
  descriptionArabic: string;
  keywords: string[];
  charactersInvolved: string[];
  emotionalBeat: 'epic' | 'emotional' | 'mystery' | 'humorous' | 'action' | 'tragedy';
  officialClipUrl?: string;
  officialClipChannel?: string;
  isLegalLink: boolean;
  confidence: ConfidenceLevel;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  citations?: Array<{
    title: string;
    animeId?: string;
    url?: string;
    source: string;
  }>;
  spoilersContained?: boolean;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  spoilerMode?: 'safe' | 'unrestricted';
  language?: 'auto' | 'ar' | 'en' | 'ja' | 'darija';
}

export interface RecommendationRequest {
  genres?: string[];
  mood?: string;
  pacing?: 'fast' | 'moderate' | 'slow';
  maxEpisodes?: number;
  status?: StatusType;
  minScore?: number;
  targetCountry?: string; // e.g. 'MA', 'US'
  includeNiche?: boolean;
}

export interface RecommendationResult {
  anime: AnimeRecord;
  matchScore: number;
  reasons: string[];
  reasonsArabic: string[];
  isNicheGem: boolean;
  streamingInCountry?: StreamingAvailability[];
}
