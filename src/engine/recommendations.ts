import { RecommendationRequest, RecommendationResult, AnimeRecord } from './types.ts';
import { animeDb } from './database.ts';

export class RecommendationEngine {
  /**
   * Recommends anime based on multidimensional preferences
   */
  public getRecommendations(req: RecommendationRequest, limit = 5): RecommendationResult[] {
    const catalog = animeDb.getAll();

    const scoredResults: Array<{
      anime: AnimeRecord;
      score: number;
      reasons: string[];
      reasonsArabic: string[];
      isNicheGem: boolean;
    }> = [];

    const requestedGenres = (req.genres || []).map((g) => g.toLowerCase());
    const requestedMood = req.mood?.toLowerCase() || '';

    for (const anime of catalog) {
      let score = 0;
      const reasons: string[] = [];
      const reasonsArabic: string[] = [];

      // 1. Genre matching
      const animeGenres = anime.genres.map((g) => g.toLowerCase());
      const animeThemes = anime.themes.map((t) => t.toLowerCase());

      if (requestedGenres.length > 0) {
        let matchingGenreCount = 0;
        for (const gen of requestedGenres) {
          if (animeGenres.includes(gen) || animeThemes.includes(gen)) {
            matchingGenreCount++;
            score += 25;
            reasons.push(`Matches preferred genre/theme: ${gen.toUpperCase()}`);
            reasonsArabic.push(`يطابق التصنيف/السمة المفضلة: ${gen}`);
          }
        }
        if (matchingGenreCount === 0 && requestedGenres.length > 1) {
          // Skip if none matched and multiple genres were requested
          continue;
        }
      } else {
        // Base score based on critical reception
        score += anime.score * 5;
      }

      // 2. Mood & Tone matching
      if (requestedMood) {
        if (
          (requestedMood.includes('dark') || requestedMood.includes('serious') || requestedMood.includes('غموض') || requestedMood.includes('مظلم')) &&
          (animeThemes.includes('psychological') || animeThemes.includes('survival') || anime.genres.includes('Suspense'))
        ) {
          score += 20;
          reasons.push('Delivers the dark, gripping psychological tension requested.');
          reasonsArabic.push('يقدم أجواء التوتر النفسي والغموض المشوق المطلوب.');
        } else if (
          (requestedMood.includes('chill') || requestedMood.includes('relax') || requestedMood.includes('هادئ') || requestedMood.includes('ممتع')) &&
          (animeThemes.includes('slice of life') || animeThemes.includes('time & mortality') || anime.genres.includes('Comedy'))
        ) {
          score += 20;
          reasons.push('Features warm, reflective pacing and rich emotional comfort.');
          reasonsArabic.push('يتميز بأجواء هادئة وتأملية ودفء عاطفي كبير.');
        } else if (
          (requestedMood.includes('hype') || requestedMood.includes('action') || requestedMood.includes('حماس') || requestedMood.includes('قتال')) &&
          anime.genres.includes('Action')
        ) {
          score += 20;
          reasons.push('Packed with high-adrenaline combat and premier animation craft.');
          reasonsArabic.push('مليء بالمواجهات الحماسية الحابسة للأنفاس والإنتاج البصري المتقن.');
        }
      }

      // 3. Pacing preference
      if (req.pacing) {
        if (req.pacing === 'fast' && (anime.id === 'death-note' || anime.id === 'jujutsu-kaisen')) {
          score += 15;
          reasons.push('Fast-paced narrative with relentless twists and high momentum.');
          reasonsArabic.push('سرد سريع الوتيرة مع مفاجآت متتالية وإثارة مستمرة.');
        } else if (req.pacing === 'slow' && (anime.id === 'frieren-beyond-journeys-end' || anime.id === 'vinland-saga')) {
          score += 15;
          reasons.push('Carefully measured, contemplative character-driven storytelling.');
          reasonsArabic.push('تطور شخصيات عميق وتأملي مع وتيرة متأنية وثرية.');
        }
      }

      // 4. Max Episodes constraint
      if (req.maxEpisodes && anime.episodes) {
        if (anime.episodes <= req.maxEpisodes) {
          score += 15;
          reasons.push(`Accessible episode count (${anime.episodes} eps) fitting your time budget.`);
          reasonsArabic.push(`عدد حلقات مناسب (${anime.episodes} حلقة) يناسب جدولك الزمني.`);
        } else {
          score -= 30; // Penalize if exceeds requested episode limit
        }
      }

      // 5. Completion Status
      if (req.status && anime.status !== req.status) {
        continue;
      }

      // 6. Minimum score filter
      if (req.minScore && anime.score < req.minScore) {
        continue;
      }

      // 7. Hidden Gem / Underrated evaluation
      // (Popularity rank > 6 or niche format with score >= 8.70)
      const isNicheGem = anime.popularityRank >= 8 || anime.id === 'bocchi-the-rock' || anime.id === 'steins-gate';
      if (isNicheGem) {
        score += 10;
        reasons.push('Critically acclaimed gem with unique artistic identity beyond generic trends.');
        reasonsArabic.push('عمل استثنائي وإشادة نقدية واسعة خارج الأنماط التجارية المعتادة.');
      }

      // 8. Regional availability match
      let countryStreaming = anime.streaming;
      if (req.targetCountry) {
        const cCode = req.targetCountry.toUpperCase();
        countryStreaming = anime.streaming.filter((s) => s.countries.includes(cCode));
        if (countryStreaming.length > 0) {
          score += 10;
          reasons.push(`Confirmed legal streaming on ${countryStreaming[0].platform} in ${cCode}.`);
          reasonsArabic.push(`متوفر رسميًا عبر منصة ${countryStreaming[0].platform} في دولتك (${cCode}).`);
        }
      }

      if (reasons.length === 0) {
        reasons.push(`Masterpiece rating: ${anime.score}/10 by animation studio ${anime.studios[0]?.name}.`);
        reasonsArabic.push(`تقييم نقدي عالٍ (${anime.score}/10) من إنتاج استوديو ${anime.studios[0]?.name}.`);
      }

      scoredResults.push({
        anime,
        score,
        reasons,
        reasonsArabic,
        isNicheGem,
      });
    }

    return scoredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => ({
        anime: item.anime,
        matchScore: Math.min(100, Math.max(10, item.score)),
        reasons: item.reasons,
        reasonsArabic: item.reasonsArabic,
        isNicheGem: item.isNicheGem,
        streamingInCountry: req.targetCountry
          ? item.anime.streaming.filter((s) => s.countries.includes(req.targetCountry!.toUpperCase()))
          : item.anime.streaming,
      }));
  }
}

export const recommendationEngine = new RecommendationEngine();
