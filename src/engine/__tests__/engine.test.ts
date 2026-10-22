import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeArabic,
  stripArabicDefiniteArticle,
  normalizeRomaji,
  detectLanguage,
  computeTokenSimilarity,
} from '../normalizer.ts';

import { animeDb } from '../database.ts';
import { availabilityService } from '../availability.ts';
import { sceneEngine } from '../scenes.ts';
import { recommendationEngine } from '../recommendations.ts';
import { ragEngine } from '../rag.ts';

test('1. Arabic Normalization & Darija handling', () => {
  // Test Tashkeel removal and Alef normalization
  const inputWithDiacritics = 'هَجُومُ العَمَالِقَةِ الإِلْكِتْرُونِيّ';
  const normalized = normalizeArabic(inputWithDiacritics);
  assert.equal(normalized, 'هجوم العمالقه الالكتروني');

  // Test Alef variants
  assert.equal(normalizeArabic('أحمد إبراهيم آية ٱبن'), 'احمد ابراهيم ايه ابن');

  // Test Taa Marbuta and Yaa
  assert.equal(normalizeArabic('مذكرة الموت إلي'), 'مذكره الموت الي');

  // Test Definite Article stripping
  assert.equal(stripArabicDefiniteArticle('العمالقة'), 'عمالقه');
  assert.equal(stripArabicDefiniteArticle('القناص'), 'قناص');

  // Test Language Detection
  assert.equal(detectLanguage('اشرح لي قصة أنمي ون بيس'), 'ar');
  assert.equal(detectLanguage('بغيت شي انمي زوين بزاف'), 'darija');
  assert.equal(detectLanguage('葬送のフリーレンについて教えて'), 'ja');
  assert.equal(detectLanguage('Tell me about Attack on Titan chronology'), 'en');
});

test('2. Romaji & English normalization', () => {
  assert.equal(normalizeRomaji('Shingeki nō Kyōjin!'), 'shingeki nou kyoujin');
  assert.equal(normalizeRomaji('Sousou no Frieren - 2023'), 'sousou no frieren 2023');

  const similarity = computeTokenSimilarity('Attack on Titan Season 3', 'attack titan');
  assert.ok(similarity > 0.3);
});

test('3. Multilingual Knowledge Base Search', () => {
  // Search by Modern Standard Arabic title
  const aotResults = animeDb.search('هجوم العمالقة');
  assert.ok(aotResults.length > 0, 'Should find Attack on Titan by Arabic title');
  assert.equal(aotResults[0].id, 'attack-on-titan');

  // Search by Moroccan Darija alias
  const conanResults = animeDb.search('كونان');
  assert.ok(conanResults.length > 0, 'Should find Detective Conan by Darija alias');
  assert.equal(conanResults[0].id, 'detective-conan');

  // Search by Japanese Kanji
  const frierenResults = animeDb.search('葬送のフリーレン');
  assert.ok(frierenResults.length > 0, 'Should find Frieren by Kanji title');
  assert.equal(frierenResults[0].id, 'frieren-beyond-journeys-end');

  // Search by Romaji
  const bebopResults = animeDb.search('Cowboy Bebop');
  assert.ok(bebopResults.length > 0, 'Should find Cowboy Bebop');
  assert.equal(bebopResults[0].id, 'cowboy-bebop');

  // Search by character name
  const charResults = animeDb.search('Levi Ackerman');
  assert.ok(charResults.length > 0, 'Should find anime featuring Levi');
  assert.equal(charResults[0].id, 'attack-on-titan');

  // Search by studio and genre filter
  const ufotableAnime = animeDb.search('', { genre: 'Action' });
  assert.ok(ufotableAnime.length >= 2, 'Should return multiple Action anime');
});

