/**
 * Multilingual Normalizer & Search Utilities
 * Handles Modern Standard Arabic (MSA), Moroccan Darija phonetic variants,
 * Japanese (Kanji/Kana & Romaji), and English title normalization.
 */

// Arabic Tashkeel / Harakat regex (FatHa, Damma, Kasra, Sukun, Shadda, Tanween)
const ARABIC_DIACRITICS_REGEX = /[\u064B-\u0652\u0670\u0640]/g;

// Distinct Moroccan Darija dialect vocabulary markers (words specific to Moroccan dialect)
const DARIJA_DIALECT_MARKERS = [
  'ديال', // 'of / belongs to'
  'زوين', // 'good / beautiful'
  'مزيان', // 'good'
  'مخير', // 'excellent'
  'بزاف', // 'a lot'
  'واش', // 'is it / whether'
  'بغيت', // 'I want'
  'شنو', // 'what'
  'علاش', // 'why'
  'كاين', // 'there is'
  'درك', // 'now'
  'دابا', // 'now'
];

/**
 * Normalizes an Arabic string for resilient searching:
 * - Removes diacritics (Harakat)
 * - Normalizes Alef forms (أ, إ, آ, ٱ -> ا)
 * - Normalizes Taa Marbuta (ة -> ه)
 * - Normalizes Yaa forms (ى -> ي)
 * - Strips Tatweel (ـ)
 * - Trims and normalizes spaces
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';

  let normalized = text
    .replace(ARABIC_DIACRITICS_REGEX, '') // Strip Tashkeel & Tatweel
    .replace(/[أإآٱ]/g, 'ا') // Normalize Alef
    .replace(/ة/g, 'ه') // Normalize Taa Marbuta
    .replace(/ى/g, 'ي') // Normalize Alef Maqsura to Yaa
    .replace(/[\u0600-\u061F\u06D6-\u06ED]/g, '') // Arabic punctuation
    .toLowerCase()
    .trim();

  // Normalize multiple spaces
  normalized = normalized.replace(/\s+/g, ' ');

  return normalized;
}

/**
 * Strips Arabic definite article 'ال' for fuzzy prefix matches
 */
export function stripArabicDefiniteArticle(word: string): string {
  const norm = normalizeArabic(word);
  if (norm.startsWith('ال') && norm.length > 3) {
    return norm.slice(2);
  }
  return norm;
}

/**
 * Normalizes Romaji and Latin text (folds macrons like ō -> ou, ū -> uu)
 */
export function normalizeRomaji(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/ō/g, 'ou')
    .replace(/ū/g, 'uu')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent diacritics
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes Japanese text (Hiragana / Katakana / Kanji)
 */
export function normalizeJapanese(text: string): string {
  if (!text) return '';
  // Convert full-width alphanumeric to half-width and trim
  return text
    .replace(/[\uff01-\uff5e]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/\s+/g, '')
    .trim();
}

/**
 * Detect language of query: 'ar' | 'darija' | 'ja' | 'en'
 */
export function detectLanguage(query: string): 'ar' | 'darija' | 'ja' | 'en' {
  const arabicRegex = /[\u0600-\u06FF]/;
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;

  if (japaneseRegex.test(query)) {
    return 'ja';
  }

  if (arabicRegex.test(query)) {
    // Check if contains Moroccan Darija dialect vocabulary markers
    const norm = normalizeArabic(query);
    const tokens = norm.split(/\s+/);
    for (const marker of DARIJA_DIALECT_MARKERS) {
      if (tokens.includes(marker) || norm.includes(marker)) {
        return 'darija';
      }
    }
    return 'ar';
  }

  return 'en';
}

/**
 * Compute token overlap / Jaccard similarity score between 0 and 1
 */
export function computeTokenSimilarity(strA: string, strB: string): number {
  if (!strA || !strB) return 0;
  const tokensA = new Set(strA.toLowerCase().split(/\s+/).filter(Boolean));
  const tokensB = new Set(strB.toLowerCase().split(/\s+/).filter(Boolean));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersectionCount = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersectionCount++;
    }
  }

  const unionCount = new Set([...tokensA, ...tokensB]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Levenshtein distance between two short strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const n = a.length;
  const m = b.length;

  if (n === 0) return m;
  if (m === 0) return n;

  for (let i = 0; i <= n; i++) matrix[i] = [i];
  for (let j = 0; j <= m; j++) matrix[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[n][m];
}

/**
 * Calculates string similarity between 0 and 1 using Levenshtein distance
 */
export function levenshteinSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  return 1 - levenshteinDistance(a, b) / maxLen;
}
