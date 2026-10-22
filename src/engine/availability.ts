import { StreamingAvailability, ConfidenceLevel } from './types.ts';
import { animeDb } from './database.ts';

export interface CountryMetadata {
  code: string;
  name: string;
  nameArabic: string;
  region: 'MENA' | 'NA' | 'EU' | 'ASIA';
}

export const SUPPORTED_COUNTRIES: CountryMetadata[] = [
  { code: 'MA', name: 'Morocco', nameArabic: 'المغرب', region: 'MENA' },
  { code: 'US', name: 'United States', nameArabic: 'الولايات المتحدة', region: 'NA' },
  { code: 'JP', name: 'Japan', nameArabic: 'اليابان', region: 'ASIA' },
  { code: 'FR', name: 'France', nameArabic: 'فرنسا', region: 'EU' },
  { code: 'UK', name: 'United Kingdom', nameArabic: 'المملكة المتحدة', region: 'EU' },
  { code: 'DE', name: 'Germany', nameArabic: 'ألمانيا', region: 'EU' },
  { code: 'CA', name: 'Canada', nameArabic: 'كندا', region: 'NA' },
  { code: 'EG', name: 'Egypt', nameArabic: 'مصر', region: 'MENA' },
  { code: 'SA', name: 'Saudi Arabia', nameArabic: 'المملكة العربية السعودية', region: 'MENA' },
  { code: 'AE', name: 'United Arab Emirates', nameArabic: 'الإمارات العربية المتحدة', region: 'MENA' },
];

export interface AvailabilityQuery {
  animeId: string;
  country?: string; // ISO 2-letter code, defaults to 'MA' or 'US'
  platform?: string;
  hasArabicSubOrDub?: boolean;
}

export interface AvailabilityResult {
  animeId: string;
  animeTitle: string;
  country: string;
  countryName: string;
  countryNameArabic: string;
  platforms: StreamingAvailability[];
  unverifiedFallbackNotice?: string;
  officialSearchFallbacks: Array<{
    platform: string;
    searchUrl: string;
    note: string;
  }>;
}

export class StreamingAvailabilityService {
  /**
   * Resolves verified streaming platforms for an anime in a given country
   */
  public getAvailability(query: AvailabilityQuery): AvailabilityResult | null {
    const anime = animeDb.getById(query.animeId);
    if (!anime) return null;

    const targetCountry = (query.country || 'MA').toUpperCase();
    const countryMeta = SUPPORTED_COUNTRIES.find((c) => c.code === targetCountry) || {
      code: targetCountry,
      name: targetCountry,
      nameArabic: targetCountry,
      region: 'MENA' as const,
    };

    // Filter anime streaming list by matching country code
    let matchingPlatforms = anime.streaming.filter((stream) => stream.countries.includes(targetCountry));

    // Optional platform filter
    if (query.platform) {
      matchingPlatforms = matchingPlatforms.filter(
        (p) => p.platform.toLowerCase() === query.platform!.toLowerCase()
      );
    }

    // Optional Arabic subtitles/dub filter
    if (query.hasArabicSubOrDub) {
      matchingPlatforms = matchingPlatforms.filter(
        (p) =>
          p.subAvailable.some((s) => s.toLowerCase().includes('arabic')) ||
          p.dubAvailable.some((d) => d.toLowerCase().includes('arabic'))
      );
    }

    // Build legal verified search fallbacks if no direct deep link is active
    const encodedTitle = encodeURIComponent(anime.titles.english || anime.titles.romaji);
    const searchFallbacks = [
      {
        platform: 'Crunchyroll',
        searchUrl: `https://www.crunchyroll.com/search?q=${encodedTitle}`,
        note: 'Official catalog search (Requires Crunchyroll regional license)',
      },
      {
        platform: 'Netflix',
        searchUrl: `https://www.netflix.com/search?q=${encodedTitle}`,
        note: 'Official Netflix regional directory',
      },
    ];

    if (countryMeta.region === 'MENA') {
      const arabicTitle = encodeURIComponent(anime.titles.arabic || anime.titles.english);
      searchFallbacks.push({
        platform: 'Shahid VIP',
        searchUrl: `https://shahid.mbc.net/ar/search?q=${arabicTitle}`,
        note: 'Official licensed MENA streaming portal (MBC / Shahid)',
      });
    }

    return {
      animeId: anime.id,
      animeTitle: anime.titles.english || anime.titles.romaji,
      country: targetCountry,
      countryName: countryMeta.name,
      countryNameArabic: countryMeta.nameArabic,
      platforms: matchingPlatforms,
      unverifiedFallbackNotice:
        matchingPlatforms.length === 0
          ? `No directly confirmed streaming license was found for "${anime.titles.english}" in ${countryMeta.name} (${targetCountry}). You can check the legal platform search links below.`
          : undefined,
      officialSearchFallbacks: matchingPlatforms.length === 0 ? searchFallbacks : [],
    };
  }
}

export const availabilityService = new StreamingAvailabilityService();