test('4. Streaming Availability & Region Resolution', () => {
  // Check Morocco (MA) availability for Attack on Titan
  const aotAvailability = availabilityService.getAvailability({ animeId: 'attack-on-titan', country: 'MA' });
  assert.ok(aotAvailability !== null);
  assert.equal(aotAvailability.country, 'MA');
  assert.ok(aotAvailability.platforms.length > 0, 'Should find platforms in MA');

  // Crunchyroll should be listed with Arabic subtitles
  const crunchyroll = aotAvailability.platforms.find((p) => p.platform === 'Crunchyroll');
  assert.ok(crunchyroll !== undefined);
  assert.ok(crunchyroll.subAvailable.includes('Arabic'));
  assert.equal(crunchyroll.confidence, 'verified');

  // Shahid should be present for MENA
  const shahid = aotAvailability.platforms.find((p) => p.platform === 'Shahid');
  assert.ok(shahid !== undefined);

  // Check country with no direct license (e.g. Iceland 'IS')
  const unverifiedCheck = availabilityService.getAvailability({ animeId: 'attack-on-titan', country: 'IS' });
  assert.ok(unverifiedCheck !== null);
  assert.ok(unverifiedCheck.unverifiedFallbackNotice !== undefined);
  assert.ok(unverifiedCheck.officialSearchFallbacks.length > 0);
});

test('5. Natural Language Scene & Clip Discovery', () => {
  // Search for Levi vs Beast Titan
  const leviScenes = sceneEngine.search('Levi slices Beast Titan');
  assert.ok(leviScenes.length > 0, 'Should locate Levi vs Beast Titan scene');
  assert.equal(leviScenes[0].id, 'scene-levi-vs-beast-titan');
  assert.equal(leviScenes[0].episode, 54);
  assert.equal(leviScenes[0].confidence, 'verified');
  assert.ok(leviScenes[0].officialClipUrl?.includes('youtube.com'));

  // Search in Arabic
  const arabicScene = sceneEngine.search('تانجيرو رقصة إله النار');
  assert.ok(arabicScene.length > 0, 'Should locate Tanjiro Hinokami Kagura scene in Arabic');
  assert.equal(arabicScene[0].id, 'scene-tanjiro-hinokami-kagura-rui');
  assert.equal(arabicScene[0].episode, 19);

  // Search for Spike Spiegel finale
  const bebopScene = sceneEngine.search('Spike Spiegel bang');
  assert.ok(bebopScene.length > 0);
  assert.equal(bebopScene[0].id, 'scene-spike-spiegel-bang');
});

test('6. Recommendation Engine Scoring & Explanations', () => {
  // Request dark psychological thriller
  const darkRecs = recommendationEngine.getRecommendations({
    genres: ['Suspense'],
    mood: 'dark psychological',
    maxEpisodes: 40,
  });

  assert.ok(darkRecs.length > 0);
  const topPick = darkRecs[0];
  assert.ok(topPick.reasons.length > 0, 'Must have concrete reasons');
  assert.ok(topPick.reasonsArabic.length > 0, 'Must have Arabic explanations');
  assert.ok(topPick.anime.episodes! <= 40, 'Must respect max episodes constraint');

  // Check hidden gem / underrated detection
  const nicheRecs = recommendationEngine.getRecommendations({
    genres: ['Comedy', 'Music'],
  });
  const bocchi = nicheRecs.find((r) => r.anime.id === 'bocchi-the-rock');
  assert.ok(bocchi !== undefined);
  assert.equal(bocchi.isNicheGem, true);
});

test('7. RAG Q&A & Spoiler Shield Handling', async () => {
  // Safe mode query
  const safeAnswer = await ragEngine.answerQuestion({
    message: 'Tell me about Attack on Titan without any spoilers',
    spoilerMode: 'safe',
    language: 'en',
  });

  assert.ok(safeAnswer.content.includes('Spoiler Shield Active') || !safeAnswer.content.includes('Rumbling'));
  assert.equal(safeAnswer.spoilersContained, false);
  assert.ok(safeAnswer.citations && safeAnswer.citations.length > 0);

  // Unrestricted mode query
  const spoilerAnswer = await ragEngine.answerQuestion({
    message: 'What are the major plot twists of Death Note?',
    spoilerMode: 'unrestricted',
    language: 'en',
  });

  assert.equal(spoilerAnswer.spoilersContained, true);
  assert.ok(spoilerAnswer.content.includes('SPOILER'));

  // Arabic Q&A
  const arabicAnswer = await ragEngine.answerQuestion({
    message: 'ما هي قصة فريرين؟',
    spoilerMode: 'safe',
    language: 'ar',
  });

  assert.ok(arabicAnswer.content.includes('فريرين'));
  assert.ok(arabicAnswer.content.includes('القصة'));
});
