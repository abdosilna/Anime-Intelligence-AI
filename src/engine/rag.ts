import { GoogleGenAI } from '@google/genai';
import { ChatRequest, ChatMessage, AnimeRecord } from './types.ts';
import { animeDb } from './database.ts';
import { detectLanguage, normalizeArabic } from './normalizer.ts';

// In-memory conversation session store
const conversationSessions: Map<string, ChatMessage[]> = new Map();

/**
 * Initializes Gemini client if API key is present
 */
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export class RAGEngine {
  /**
   * Main Question Answering handler
   */
  public async answerQuestion(req: ChatRequest): Promise<ChatMessage> {
    const conversationId = req.conversationId || 'default-session';
    const history = conversationSessions.get(conversationId) || [];
    const spoilerMode = req.spoilerMode || 'safe';
    const detectedLang = req.language && req.language !== 'auto' ? req.language : detectLanguage(req.message);

    // 1. Retrieval Stage: search knowledge base for relevant anime & character records
    const retrievedAnime = this.retrieveContext(req.message);

    // 2. Build citations
    const citations = retrievedAnime.map((a) => ({
      title: a.titles.english || a.titles.romaji,
      animeId: a.id,
      url: a.streaming[0]?.url || `https://myanimelist.net/anime/${a.malId || ''}`,
      source: a.source.verifiedBy.join(', '),
    }));

    // 3. Check for spoilers in context
    const hasSpoilersInContext = retrievedAnime.some(
      (a) => a.spoilers.majorPlotTwists.length > 0 || a.spoilers.characterFates.length > 0
    );

    let answerText = '';

    // 4. Try Gemini 3.8 Flash via @google/genai
    const ai = getGeminiClient();
    if (ai) {
      try {
        answerText = await this.generateWithGemini(ai, req.message, history, retrievedAnime, spoilerMode, detectedLang);
      } catch (err: any) {
        console.warn(`[Gemini RAG fallback] API call failed: ${err.message}. Using deterministic local RAG.`);
        answerText = this.generateDeterministicRAG(req.message, retrievedAnime, spoilerMode, detectedLang);
      }
    } else {
      // Local deterministic grounded RAG engine
      answerText = this.generateDeterministicRAG(req.message, retrievedAnime, spoilerMode, detectedLang);
    }

    const responseMsg: ChatMessage = {
      role: 'assistant',
      content: answerText,
      timestamp: Date.now(),
      citations,
      spoilersContained: spoilerMode === 'unrestricted' && hasSpoilersInContext,
    };

    // Update conversation history
    const userMsg: ChatMessage = {
      role: 'user',
      content: req.message,
      timestamp: Date.now() - 500,
    };
    conversationSessions.set(conversationId, [...history, userMsg, responseMsg]);

    return responseMsg;
  }

  /**
   * Retrieves matching anime records using multi-attribute search
   */
  private retrieveContext(query: string): AnimeRecord[] {
    const cleanQuery = query.replace(/[؟!?,.;:()]/g, ' ').trim();
    const directResults = animeDb.search(cleanQuery, { limit: 3 });
    if (directResults.length > 0) return directResults;

    // Fallback: search by tokens
    const tokens = cleanQuery.split(/\s+/).filter((t) => t.length > 2);
    for (const token of tokens) {
      const tokenMatch = animeDb.search(token, { limit: 2 });
      if (tokenMatch.length > 0) return tokenMatch;
    }

    // Default to top canonical records for general queries
    return animeDb.getAll().slice(0, 2);
  }

  /**
   * Generates answer using Gemini 3.8 Flash
   */
  private async generateWithGemini(
    ai: GoogleGenAI,
    query: string,
    history: ChatMessage[],
    context: AnimeRecord[],
    spoilerMode: 'safe' | 'unrestricted',
    lang: 'ar' | 'darija' | 'ja' | 'en'
  ): Promise<string> {
    const contextSummary = context
      .map((a) => {
        return `
ANIME: ${a.titles.english} (${a.titles.romaji} / ${a.titles.native} / ${a.titles.arabic})
Format: ${a.format}, Episodes: ${a.episodes ?? 'Ongoing'}, Year: ${a.seasonYear}, Score: ${a.score}/10
Studios: ${a.studios.map((s) => s.name).join(', ')}
Genres: ${a.genres.join(', ')}, Themes: ${a.themes.join(', ')}
Synopsis: ${a.synopsis}
Arabic Synopsis: ${a.synopsisArabic}
Canon Source: ${a.canonNotes.canonSource}
Filler Episodes: ${a.canonNotes.fillerEpisodes.join('; ') || 'None'}
Key Arcs: ${a.canonNotes.keyArcChronology.map((arc) => `${arc.arcName} (eps ${arc.episodes})`).join(', ')}
Characters: ${a.characters.map((c) => `${c.name.full} (${c.role}): ${c.description}. Abilities: ${c.abilities.join(', ')}`).join('\n')}
Legal Streaming: ${a.streaming.map((s) => `${s.platform} [Countries: ${s.countries.join(',')}]`).join('; ')}
${
  spoilerMode === 'unrestricted'
    ? `MAJOR PLOT TWISTS: ${a.spoilers.majorPlotTwists.join('; ')}\nCHARACTER FATES: ${a.spoilers.characterFates.join('; ')}\nENDING: ${a.spoilers.endingSummary}`
    : 'SPOILERS: STRICTLY REDACTED. DO NOT REVEAL PLOT TWISTS OR CHARACTER DEATHS.'
}
Verified Sources: ${a.source.verifiedBy.join(', ')}
`;
      })
      .join('\n---\n');

    const systemInstruction = `
You are "Anime Intelligence AI", a world-class AI anime knowledge architect and researcher.
Your guidelines:
1. FACTUAL GROUNDING: Rely strictly on the verified anime context provided. NEVER fabricate fake anime titles, character facts, episode numbers, or streaming URLs.
2. SPOILER DISCIPLINE: Current mode is "${spoilerMode}".
   - If "safe": NEVER spoil character deaths, major twists, or endings unless explicitly forced by the user. If critical context touches on a plot point, wrap it in [SPOILER WARNING: ...].
   - If "unrestricted": You may analyze endings and plot twists, but clearly denote sections with ⚠️ [SPOILER].
3. CANON VS THEORIES: Explicitly distinguish between official canon (author's manga/source) and anime filler or community theories.
4. LANGUAGE MATCHING:
   - If user asks in Modern Standard Arabic: Respond in fluent, professional Modern Standard Arabic with correct anime terminology.
   - If user asks in Moroccan Darija: Respond warmly in natural Moroccan Darija or MSA with Darija cultural context.
   - If user asks in Japanese: Respond in natural, polite Japanese (Keigo / Desu-Masu).
   - If user asks in English: Respond in clear, engaging English.
5. FORMATTING: Use markdown headings, bullet points, and highlight key character names, studios, and episode references.
`;

    const chatPrompt = `
Context Knowledge Base:
${contextSummary}

User Question: ${query}

Provide a well-structured, comprehensive answer based on the context above.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatPrompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    return response.text || 'No response generated from model.';
  }

  /**
   * Deterministic local RAG synthesis for offline / API-key-free execution
   */
  private generateDeterministicRAG(
    query: string,
    context: AnimeRecord[],
    spoilerMode: 'safe' | 'unrestricted',
    lang: 'ar' | 'darija' | 'ja' | 'en'
  ): string {
    if (context.length === 0) {
      if (lang === 'ar' || lang === 'darija') {
        return `عذرًا، لم أتمكن من العثور على سجل موثق لهذا العنوان في قاعدة بيانات الأنمي الحالية. يرجى تجربة اسم آخر بالإنجليزية أو اليابانية أو العربية (مثل: هجوم العمالقة، فريرين، ون بيس، كونان).`;
      }
      if (lang === 'ja') {
        return `申し訳ありません。該当するアニメの公式データが見つかりませんでした。英語、日本語（漢字・カナ）、またはローマ字でお試しください。`;
      }
      return `I could not locate a verified record for that title in the current knowledge base. Please try searching with official English, Romaji, or Arabic titles (e.g., Attack on Titan, Frieren, Death Note, One Piece, Detective Conan).`;
    }

    const primary = context[0];
    const isArabic = lang === 'ar' || lang === 'darija';
    const isJapanese = lang === 'ja';

    if (isArabic) {
      let text = `### 🎌 ${primary.titles.arabic} (${primary.titles.english})\n\n`;
      text += `**العنوان الأصلي**: ${primary.titles.native} (${primary.titles.romaji})\n`;
      text += `**الاستوديو**: ${primary.studios.map((s) => s.name).join(' / ')} | **التقييم**: ⭐ ${primary.score}/10 | **الحلقات**: ${primary.episodes ?? 'مستمر'}\n\n`;
      text += `#### 📖 نبذة عن القصة:\n${primary.synopsisArabic || primary.synopsis}\n\n`;

      text += `#### 👥 أهم الشخصيات والقدرات:\n`;
      for (const char of primary.characters.slice(0, 3)) {
        text += `- **${char.name.arabic || char.name.full}** (${char.voiceActors[0]?.name || 'غير محدد'}): ${char.description}\n  *القدرات*: ${char.abilities.join('، ')}\n`;
      }

      text += `\n#### 📜 التسلسل الزمني ومسار الكانون:\n`;
      text += `- **المصدر الأصلي**: ${primary.canonNotes.canonSource}\n`;
      text += `- **حلقات الفيلر**: ${primary.canonNotes.fillerEpisodes.join('، ') || 'خالٍ تمامًا من الفيلر (Canon بنسبة 100%)'}\n`;

      if (spoilerMode === 'unrestricted') {
        text += `\n⚠️ **قسم الحرق المباشر (Spoilers Activated)**:\n`;
        text += `- **أهم المنعطفات**: ${primary.spoilers.majorPlotTwists.join(' | ')}\n`;
        text += `- **خاتمة العمل**: ${primary.spoilers.endingSummary}\n`;
      } else {
        text += `\n🛡️ **وضع الحماية من الحرق مفعّل**: تم إخفاء النهايات ومصائر الشخصيات للحفاظ على متعة المشاهدة.\n`;
      }

      text += `\n📺 **المنصات الرسمية المرخصة**: ${primary.streaming.map((s) => s.platform).join('، ')}`;
      return text;
    }

    if (isJapanese) {
      let text = `### 🎌 ${primary.titles.native} (${primary.titles.english})\n\n`;
      text += `**ローマ字**: ${primary.titles.romaji} | **スタジオ**: ${primary.studios.map((s) => s.name).join(', ')}\n`;
      text += `**評価**: ⭐ ${primary.score}/10 | **話数**: ${primary.episodes ?? '放送中'}話\n\n`;
      text += `#### 📖 あらすじ:\n${primary.synopsis}\n\n`;
      text += `#### 👥 主要キャラクター:\n`;
      for (const char of primary.characters.slice(0, 3)) {
        text += `- **${char.name.native || char.name.full}** (CV: ${char.voiceActors[0]?.name}): ${char.description}\n`;
      }
      return text;
    }

    // Default English
    let text = `### 🎌 ${primary.titles.english} (*${primary.titles.romaji}* / ${primary.titles.native})\n\n`;
    text += `**Arabic Title**: ${primary.titles.arabic}\n`;
    text += `**Studio**: ${primary.studios.map((s) => s.name).join(' & ')} | **Score**: ⭐ ${primary.score}/10 | **Episodes**: ${primary.episodes ?? 'Ongoing'} (${primary.durationMinutes || 24} min/ep)\n`;
    text += `**Genres**: ${primary.genres.join(', ')} | **Themes**: ${primary.themes.join(', ')}\n\n`;

    text += `#### 📖 Verified Synopsis:\n${primary.synopsis}\n\n`;

    text += `#### 👥 Key Characters & Abilities:\n`;
    for (const char of primary.characters.slice(0, 3)) {
      text += `- **${char.name.full}** (VA: ${char.voiceActors.map((v) => `${v.name} [${v.language}]`).join(', ')}):\n  ${char.description}\n  *Key Abilities*: ${char.abilities.join(', ')}\n`;
    }

    text += `\n#### 📜 Canon vs. Chronology:\n`;
    text += `- **Original Canon Source**: ${primary.canonNotes.canonSource}\n`;
    text += `- **Filler Episodes**: ${primary.canonNotes.fillerEpisodes.length > 0 ? primary.canonNotes.fillerEpisodes.join('; ') : 'None (100% canon adaptation)'}\n`;
    text += `- **Key Arcs**: ${primary.canonNotes.keyArcChronology.map((a) => `${a.arcName} (Eps ${a.episodes})`).join(' ➔ ')}\n`;

    if (spoilerMode === 'unrestricted') {
      text += `\n⚠️ **[SPOILER SECTION - UNRESTRICTED MODE]**\n`;
      text += `- **Major Plot Twists**: ${primary.spoilers.majorPlotTwists.join('; ')}\n`;
      text += `- **Character Fates**: ${primary.spoilers.characterFates.join('; ')}\n`;
      text += `- **Ending Resolution**: ${primary.spoilers.endingSummary}\n`;
    } else {
      text += `\n🛡️ **Spoiler Shield Active**: Major plot twists and character fates are redacted to protect your viewing experience.\n`;
    }

    text += `\n📺 **Verified Legal Streaming Availability**: ${primary.streaming.map((s) => `${s.platform} (${s.countries.join(', ')})`).join(' | ')}`;

    return text;
  }
}

export const ragEngine = new RAGEngine();
