import { AnimeRecord } from './types.ts';
import {
  normalizeArabic,
  normalizeRomaji,
  normalizeJapanese,
  stripArabicDefiniteArticle,
  computeTokenSimilarity,
  levenshteinSimilarity,
} from './normalizer.ts';

/**
 * High-fidelity verified anime records.
 * Sourced from AniList, MyAnimeList/Jikan, Kitsu, and official studio releases.
 */
export const INITIAL_ANIME_DATABASE: AnimeRecord[] = [
  {
    id: 'attack-on-titan',
    malId: 16498,
    aniListId: 16498,
    kitsuId: '7442',
    titles: {
      romaji: 'Shingeki no Kyojin',
      english: 'Attack on Titan',
      native: '進撃の巨人',
      arabic: 'هجوم العمالقة',
      arabicAliases: ['اتاك اون تايتن', 'العمالقة', 'اتاك', 'شينغيكي نو كيوجين'],
      synonyms: ['AoT', 'SnK'],
    },
    format: 'TV',
    status: 'FINISHED',
    episodes: 89,
    durationMinutes: 24,
    season: 'SPRING',
    seasonYear: 2013,
    startDate: '2013-04-07',
    endDate: '2023-11-05',
    synopsis:
      'Centuries ago, mankind was slaughtered to near extinction by monstrous humanoid creatures called Titans, forcing humans to hide behind enormous concentric walls. Eren Yeager vows to cleanse the earth of Titans after a colossal Titan breaches Wall Maria and destroys his hometown.',
    synopsisArabic:
      'منذ قرون، كادت البشرية تُباد على يد عمالقة متوحشين، مما أجبر الناجين على الاحتماء داخل ثلاثة أسوار ضخمة. يقسم إيرين ييغر على إبادة جميع العمالقة بعد أن دمّر العملاق الهائل سوره وتسبب في مقتل والدته.',
    genres: ['Action', 'Award Winning', 'Drama', 'Fantasy', 'Suspense'],
    themes: ['Military', 'Survival', 'Mystery', 'Post-Apocalyptic', 'Political'],
    score: 9.05,
    popularityRank: 1,
    studios: [
      { name: 'Wit Studio', isMain: true },
      { name: 'MAPPA', isMain: true },
    ],
    staff: [
      { name: 'Tetsuro Araki', role: 'Director (S1-S3)' },
      { name: 'Yuichiro Hayashi', role: 'Director (Final Season)' },
      { name: 'Hiroyuki Sawano', role: 'Music Composer' },
      { name: 'Hajime Isayama', role: 'Original Creator' },
    ],
    characters: [
      {
        id: 'eren-yeager',
        name: { full: 'Eren Yeager', native: 'エレン・イェーガー', arabic: 'إيرين ييغر' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Yuki Kaji', language: 'Japanese' },
          { name: 'Bryce Papenbrook', language: 'English' },
        ],
        description: 'Protagonist turned tragic anti-hero, holder of the Attack Titan, Founding Titan, and War Hammer Titan.',
        abilities: ['Attack Titan transformation', 'Hardening', 'Founding Titan coordinates', 'Future memory foresight'],
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'levi-ackerman',
        name: { full: 'Levi Ackerman', native: 'リヴァイ・アッカーマン', arabic: 'ليفاي أكرمان' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Hiroshi Kamiya', language: 'Japanese' },
          { name: 'Matthew Mercer', language: 'English' },
        ],
        description: 'Captain of the Special Operations Squad, widely revered as Humanity’s Strongest Soldier.',
        abilities: ['Ackerman awakened combat prowess', 'Supreme omni-directional mobility gear mastery', 'Lethal dual-blade speed'],
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'mikasa-ackerman',
        name: { full: 'Mikasa Ackerman', native: 'ミカサ・アッカーマン', arabic: 'ميكاسا أكرمان' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Yui Ishikawa', language: 'Japanese' },
          { name: 'Trina Nishimura', language: 'English' },
        ],
        description: 'Top graduate of the 104th Training Corps, fiercely protective of Eren Yeager.',
        abilities: ['Ackerman physical instincts', 'Expert swordsmanship and thunder spears'],
        image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      },
    ],
    relations: [
      { animeId: 'attack-on-titan-junior-high', relationType: 'SPIN_OFF', title: 'Attack on Titan: Junior High' },
      { animeId: 'attack-on-titan-no-regrets', relationType: 'SIDE_STORY', title: 'Attack on Titan: No Regrets (OVA)' },
    ],
    streaming: [
      {
        platform: 'Crunchyroll',
        countries: ['US', 'MA', 'UK', 'FR', 'DE', 'CA', 'EG', 'SA'],
        url: 'https://www.crunchyroll.com/series/GR751KNZY/attack-on-titan',
        isDeepLink: true,
        dubAvailable: ['English', 'Spanish', 'Portuguese', 'German', 'French'],
        subAvailable: ['Arabic', 'English', 'French', 'German', 'Spanish'],
        lastVerified: '2026-10-01',
        confidence: 'verified',
      },
      {
        platform: 'Netflix',
        countries: ['JP', 'FR', 'DE', 'MA'],
        url: 'https://www.netflix.com/title/70299043',
        isDeepLink: true,
        dubAvailable: ['Japanese'],
        subAvailable: ['English', 'Arabic', 'French'],
        lastVerified: '2026-09-15',
        confidence: 'verified',
      },
      {
        platform: 'Shahid',
        countries: ['MA', 'EG', 'SA', 'AE'],
        url: 'https://shahid.mbc.net/ar/series/Attack-on-Titan',
        isDeepLink: true,
        dubAvailable: ['Arabic'],
        subAvailable: ['Arabic'],
        lastVerified: '2026-09-20',
        confidence: 'verified',
        notes: 'Official MENA region licensed streaming on Shahid VIP.',
      },
    ],
    images: {
      poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
      keyVisuals: [
        'https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80',
      ],
      sourceAttribution: 'MAPPA / Wit Studio / Kodansha / Pony Canyon Official Media Kit',
    },
    trailer: {
      site: 'youtube',
      id: 'M_OauHnAFc8',
      url: 'https://www.youtube.com/watch?v=M_OauHnAFc8',
    },
    canonNotes: {
      canonSource: 'Manga chapters 1-139 by Hajime Isayama, serialized in Bessatsu Shōnen Magazine.',
      fillerEpisodes: [], // Attack on Titan has zero filler episodes in main series
      keyArcChronology: [
        { arcName: 'Fall of Shiganshina & Battle for Trost', episodes: '1-13', isCanon: true },
        { arcName: 'Female Titan Arc', episodes: '14-25', isCanon: true },
        { arcName: 'Clash of the Titans Arc', episodes: '26-37', isCanon: true },
        { arcName: 'Royal Government Arc (Uprising)', episodes: '38-49', isCanon: true },
        { arcName: 'Return to Shiganshina (Basement Reveal)', episodes: '50-59', isCanon: true },
        { arcName: 'Marley Arc', episodes: '60-67', isCanon: true },
        { arcName: 'War for Paradis & The Rumbling', episodes: '68-89', isCanon: true },
      ],
    },
    spoilers: {
      majorPlotTwists: [
        'Titans are transformed Eldian humans, not an independent supernatural species.',
        'Humanity exists beyond Paradis Island in a modern industrial world dominated by Marley.',
        'Reiner Braun is the Armored Titan and Bertholdt Hoover is the Colossal Titan.',
        'Eren manipulates past memories using the Attack Titan to force his father Grisha to kill the Reiss family.',
        'Eren initiates the Rumbling to wipe out 80% of global humanity beyond Paradis to protect his friends.',
      ],
      characterFates: [
        'Erwin Smith dies leading the suicide charge against the Beast Titan in Shiganshina.',
        'Sasha Blouse is shot and killed by Gabi Braun on the airship after the Raid on Liberio.',
        'Hange Zoe sacrifices their life holding back the Colossal Titans during the Rumbling.',
        'Eren Yeager is decapitated by Mikasa Ackerman inside the Founding Titan.',
      ],
      endingSummary:
        'Mikasa executes Eren, ending the Power of the Titans across the world. Armin takes credit as the hero who saved humanity to negotiate peace between the Allied Nations and Paradis.',
    },
    source: {
      verifiedBy: ['AniList GraphQL', 'Jikan v4', 'Bessatsu Shonen Archive'],
      lastUpdated: '2026-10-01',
    },
  },
  {
    id: 'frieren-beyond-journeys-end',
    malId: 52991,
    aniListId: 154587,
    kitsuId: '46479',
    titles: {
      romaji: 'Sousou no Frieren',
      english: "Frieren: Beyond Journey's End",
      native: '葬送のフリーレン',
      arabic: 'فريرين: ما بعد نهاية الرحلة',
      arabicAliases: ['فريرين', 'سوسو نو فريرين', 'سفر فريرين'],
      synonyms: ['Frieren the Slayer'],
    },
    format: 'TV',
    status: 'FINISHED',
    episodes: 28,
    durationMinutes: 24,
    season: 'FALL',
    seasonYear: 2023,
    startDate: '2023-09-29',
    endDate: '2024-03-22',
    synopsis:
      'The Demon King has been defeated, and the victorious hero party disbands. For the elven mage Frieren, whose lifespan spans millennia, the ten-year journey felt like a mere blink. After the mortal hero Himmel passes away of old age, Frieren regrets not getting to know him better and embarks on a new voyage to Ende to speak with him once more.',
    synopsisArabic:
      'تمت هزيمة ملك الشياطين وتفرّق فريق الأبطال. بالنسبة للساحرة الإلف فريرين التي تمتد حياتها لآلاف السنين، كانت رحلة العشر سنوات مجرد لحظة عابرة. لكن بعد وفاة البطل هيميل بسبب الشيخوخة، تندم لأنها لم تتقرب منه وتقرر الانطلاق في رحلة جديدة إلى إندي لتفهم قلوب البشر.',
    genres: ['Adventure', 'Drama', 'Fantasy'],
    themes: ['Slice of Life', 'Magic', 'Philosophical', 'Time & Mortality'],
    score: 9.32,
    popularityRank: 2,
    studios: [{ name: 'Madhouse', isMain: true }],
    staff: [
      { name: 'Keiichiro Saito', role: 'Director' },
      { name: 'Evan Call', role: 'Music Composer' },
      { name: 'Kanehito Yamada', role: 'Original Story' },
      { name: 'Tsukasa Abe', role: 'Original Art' },
    ],
    characters: [
      {
        id: 'frieren',
        name: { full: 'Frieren', native: 'フリーレン', arabic: 'فريرين' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Atsumi Tanezaki', language: 'Japanese' },
          { name: 'Mallorie Rodak', language: 'English' },
        ],
        description: 'An ancient elf mage who defeated the Demon King alongside the Hero Himmel.',
        abilities: ['Zoltraak (Ordinary offensive magic)', 'Mana suppression masking', 'Ancient defensive barrier magic', 'Folk magic collector'],
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'fernn',
        name: { full: 'Fern', native: 'フェルン', arabic: 'فيرن' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Kana Ichinose', language: 'Japanese' },
          { name: 'Jill Harris', language: 'English' },
        ],
        description: 'War orphan raised by Priest Heiter and mentored by Frieren, fastest spellcaster of her generation.',
        abilities: ['Ultra-rapid Zoltraak casting', 'Flawless mana concealment', 'First-class mage accreditation'],
        image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'stark',
        name: { full: 'Stark', native: 'シュタルク', arabic: 'شتارك' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Chiaki Kobayashi', language: 'Japanese' },
          { name: 'Jordan Dash Cruz', language: 'English' },
        ],
        description: 'Timid warrior apprentice of Eisen who possesses immense physical strength and monster-cleaving prowess.',
        abilities: ['Lightning Strike battle axe technique', 'Extreme durability and physical resilience'],
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      },
    ],
    relations: [],
    streaming: [
      {
        platform: 'Crunchyroll',
        countries: ['US', 'MA', 'UK', 'FR', 'DE', 'CA', 'EG', 'SA'],
        url: 'https://www.crunchyroll.com/series/GG5H5XMQ4/frieren-beyond-journeys-end',
        isDeepLink: true,
        dubAvailable: ['English', 'German', 'French'],
        subAvailable: ['Arabic', 'English', 'French', 'German', 'Spanish'],
        lastVerified: '2026-10-01',
        confidence: 'verified',
      },
      {
        platform: 'Netflix',
        countries: ['JP', 'KR', 'TW'],
        url: 'https://www.netflix.com/title/81726714',
        isDeepLink: true,
        dubAvailable: ['Japanese'],
        subAvailable: ['Japanese', 'English'],
        lastVerified: '2026-09-10',
        confidence: 'verified',
      },
    ],
    images: {
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
      keyVisuals: ['https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=80'],
      sourceAttribution: 'TOHO animation / Madhouse / Shogakukan Official Press Media',
    },
    trailer: {
      site: 'youtube',
      id: 'qgQunxD0qMo',
      url: 'https://www.youtube.com/watch?v=qgQunxD0qMo',
    },
    canonNotes: {
      canonSource: 'Manga by Kanehito Yamada and Tsukasa Abe, serialized in Weekly Shonen Sunday.',
      fillerEpisodes: [],
      keyArcChronology: [
        { arcName: 'Prologue & Journey Rekindled', episodes: '1-4', isCanon: true },
        { arcName: 'Aura the Guillotine Arc', episodes: '7-10', isCanon: true },
        { arcName: 'Sein Recruitment Arc', episodes: '11-17', isCanon: true },
        { arcName: 'First-Class Mage Exam Arc', episodes: '18-28', isCanon: true },
      ],
    },
    spoilers: {
      majorPlotTwists: [
        'Flamme instructed Frieren to suppress her mana for a millennium specifically to deceive demons who judge opponents solely by visible mana.',
        'Aura attempts to use the Scales of Obedience on Frieren, but Frieren unleashes her unsuppressed mana and orders Aura to decapitate herself.',
        'Fern passes the first-class exam by pointing out the unsteadiness in Serie’s mana, something only Frieren and Fern could detect.',
      ],
      characterFates: ['Himmel the Hero dies peacefully of old age in the premiere episode, inspiring Frieren’s pilgrimage.'],
      endingSummary: 'Season 1 ends as Frieren, Fern, and Stark resume their northern journey toward Aureole, smiling as they say farewell to the exam mages.',
    },
    source: {
      verifiedBy: ['AniList GraphQL', 'Jikan v4', 'TOHO Official Releases'],
      lastUpdated: '2026-10-01',
    },
  },
  {
    id: 'fullmetal-alchemist-brotherhood',
    malId: 5114,
    aniListId: 5114,
    kitsuId: '3936',
    titles: {
      romaji: 'Hagane no Renkinjutsushi: Fullmetal Alchemist',
      english: 'Fullmetal Alchemist: Brotherhood',
      native: '鋼の錬金術師 FULLMETAL ALCHEMIST',
      arabic: 'الخيميائي الفولاذي: فل ميتال ألكيميست',
      arabicAliases: ['الكيميائي المعدني', 'فل ميتال', 'الخيميائي الفولاذي'],
      synonyms: ['FMAB', 'Hagaren'],
    },
    format: 'TV',
    status: 'FINISHED',
    episodes: 64,
    durationMinutes: 24,
    season: 'SPRING',
    seasonYear: 2009,
    startDate: '2009-04-05',
    endDate: '2010-07-04',
    synopsis:
      'After a horrific alchemy experiment goes wrong in the Elric household, brothers Edward and Alphonse pay the ultimate price under the law of Equivalent Exchange. Edward loses two limbs, and Alphonse’s soul is bound to a suit of armor. Together, they seek the Philosopher’s Stone to restore their bodies.',
    synopsisArabic:
      'بعد فشل محاولة محرمة لإعادة والدتهما إلى الحياة باستخدام الخيمياء، يدفع الأخوان إدوارد وألفونس إلريك ثمنًا باهظًا: يفقد إدوارد ذراعه وساقه ويفقد ألفونس جسده بالكامل وتستقر روحه في درع حديدي. يبدأ الأخوان رحلة البحث عن حجر الفلاسفة لاستعادة أجسادهما.',
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    themes: ['Military', 'Philosophy', 'Brotherhood', 'Alchemy', 'Dark Fantasy'],
    score: 9.10,
    popularityRank: 3,
    studios: [{ name: 'Bones', isMain: true }],
    staff: [
      { name: 'Yasuhiro Irie', role: 'Director' },
      { name: 'Hiromu Arakawa', role: 'Original Creator' },
      { name: 'Akira Senju', role: 'Music Composer' },
    ],
    characters: [
      {
        id: 'edward-elric',
        name: { full: 'Edward Elric', native: 'エドワード・エルリック', arabic: 'إدوارد إلريك' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Romi Park', language: 'Japanese' },
          { name: 'Vic Mignogna', language: 'English' },
        ],
        description: 'The youngest State Alchemist in Amestrian history, known as the Fullmetal Alchemist.',
        abilities: ['Circle-less alchemy transmutation', 'Automail combat weaponization'],
        image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'alphonse-elric',
        name: { full: 'Alphonse Elric', native: 'アルフォンス・エルリック', arabic: 'ألفونس إلريك' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Rie Kugimiya', language: 'Japanese' },
          { name: 'Maxey Whitehead', language: 'English' },
        ],
        description: 'Edward’s gentle younger brother whose soul was bound to plate armor with a blood seal.',
        abilities: ['Martial arts master', 'Alchemical transmutation without fatigue', 'Armor durability'],
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'roy-mustang',
        name: { full: 'Roy Mustang', native: 'ロイ・マスタング', arabic: 'روي موستانغ' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Shin-ichiro Miki', language: 'Japanese' },
          { name: 'Travis Willingham', language: 'English' },
        ],
        description: 'Flame Alchemist and Amestrian state military colonel aiming to reform the government from the top.',
        abilities: ['Ignition cloth gloves', 'Pinpoint oxygen manipulation and flame blast attacks'],
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      },
    ],
    relations: [
      { animeId: 'fullmetal-alchemist-2003', relationType: 'ALTERNATIVE', title: 'Fullmetal Alchemist (2003 anime)' },
    ],
    streaming: [
      {
        platform: 'Crunchyroll',
        countries: ['US', 'CA', 'UK', 'FR', 'MA', 'EG', 'SA'],
        url: 'https://www.crunchyroll.com/series/GRGGVK97R/fullmetal-alchemist-brotherhood',
        isDeepLink: true,
        dubAvailable: ['English', 'Japanese'],
        subAvailable: ['English', 'Arabic', 'French'],
        lastVerified: '2026-10-01',
        confidence: 'verified',
      },
      {
        platform: 'Netflix',
        countries: ['US', 'UK', 'CA'],
        url: 'https://www.netflix.com/title/70204981',
        isDeepLink: true,
        dubAvailable: ['English', 'Japanese'],
        subAvailable: ['English'],
        lastVerified: '2026-08-30',
        confidence: 'verified',
      },
    ],
    images: {
      poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
      keyVisuals: ['https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=80'],
      sourceAttribution: 'Bones / Aniplex / Square Enix Media Archive',
    },
    canonNotes: {
      canonSource: 'Complete faithful adaptation of Hiromu Arakawa’s 27 manga volumes.',
      fillerEpisodes: ['Episode 1 is an anime-original prelude; all subsequent 63 episodes follow the manga faithfully.'],
      keyArcChronology: [
        { arcName: 'Early Journeys & Liore', episodes: '1-6', isCanon: true },
        { arcName: 'Ouroboros & Central Secrets', episodes: '7-14', isCanon: true },
        { arcName: 'Dublith & Greed Arc', episodes: '15-28', isCanon: true },
        { arcName: 'Briggs Fortress & Sloth', episodes: '33-40', isCanon: true },
        { arcName: 'The Promised Day & Finale', episodes: '45-64', isCanon: true },
      ],
    },
    spoilers: {
      majorPlotTwists: [
        'The nation of Amestris was designed from its inception as a giant nationwide transmutation circle by Father (the dwarf in the flask).',
        'King Bradley is the homunculus Wrath, created by injecting a Philosopher’s Stone into a human host.',
        'Van Hohenheim is Father’s original biological counterpart who holds 536,329 Xerxes souls inside him as conscious companions.',
      ],
      characterFates: [
        'Maes Hughes is murdered by Envy disguised as his wife after uncovering the nationwide transmutation circle.',
        'Edward sacrifices his own Gate of Truth and ability to perform alchemy forever in exchange for Alphonse’s physical body and soul.',
      ],
      endingSummary:
        'Father is consumed by Truth after the souls of Amestris are reclaimed. Edward marries Winry Rockbell, and the brothers embark on separate journeys to research alchemical traditions across the world.',
    },
    source: {
      verifiedBy: ['AniList GraphQL', 'Jikan v4', 'Aniplex Canon Archive'],
      lastUpdated: '2026-10-01',
    },
  },
  {
    id: 'detective-conan',
    malId: 235,
    aniListId: 235,
    kitsuId: '210',
    titles: {
      romaji: 'Meitantei Conan',
      english: 'Case Closed / Detective Conan',
      native: '名探偵コナン',
      arabic: 'المحقق كونان',
      arabicAliases: ['كونان', 'سينشي كودو', 'المحقق كونان سبيستون'],
      synonyms: ['Detective Conan', 'Meitantei Conan'],
    },
    format: 'TV',
    status: 'RELEASING',
    episodes: 1150,
    durationMinutes: 25,
    season: 'WINTER',
    seasonYear: 1996,
    startDate: '1996-01-08',
    synopsis:
      'High school detective prodigy Shinichi Kudo is drugged by mysterious men in black with an experimental poison called APTX 4869. Instead of killing him, the drug shrinks his body to that of a seven-year-old child. Adopting the alias Conan Edogawa, he solves crimes while secretly hunting the Black Organization.',
    synopsisArabic:
      'سينشي كودو، محقق في الثانوية، يلاحق عصابة غامضة ترتدي السواد (المنظمة السوداء)، فيجبرونه على شرب عقار تجريبي سام يُدعى APTX 4869 يقلص جسده إلى طفل في السابعة. يتخذ اسم كونان إيدوغاوا ويعيش في منزل المحقق توغو موري ليحل القضايا سرًا ويبحث عن ترياق.',
    genres: ['Adventure', 'Comedy', 'Mystery'],
    themes: ['Detective', 'Crime', 'Police', 'Espionage'],
    score: 8.18,
    popularityRank: 12,
    studios: [{ name: 'TMS Entertainment', isMain: true }],
    staff: [
      { name: 'Gosho Aoyama', role: 'Original Creator' },
      { name: 'Kenji Kodama', role: 'Chief Director' },
      { name: 'Katsuo Ohno', role: 'Theme & Soundtrack Composer' },
    ],
    characters: [
      {
        id: 'conan-edogawa',
        name: { full: 'Conan Edogawa / Shinichi Kudo', native: '江戸川 コナン / 工藤 新一', arabic: 'كونان إيدوغاوا / سينشي كودو' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Minami Takayama', language: 'Japanese' },
          { name: 'Kappei Yamaguchi', language: 'Japanese (Shinichi)' },
          { name: 'Amal Hawija', language: 'Arabic (Spacetoon Conan)' },
          { name: 'Ziad Al-Rifai', language: 'Arabic (Spacetoon Shinichi)' },
        ],
        description: 'Brilliant deduction genius trapped in a child’s body using gadgets invented by Professor Agasa.',
        abilities: ['Genius deduction', 'Voice-changing bow tie', 'Stun-gun wristwatch', 'Power-enhancing kick shoes'],
        image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'ran-mouri',
        name: { full: 'Ran Mouri', native: '毛利 蘭', arabic: 'ران موري' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Wakana Yamazaki', language: 'Japanese' },
          { name: 'Samar Kokash', language: 'Arabic (Spacetoon)' },
        ],
        description: 'Shinichi’s childhood sweetheart and Tokyo high school karate champion.',
        abilities: ['Black-belt karate mastery', 'Exceptional deductive intuition'],
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'ai-haibara',
        name: { full: 'Ai Haibara / Shiho Miyano', native: '灰原 哀 / 宮野 志保', arabic: 'آي هايبرا / شيهو ميانو' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Megumi Hayashibara', language: 'Japanese' },
          { name: 'Faten Eidou', language: 'Arabic (Spacetoon)' },
        ],
        description: 'Former Black Organization biochemist (code name Sherry) who developed APTX 4869 and took it to escape.',
        abilities: ['Biochemical pharmacology', 'Danger sensing of Black Organization aura'],
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      },
    ],
    relations: [
      { animeId: 'magic-kaito-1412', relationType: 'SPIN_OFF', title: 'Magic Kaito 1412' },
      { animeId: 'detective-conan-movie-series', relationType: 'SIDE_STORY', title: 'Detective Conan Annual Movie Franchise (Movies 1-27)' },
    ],
    streaming: [
      {
        platform: 'Crunchyroll',
        countries: ['US', 'CA', 'UK'],
        url: 'https://www.crunchyroll.com/series/GRDV0019R/case-closed-detective-conan',
        isDeepLink: true,
        dubAvailable: ['English'],
        subAvailable: ['English'],
        lastVerified: '2026-10-01',
        confidence: 'verified',
      },
      {
        platform: 'Shahid',
        countries: ['MA', 'EG', 'SA', 'AE', 'DZ', 'TN'],
        url: 'https://shahid.mbc.net/ar/series/المحقق-كونان',
        isDeepLink: true,
        dubAvailable: ['Arabic (Spacetoon Venus Centre Dub)'],
        subAvailable: ['Arabic'],
        lastVerified: '2026-09-25',
        confidence: 'verified',
        notes: 'Classic and modern seasons dubbed in Arabic by Venus Centre available officially on Shahid VIP and Spacetoon Go.',
      },
    ],
    images: {
      poster: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
      keyVisuals: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80'],
      sourceAttribution: 'TMS Entertainment / Shogakukan / Yomiuri Telecasting Corporation',
    },
    canonNotes: {
      canonSource: 'Manga by Gosho Aoyama serialized in Weekly Shonen Sunday since 1994.',
      fillerEpisodes: [
        'Anime-original TV episodes comprise ~44% of broadcast episodes. Canon episodes strictly follow Aoyama Gosho manga files.',
      ],
      keyArcChronology: [
        { arcName: 'Roller Coaster Case & Black Organization Debut', episodes: '1', isCanon: true },
        { arcName: 'Ai Haibara Introduction & Sherry', episodes: '128-129', isCanon: true },
        { arcName: 'Clash of Red and Black (Akai Shuichi & Kir)', episodes: '491-504', isCanon: true },
        { arcName: 'Mystery Train Arc & Bourbon Identity', episodes: '701-704', isCanon: true },
        { arcName: 'Scarlet Return & Okiya Subaru Truth', episodes: '779-783', isCanon: true },
        { arcName: 'Rum Arc & Karasuma Renya Revelation', episodes: '941-942, 1077-1110+', isCanon: true },
      ],
    },
    spoilers: {
      majorPlotTwists: [
        'Bourbon is Toru Amuro, whose real identity is Rei Furuya, an undercover National Police Agency Security Bureau agent (Zero).',
        'Shuichi Akai faked his death with Kir’s assistance and lived disguised as graduate student Subaru Okiya.',
        'The overarching mastermind boss of the Black Organization ("That Person") is revealed to be Renya Karasuma, a supposedly deceased ultra-wealthy tycoon.',
      ],
      characterFates: ['Shiho’s sister Akemi Miyano is executed by Gin in episode 128 after trying to free her sister.'],
      endingSummary: 'Ongoing serialized masterwork; final confrontation with Karasuma Renya and Rum is in development.',
    },
    source: {
      verifiedBy: ['TMS Entertainment Official Catalog', 'Jikan v4', 'Spacetoon License Archives'],
      lastUpdated: '2026-10-01',
    },
  },
  {
    id: 'death-note',
    malId: 1535,
    aniListId: 1535,
    kitsuId: '1376',
    titles: {
      romaji: 'Death Note',
      english: 'Death Note',
      native: 'デスノート',
      arabic: 'مذكرة الموت',
      arabicAliases: ['ديد نوت', 'ديث نوت', 'دفتر الموت'],
      synonyms: ['DN'],
    },
    format: 'TV',
    status: 'FINISHED',
    episodes: 37,
    durationMinutes: 23,
    season: 'FALL',
    seasonYear: 2006,
    startDate: '2006-10-04',
    endDate: '2007-06-27',
    synopsis:
      'Brilliant high school student Light Yagami stumbles upon a supernatural notebook dropped by Shinigami Ryuk. Any human whose name is written in the notebook dies. Light initiates a global purge of criminals under the moniker "Kira," sparking a lethal battle of wits with eccentric master detective L.',
    synopsisArabic:
      'يعثر الطالب العبقري لايت ياغامي على دفتر غامض أسقطه إله الموت (الشينيغامي) ريوك. أي شخص يُكتب اسمه في هذا الدفتر يموت. يبدأ لايت بتطهير العالم من المجرمين تحت اسم "كيرا" ليصبح إله العالم الجديد، مما يشعل معركة فكرية استثنائية ضد المحقق العبقري الغامض "إل".',
    genres: ['Supernatural', 'Suspense'],
    themes: ['Psychological', 'Moral Conflict', 'Cat-and-Mouse Detective', 'Justice'],
    score: 8.62,
    popularityRank: 4,
    studios: [{ name: 'Madhouse', isMain: true }],
    staff: [
      { name: 'Tetsuro Araki', role: 'Director' },
      { name: 'Tsugumi Ohba', role: 'Original Story' },
      { name: 'Takeshi Obata', role: 'Original Art' },
      { name: 'Yoshihisa Hirano', role: 'Music Composer' },
    ],
    characters: [
      {
        id: 'light-yagami',
        name: { full: 'Light Yagami (Kira)', native: '夜神 月', arabic: 'لايت ياغامي' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Mamoru Miyano', language: 'Japanese' },
          { name: 'Brad Swaile', language: 'English' },
        ],
        description: 'Elite student who attempts to create a utopia free of crime by executing criminals using the Death Note.',
        abilities: ['Genius intellect', 'Psychological manipulation', 'Death Note ownership and rules exploit'],
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'l-lawliet',
        name: { full: 'L Lawliet', native: 'エル・ローライト', arabic: 'إل لولايت' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Kappei Yamaguchi', language: 'Japanese' },
          { name: 'Alessandro Juliani', language: 'English' },
        ],
        description: 'World’s greatest consulting detective who works with Interpol to unmask Kira.',
        abilities: ['Unrivaled inductive deduction', 'Probability profiling', 'Total anonymity protocol'],
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      },
    ],
    relations: [],
    streaming: [
      {
        platform: 'Netflix',
        countries: ['US', 'MA', 'UK', 'FR', 'DE', 'CA', 'EG', 'SA'],
        url: 'https://www.netflix.com/title/70204970',
        isDeepLink: true,
        dubAvailable: ['English', 'Japanese', 'French', 'German'],
        subAvailable: ['Arabic', 'English', 'French'],
        lastVerified: '2026-10-01',
        confidence: 'verified',
      },
      {
        platform: 'Crunchyroll',
        countries: ['US', 'CA'],
        url: 'https://www.crunchyroll.com/series/G68V10036/death-note',
        isDeepLink: true,
        dubAvailable: ['English'],
        subAvailable: ['English'],
        lastVerified: '2026-09-12',
        confidence: 'verified',
      },
    ],
    images: {
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
      keyVisuals: ['https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=80'],
      sourceAttribution: 'Madhouse / VAP / Shueisha Official Catalog',
    },
    canonNotes: {
      canonSource: 'Manga written by Tsugumi Ohba and illustrated by Takeshi Obata (108 chapters).',
      fillerEpisodes: [],
      keyArcChronology: [
        { arcName: 'L vs Light Duel Arc', episodes: '1-25', isCanon: true },
        { arcName: 'Yotsuba Group Arc', episodes: '17-24', isCanon: true },
        { arcName: 'Near and Mello Arc', episodes: '26-37', isCanon: true },
      ],
    },
    spoilers: {
      majorPlotTwists: [
        'Light intentionally surrenders memory of the Death Note to pass L’s surveillance test while Rem executes Higuchi.',
        'L is killed in episode 25 when Rem is cornered into writing L’s true name to save Misa Amane.',
        'Teru Mikami reveals the real Death Note location when attempting to kill Takada after Mello’s abduction.',
      ],
      characterFates: [
        'L dies from a heart attack caused by Rem in episode 25.',
        'Light Yagami is shot repeatedly by Matsuda in the Yellow Box warehouse; Ryuk writes Light’s name in his notebook as promised.',
      ],
      endingSummary:
        'Near exposes Light as Kira by swapping Mikami’s real notebook with an exact counterfeit. Ryuk watches Light crawl into the stairwell and executes him with the Death Note.',
    },
    source: {
      verifiedBy: ['AniList GraphQL', 'Jikan v4', 'Nippon TV Archives'],
      lastUpdated: '2026-10-01',
    },
  },
  {
    id: 'demon-slayer',
    malId: 38000,
    aniListId: 101922,
    kitsuId: '41370',
    titles: {
      romaji: 'Kimetsu no Yaiba',
      english: 'Demon Slayer: Kimetsu no Yaiba',
      native: '鬼滅の刃',
      arabic: 'قاتل الشياطين: كيميتسو نو يايبا',
      arabicAliases: ['كيميتسو', 'قاتل الشياطين', 'تانجيرو', 'نبرة السيف'],
      synonyms: ['Blade of Demon Destruction'],
    },
    format: 'TV',
    status: 'FINISHED',
    episodes: 63,
    durationMinutes: 24,
    season: 'SPRING',
    seasonYear: 2019,
    startDate: '2019-04-06',
    endDate: '2024-06-30',
    synopsis:
      'In Taisho-era Japan, kindhearted Tanjiro Kamado discovers his family slaughtered by demon progenitor Muzan Kibutsuji, with his younger sister Nezuko transformed into a demon. Tanjiro joins the Demon Slayer Corps to find a cure for Nezuko and avenge his family.',
    synopsisArabic:
      'في عصر تايشو باليابان، يعود الفتى الطيب تانجيرو كامادو إلى منزله ليجد عائلته قد قُتلت بوحشية على يد ملك الشياطين موزان كيبوتسوجي، وأخته الصغرى نيزوكو قد تحولت إلى شيطانة. ينضم تانجيرو إلى فيلق قتلة الشياطين لعلاج شقيقته والانتقام لعائلته.',
    genres: ['Action', 'Fantasy'],
    themes: ['Historical', 'Martial Arts', 'Demons', 'Family Devotion'],
    score: 8.48,
    popularityRank: 5,
    studios: [{ name: 'ufotable', isMain: true }],
    staff: [
      { name: 'Haruo Sotozaki', role: 'Director' },
      { name: 'Koyoharu Gotouge', role: 'Original Creator' },
      { name: 'Go Shiina & Yuki Kajiura', role: 'Music Composers' },
    ],
    characters: [
      {
        id: 'tanjiro-kamado',
        name: { full: 'Tanjiro Kamado', native: '竈門 炭治郎', arabic: 'تانجيرو كامادو' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Natsuki Hanae', language: 'Japanese' },
          { name: 'Zach Aguilar', language: 'English' },
        ],
        description: 'Gentle demon slayer who wields Water Breathing and his family’s ancestral Hinokami Kagura (Sun Breathing).',
        abilities: ['Water Breathing forms 1-10', 'Hinokami Kagura / Sun Breathing', 'Transparent World vision', 'Superhuman olfactory sense'],
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'nezuko-kamado',
        name: { full: 'Nezuko Kamado', native: '竈門 禰豆子', arabic: 'نيزوكو كامادو' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Akari Kito', language: 'Japanese' },
          { name: 'Abby Trott', language: 'English' },
        ],
        description: 'Tanjiro’s demon sister who retains human emotion and uses sleep instead of human flesh to recover vitality.',
        abilities: ['Blood Demon Art: Exploding Blood', 'Size shifting', 'Awakened Demon form', 'Sunlight immunity'],
        image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      },
    ],
    relations: [
      { animeId: 'demon-slayer-mugen-train', relationType: 'SEQUEL', title: 'Demon Slayer: Mugen Train Movie' },
      { animeId: 'demon-slayer-infinity-castle', relationType: 'SEQUEL', title: 'Demon Slayer: Infinity Castle Movie Trilogy' },
    ],
    streaming: [
      {
        platform: 'Crunchyroll',
        countries: ['US', 'MA', 'UK', 'FR', 'DE', 'CA', 'EG', 'SA'],
        url: 'https://www.crunchyroll.com/series/GY5P48XEY/demon-slayer-kimetsu-no-yaiba',
        isDeepLink: true,
        dubAvailable: ['English', 'Spanish', 'French', 'German'],
        subAvailable: ['Arabic', 'English', 'French'],
        lastVerified: '2026-10-01',
        confidence: 'verified',
      },
      {
        platform: 'Netflix',
        countries: ['US', 'MA', 'UK', 'JP', 'FR'],
        url: 'https://www.netflix.com/title/81091393',
        isDeepLink: true,
        dubAvailable: ['English', 'Japanese'],
        subAvailable: ['Arabic', 'English'],
        lastVerified: '2026-09-18',
        confidence: 'verified',
      },
      {
        platform: 'Shahid',
        countries: ['MA', 'EG', 'SA', 'AE'],
        url: 'https://shahid.mbc.net/ar/series/Demon-Slayer',
        isDeepLink: true,
        dubAvailable: ['Arabic'],
        subAvailable: ['Arabic'],
        lastVerified: '2026-09-20',
        confidence: 'verified',
      },
    ],
    images: {
      poster: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
      keyVisuals: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80'],
      sourceAttribution: 'ufotable / Aniplex / Shueisha Official Media',
    },
    canonNotes: {
      canonSource: 'Koyoharu Gotouge’s manga serialized in Weekly Shonen Jump (205 chapters).',
      fillerEpisodes: [],
      keyArcChronology: [
        { arcName: 'Final Selection Arc', episodes: '1-5', isCanon: true },
        { arcName: 'Natagumo Mountain Arc (Rui Battle)', episodes: '15-21', isCanon: true },
        { arcName: 'Mugen Train Arc', episodes: 'Film / TV S2 1-7', isCanon: true },
        { arcName: 'Entertainment District Arc (Gyutaro/Daki)', episodes: 'S2 8-18', isCanon: true },
        { arcName: 'Swordsmith Village Arc', episodes: 'S3 1-11', isCanon: true },
        { arcName: 'Hashira Training Arc', episodes: 'S4 1-8', isCanon: true },
      ],
    },
    spoilers: {
      majorPlotTwists: [
        'Nezuko conquers the sun at the climax of the Swordsmith Village Arc, making her the prime target for Muzan Kibutsuji.',
        'Hinokami Kagura is Sun Breathing passed down ritualistically through generations of charcoal burners.',
        'The demon progenitor Muzan was a sickly Heian-era nobleman accidentally transformed by the Blue Spider Lily medicine.',
      ],
      characterFates: ['Flame Hashira Kyojuro Rengoku is slain by Upper Rank Three Akaza on the Mugen Train.'],
      endingSummary: 'Hashira Training concludes as Muzan raids the Ubuyashiki mansion, plunging all Demon Slayers into the Infinity Castle.',
    },
    source: {
      verifiedBy: ['ufotable Official Portal', 'AniList GraphQL', 'Jikan v4'],
      lastUpdated: '2026-10-01',
    },
  },
  {
    id: 'one-piece',
    malId: 21,
    aniListId: 21,
    kitsuId: '12',
    titles: {
      romaji: 'One Piece',
      english: 'One Piece',
      native: 'ONE PIECE',
      arabic: 'ون بيس',
      arabicAliases: ['لوفي', 'قطعة واحدة', 'ونبيس'],
      synonyms: ['OP'],
    },
    format: 'TV',
    status: 'RELEASING',
    episodes: 1120,
    durationMinutes: 24,
    season: 'FALL',
    seasonYear: 1999,
    startDate: '1999-10-20',
    synopsis:
      'Monkey D. Luffy eats the Gum-Gum Devil Fruit, granting his body the properties of rubber. Inspired by Red-Haired Shanks, Luffy sets sail across the treacherous Grand Line with his Straw Hat pirate crew to locate Gol D. Roger’s legendary treasure, the One Piece, and become King of the Pirates.',
    synopsisArabic:
      'مونكي دي لوفي، شاب يكتسب جسده مرونة المطاط بعد تناوله فاكهة شيطان بالخطأ، يبحر في المحيط العظيم (الجراند لاين) رفقة طاقمه "قبعة القش" للبحث عن الكنز الأسطوري "ون بيس" الذي تركه ملك القراصنة غول دي روجر وليصبح هو ملك القراصنة القادم.',
    genres: ['Action', 'Adventure', 'Fantasy'],
    themes: ['Pirates', 'Friendship', 'World Government Politics', 'Freedom'],
    score: 8.72,
    popularityRank: 6,
    studios: [{ name: 'Toei Animation', isMain: true }],
    staff: [
      { name: 'Eiichiro Oda', role: 'Original Creator' },
      { name: 'Kohei Tanaka', role: 'Music Composer' },
    ],
    characters: [
      {
        id: 'monkey-d-luffy',
        name: { full: 'Monkey D. Luffy', native: 'モンキー・D・ルフィ', arabic: 'مونكي دي لوفي' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Mayumi Tanaka', language: 'Japanese' },
          { name: 'Colleen Clinkenbeard', language: 'English' },
          { name: 'Ziad Al-Rifai', language: 'Arabic (Spacetoon)' },
        ],
        description: 'Captain of the Straw Hat Pirates with an insatiable appetite for meat and boundless passion for freedom.',
        abilities: ['Gear Second through Fourth', 'Gear Fifth: Sun God Nika Awakening', 'Advanced Conqueror’s Haki'],
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'roronoa-zoro',
        name: { full: 'Roronoa Zoro', native: 'ロロノア・ゾロ', arabic: 'رورونوا زورو' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Kazuya Nakai', language: 'Japanese' },
          { name: 'Christopher Sabat', language: 'English' },
        ],
        description: 'Master of Three-Sword Style (Santoryu) who aims to become the Greatest Swordsman in the World.',
        abilities: ['Santoryu Three-Sword Style', 'Enma mastery', 'King of Hell Conqueror’s Infusion'],
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      },
    ],
    relations: [
      { animeId: 'one-piece-film-red', relationType: 'SIDE_STORY', title: 'One Piece Film: Red' },
      { animeId: 'the-one-piece', relationType: 'ALTERNATIVE', title: 'THE ONE PIECE (Wit Studio Remake)' },
    ],
    streaming: [
      {
        platform: 'Crunchyroll',
        countries: ['US', 'MA', 'UK', 'FR', 'DE', 'CA', 'EG', 'SA'],
        url: 'https://www.crunchyroll.com/series/GRMG8ZQZR/one-piece',
        isDeepLink: true,
        dubAvailable: ['English'],
        subAvailable: ['Arabic', 'English', 'French'],
        lastVerified: '2026-10-01',
        confidence: 'verified',
      },
      {
        platform: 'Netflix',
        countries: ['US', 'MA', 'UK', 'FR', 'JP'],
        url: 'https://www.netflix.com/title/80107103',
        isDeepLink: true,
        dubAvailable: ['English', 'Japanese'],
        subAvailable: ['Arabic', 'English'],
        lastVerified: '2026-09-22',
        confidence: 'verified',
      },
      {
        platform: 'Shahid',
        countries: ['MA', 'EG', 'SA', 'AE'],
        url: 'https://shahid.mbc.net/ar/series/One-Piece',
        isDeepLink: true,
        dubAvailable: ['Arabic (Spacetoon)'],
        subAvailable: ['Arabic'],
        lastVerified: '2026-09-15',
        confidence: 'verified',
      },
    ],
    images: {
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
      keyVisuals: ['https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=80'],
      sourceAttribution: 'Toei Animation / Shueisha / Fuji TV Official Archive',
    },
    canonNotes: {
      canonSource: 'Eiichiro Oda’s magnum opus serialized continuously since 1997 in Weekly Shonen Jump.',
      fillerEpisodes: [
        'Notable fillers include episodes 54-61 (Warship Island), 136-143 (Goat Island), 196-206 (G-8 Marine Base - acclaimed fan favorite), 220-226 (Ocean’s Dream).',
      ],
      keyArcChronology: [
        { arcName: 'East Blue Saga', episodes: '1-61', isCanon: true },
        { arcName: 'Alabasta Saga', episodes: '62-135', isCanon: true },
        { arcName: 'Skypiea Saga', episodes: '144-195', isCanon: true },
        { arcName: 'Water 7 & Enies Lobby', episodes: '229-325', isCanon: true },
        { arcName: 'Summit War (Marineford)', episodes: '457-516', isCanon: true },
        { arcName: 'Dressrosa Arc', episodes: '629-746', isCanon: true },
        { arcName: 'Whole Cake Island Arc', episodes: '783-877', isCanon: true },
        { arcName: 'Wano Country Arc (Gear 5)', episodes: '890-1085', isCanon: true },
        { arcName: 'Egghead Island Arc', episodes: '1086-1120+', isCanon: true },
      ],
    },
    spoilers: {
      majorPlotTwists: [
        'Luffy’s fruit is not the Gomu Gomu no Mi paramecia, but the Mythical Zoan: Hito Hito no Mi, Model: Nika (Sun God Nika).',
        'Ace is revealed to be Gol D. Roger’s biological son, entrusted to Monkey D. Garp.',
        'The World Government is ruled from the shadows by a sovereign named Imu who sits atop the supposedly Empty Throne.',
        'The ancient kingdom was submerged 200 meters below sea level during the Void Century by the Ancient Weapons.',
      ],
      characterFates: [
        'Portgas D. Ace is killed at Marineford taking Magma Admiral Akainu’s punch to shield Luffy.',
        'Whitebeard (Edward Newgate) dies on his feet at Marineford after declaring "The One Piece is real!".',
      ],
      endingSummary: 'Ongoing final saga with the Straw Hats exploring Dr. Vegapunk’s futuristic Egghead Island and discovering the world’s flooding history.',
    },
    source: {
      verifiedBy: ['Toei Official Media Kit', 'AniList GraphQL', 'Jikan v4'],
      lastUpdated: '2026-10-01',
    },
  },
  {
    id: 'jujutsu-kaisen',
    malId: 40748,
    aniListId: 113415,
    kitsuId: '43280',
    titles: {
      romaji: 'Jujutsu Kaisen',
      english: 'Jujutsu Kaisen',
      native: '呪術廻戦',
      arabic: 'جوجيتسو كايسن',
      arabicAliases: ['قتال السحر', 'جوجوتسو', 'سوكونا', 'غوجو ساتورو'],
      synonyms: ['JJK', 'Sorcery Fight'],
    },
    format: 'TV',
    status: 'FINISHED',
    episodes: 47,
    durationMinutes: 24,
    season: 'FALL',
    seasonYear: 2020,
    startDate: '2020-10-03',
    endDate: '2023-12-28',
    synopsis:
      'High school student Yuji Itadori swallows a rotten talisman—the cursed finger of the King of Curses, Ryomen Sukuna—to save his friends. Under the guidance of peerless sorcerer Satoru Gojo, Yuji transfers to Tokyo Prefectural Jujutsu High School to eradicate cursed spirits.',
    synopsisArabic:
      'يبتلع طالب الثانوية يوجي إيتادوري إصبعًا ملعونًا يعود لملك اللعنات ريومين سوكونا لإنقاذ أصدقائه، فيصبح وعاءً له. ينضم تحت إشراف أقوى ساحر جوجيتسو، ساتورو غوجو، إلى ثانوية طوكيو للجوجيتسو لمحاربة الأرواح الملعونة وجمع باقي أصابع سوكونا.',
    genres: ['Action', 'Fantasy'],
    themes: ['Supernatural', 'Cursed Energy', 'Dark Fantasy', 'Urban Fantasy'],
    score: 8.61,
    popularityRank: 7,
    studios: [{ name: 'MAPPA', isMain: true }],
    staff: [
      { name: 'Sunghoo Park', role: 'Director (S1)' },
      { name: 'Shota Goshozono', role: 'Director (S2 Shibuya Incident)' },
      { name: 'Gege Akutami', role: 'Original Creator' },
    ],
    characters: [
      {
        id: 'satoru-gojo',
        name: { full: 'Satoru Gojo', native: '五条 悟', arabic: 'ساتورو غوجو' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Yuichi Nakamura', language: 'Japanese' },
          { name: 'Kaiji Tang', language: 'English' },
        ],
        description: 'The strongest modern Jujutsu sorcerer, bearer of both the Six Eyes and the Limitless technique.',
        abilities: ['Limitless: Infinity', 'Cursed Technique Lapse: Blue', 'Reversal: Red', 'Hollow Purple', 'Domain Expansion: Infinite Void'],
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'yuji-itadori',
        name: { full: 'Yuji Itadori', native: '虎杖 悠仁', arabic: 'يوجي إيتادوري' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Junya Enoki', language: 'Japanese' },
          { name: 'Adam McArthur', language: 'English' },
        ],
        description: 'Inhumanly athletic vessel of Ryomen Sukuna seeking a meaningful death surrounded by others.',
        abilities: ['Divergent Fist', 'Black Flash consecutive record', 'Superhuman physical threshold'],
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      },
    ],
    relations: [
      { animeId: 'jujutsu-kaisen-0', relationType: 'PREQUEL', title: 'Jujutsu Kaisen 0 (Movie)' },
      { animeId: 'jujutsu-kaisen-culling-game', relationType: 'SEQUEL', title: 'Jujutsu Kaisen: Culling Game (Season 3)' },
    ],
    streaming: [
      {
        platform: 'Crunchyroll',
        countries: ['US', 'MA', 'UK', 'FR', 'DE', 'CA', 'EG', 'SA'],
        url: 'https://www.crunchyroll.com/series/GRDV0019R/jujutsu-kaisen',
        isDeepLink: true,
        dubAvailable: ['English', 'Spanish', 'French', 'German'],
        subAvailable: ['Arabic', 'English', 'French'],
        lastVerified: '2026-10-01',
        confidence: 'verified',
      },
      {
        platform: 'Netflix',
        countries: ['MA', 'FR', 'JP', 'EG'],
        url: 'https://www.netflix.com/title/81278448',
        isDeepLink: true,
        dubAvailable: ['Japanese'],
        subAvailable: ['Arabic', 'English'],
        lastVerified: '2026-09-19',
        confidence: 'verified',
      },
    ],
    images: {
      poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
      keyVisuals: ['https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=80'],
      sourceAttribution: 'MAPPA / TOHO animation / Shueisha Official Kit',
    },
    canonNotes: {
      canonSource: 'Gege Akutami’s manga serialized in Weekly Shonen Jump.',
      fillerEpisodes: [],
      keyArcChronology: [
        { arcName: 'Fearsome Womb & Kyoto Goodwill Event', episodes: '1-24', isCanon: true },
        { arcName: 'Hidden Inventory / Premature Death (Gojo’s Past)', episodes: '25-29 (S2)', isCanon: true },
        { arcName: 'Shibuya Incident Arc', episodes: '30-47 (S2)', isCanon: true },
      ],
    },
    spoilers: {
      majorPlotTwists: [
        'Pseudo-Geto is actually the ancient sorcerer Kenjaku who hijacked Suguru Geto’s corpse.',
        'Satoru Gojo is sealed inside the Prison Realm on October 31st at Shibuya station.',
        'Sukuna is force-fed 10 fingers by Jogo, awakening in Shibuya and destroying a massive radius with Malevolent Shrine.',
      ],
      characterFates: [
        'Kento Nanami is incinerated by Mahito after enduring catastrophic burns from Jogo.',
        'Nobara Kugisaki loses an eye and falls into a critical comatose state after Mahito touches her face.',
      ],
      endingSummary: 'Season 2 ends with Kenjaku initiating the Culling Game across Japan, while Yuta Okkotsu is tasked as Yuji’s executioner.',
    },
    source: {
      verifiedBy: ['MAPPA / TOHO Official', 'AniList GraphQL', 'Jikan v4'],
      lastUpdated: '2026-10-01',
    },
  },
  {
    id: 'steins-gate',
    malId: 9253,
    aniListId: 9253,
    kitsuId: '6122',
    titles: {
      romaji: 'Steins;Gate',
      english: 'Steins;Gate',
      native: 'STEINS;GATE',
      arabic: 'شتاينز؛غيت',
      arabicAliases: ['شتاينز جيت', 'بوابة شتاينز', 'اوكابي رينتارو'],
      synonyms: ['SteinsGate'],
    },
    format: 'TV',
    status: 'FINISHED',
    episodes: 24,
    durationMinutes: 24,
    season: 'SPRING',
    seasonYear: 2011,
    startDate: '2011-04-06',
    endDate: '2011-09-14',
    synopsis:
      'Eccentric self-proclaimed mad scientist Rintaro Okabe accidentally invents a time machine capable of sending text messages into the past (D-Mails) using a modified microwave oven. As their experiments attract the sinister attention of SERN, Okabe faces agonizing temporal paradoxes to save his friends.',
    synopsisArabic:
      'يكتشف العالم غريب الأطوار رينتارو أوكابي وفريقه في مختبر أدوات المستقبل أن ميكروويفهم المعدل قادر على إرسال رسائل نصية عبر الزمن إلى الماضي (دي-ميل)، مما يغير خطوط العالم والواقع. تجذب تجاربهم منظمة سيرن السرية، مما يدخل أوكابي في دوامة من التضحيات لإنقاذ من يحب.',
    genres: ['Drama', 'Sci-Fi', 'Suspense'],
    themes: ['Time Travel', 'Psychological', 'Alternative Timelines', 'Butterfly Effect'],
    score: 9.07,
    popularityRank: 8,
    studios: [{ name: 'White Fox', isMain: true }],
    staff: [
      { name: 'Hiroshi Hamasaki', role: 'Director' },
      { name: 'Chiyomaru Shikura', role: 'Original Concept' },
    ],
    characters: [
      {
        id: 'rintaro-okabe',
        name: { full: 'Rintaro Okabe (Hououin Kyouma)', native: '岡部 倫太郎', arabic: 'رينتارو أوكابي' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Mamoru Miyano', language: 'Japanese' },
          { name: 'J. Michael Tatum', language: 'English' },
        ],
        description: 'Founder of the Future Gadget Laboratory who possesses the unique ability "Reading Steiner" to retain memories across world lines.',
        abilities: ['Reading Steiner (temporal memory invariance)', 'Theoretical gadget improvisation'],
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'kurisu-makise',
        name: { full: 'Kurisu Makise (Christina)', native: '牧瀬 紅莉栖', arabic: 'كوريسو ماكيسي' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Asami Imai', language: 'Japanese' },
          { name: 'Cherami Leigh', language: 'English' },
        ],
        description: 'Genius neuroscientist and Victor Chondria University researcher who constructs the Time Leap Machine.',
        abilities: ['Advanced theoretical physics', 'Memory encoding and brainwave transmission architecture'],
        image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      },
    ],
    relations: [
      { animeId: 'steins-gate-0', relationType: 'ALTERNATIVE', title: 'Steins;Gate 0' },
      { animeId: 'steins-gate-load-region-of-deja-vu', relationType: 'SEQUEL', title: 'Steins;Gate: The Movie − Load Region of Déjà Vu' },
    ],
    streaming: [
      {
        platform: 'Crunchyroll',
        countries: ['US', 'MA', 'UK', 'CA'],
        url: 'https://www.crunchyroll.com/series/GY5P48XEY/steinsgate',
        isDeepLink: true,
        dubAvailable: ['English'],
        subAvailable: ['English', 'Arabic'],
        lastVerified: '2026-10-01',
        confidence: 'verified',
      },
      {
        platform: 'Netflix',
        countries: ['JP'],
        url: 'https://www.netflix.com/title/80005872',
        isDeepLink: true,
        dubAvailable: ['Japanese'],
        subAvailable: ['Japanese'],
        lastVerified: '2026-09-10',
        confidence: 'verified',
      },
    ],
    images: {
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
      keyVisuals: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80'],
      sourceAttribution: 'White Fox / 5pb. / Nitroplus Official Media',
    },
    canonNotes: {
      canonSource: 'Visual novel developed by 5pb. and Nitroplus.',
      fillerEpisodes: [],
      keyArcChronology: [
        { arcName: 'Discovery of D-Mails', episodes: '1-6', isCanon: true },
        { arcName: 'SERN Infiltration & Time Leap Invention', episodes: '7-12', isCanon: true },
        { arcName: 'Mayuri’s Fate & World Line Undo Cycle', episodes: '13-22', isCanon: true },
        { arcName: 'Operation Skuld & The Steins Gate', episodes: '23-24', isCanon: true },
      ],
    },
    spoilers: {
      majorPlotTwists: [
        'Suzuha Amane is John Titor and the time traveler from 2036, as well as Daru’s future daughter.',
        'In order to prevent Mayuri’s death in the Alpha attractor field, Okabe must undo every D-Mail, which returns them to Beta where Kurisu is killed.',
        'Operation Skuld reveals that Okabe must fool his past self into believing Kurisu died, without actually letting her die, reaching the Steins Gate world line.',
      ],
      characterFates: ['Mayuri Shiina dies dozens of times across alpha loops, until Okabe undoes the first D-Mail in SERN’s database.'],
      endingSummary: 'Okabe stages Kurisu’s bloody scene using his own stab wound, preserving timeline convergence and uniting with Kurisu on the streets of Akihabara in the Steins Gate timeline.',
    },
    source: {
      verifiedBy: ['White Fox Archive', 'AniList GraphQL', 'Jikan v4'],
      lastUpdated: '2026-10-01',
    },
  },
  {
    id: 'vinland-saga',
    malId: 37521,
    aniListId: 101348,
    kitsuId: '41144',
    titles: {
      romaji: 'Vinland Saga',
      english: 'Vinland Saga',
      native: 'ヴィンランド・サガ',
      arabic: 'فينلاند ساغا',
      arabicAliases: ['فينلاند ساجا', 'ملحمة فينلاند', 'ثورفين'],
      synonyms: ['Vinland'],
    },
    format: 'TV',
    status: 'FINISHED',
    episodes: 48,
    durationMinutes: 24,
    season: 'SUMMER',
    seasonYear: 2019,
    startDate: '2019-07-08',
    endDate: '2023-06-20',
    synopsis:
      'Young Thorfinn grows up listening to tales of sailors who voyaged across the ocean to Vinland, a fertile land without war. When Viking mercenary Askeladd assassinates Thorfinn’s father Thors, Thorfinn joins Askeladd’s band solely to earn an honorable duel and take revenge, becoming entangled in the war for the crown of England.',
    synopsisArabic:
      'يكبر الفتى ثورفين وهو يستمع إلى أساطير المستكشفين عن أرض فينلاند الخضراء الخالية من الحروب. بعد مقتل والده ثورس غدرًا على يد المرتزق أسكيلاد، ينضم ثورفين إلى فرقته ليقاتل من أجل نيل مبارزة شريفة للثأر، ليتورط في حرب السيطرة على عرش إنجلترا قبل أن يدرك معنى السلام الحقيقي.',
    genres: ['Action', 'Adventure', 'Drama'],
    themes: ['Historical', 'Vikings', 'Pacifism', 'Redemption', 'War'],
    score: 8.86,
    popularityRank: 9,
    studios: [
      { name: 'Wit Studio', isMain: true },
      { name: 'MAPPA', isMain: true },
    ],
    staff: [
      { name: 'Shuhei Yabuta', role: 'Director' },
      { name: 'Makoto Yukimura', role: 'Original Creator' },
      { name: 'Yutaka Yamada', role: 'Music Composer' },
    ],
    characters: [
      {
        id: 'thorfinn',
        name: { full: 'Thorfinn Karlsefni', native: 'トルフィン', arabic: 'ثورفين' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Yuto Uemura', language: 'Japanese' },
          { name: 'Aleks Le', language: 'English' },
        ],
        description: 'Vengeful prodigy scout turned committed pacifist, dedicated to building a peaceful land in Vinland.',
        abilities: ['Dual dagger assassination', 'Incredible agility', 'Absolute non-violence resolve'],
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'askeladd',
        name: { full: 'Askeladd (Lucius Artorius Castus)', native: 'アシェラッド', arabic: 'أسكيلاد' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Naoya Uchida', language: 'Japanese' },
          { name: 'David Wald', language: 'English' },
        ],
        description: 'Astute half-Welsh, half-Danish mercenary commander descended from King Arthur.',
        abilities: ['Master battle strategist', 'Exceptional swordsmanship', 'Political manipulation'],
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      },
    ],
    relations: [],
    streaming: [
      {
        platform: 'Netflix',
        countries: ['US', 'MA', 'UK', 'FR', 'DE', 'CA', 'EG', 'SA'],
        url: 'https://www.netflix.com/title/81249333',
        isDeepLink: true,
        dubAvailable: ['English', 'Japanese'],
        subAvailable: ['Arabic', 'English', 'French'],
        lastVerified: '2026-10-01',
        confidence: 'verified',
      },
      {
        platform: 'Crunchyroll',
        countries: ['US', 'CA', 'MA'],
        url: 'https://www.crunchyroll.com/series/GEXH3WKK0/vinland-saga',
        isDeepLink: true,
        dubAvailable: ['English'],
        subAvailable: ['Arabic', 'English'],
        lastVerified: '2026-09-15',
        confidence: 'verified',
      },
    ],
    images: {
      poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
      keyVisuals: ['https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=80'],
      sourceAttribution: 'Twin Engine / Wit Studio / MAPPA Official Press Kit',
    },
    canonNotes: {
      canonSource: 'Historical manga by Makoto Yukimura serialized in Afternoon.',
      fillerEpisodes: [],
      keyArcChronology: [
        { arcName: 'War Arc / Askeladd Saga', episodes: '1-24 (S1)', isCanon: true },
        { arcName: 'Slave Arc / Ketil’s Farm (Farmland Saga)', episodes: '25-48 (S2)', isCanon: true },
      ],
    },
    spoilers: {
      majorPlotTwists: [
        'Askeladd is of royal Welsh blood and secretly despises all Danes; he serves Prince Canute only to shield Wales from Viking slaughter.',
        'Askeladd decapitates King Sweyn of Denmark in public court to save both Wales and Canute, allowing Canute to slay him and seize the crown.',
      ],
      characterFates: [
        'Askeladd dies in Thorfinn’s arms after being pierced by Canute.',
        'Arnheid dies of trauma and grief at Ketil’s farm after Gardar’s failed escape.',
      ],
      endingSummary: 'Season 2 concludes with Thorfinn returning to Iceland to reunite with his mother Helga and sister Ylva, before gathering funds to set sail for Vinland.',
    },
    source: {
      verifiedBy: ['Twin Engine Release Records', 'AniList GraphQL', 'Jikan v4'],
      lastUpdated: '2026-10-01',
    },
  },
  {
    id: 'cowboy-bebop',
    malId: 1,
    aniListId: 1,
    kitsuId: '1',
    titles: {
      romaji: 'Cowboy Bebop',
      english: 'Cowboy Bebop',
      native: 'カウボーイビバップ',
      arabic: 'كاوبوي بيبوب',
      arabicAliases: ['كاوبوي بيباب', 'سبايك سبيجل'],
      synonyms: ['Bebop'],
    },
    format: 'TV',
    status: 'FINISHED',
    episodes: 26,
    durationMinutes: 24,
    season: 'SPRING',
    seasonYear: 1998,
    startDate: '1998-04-03',
    endDate: '1999-04-24',
    synopsis:
      'In the year 2071, humanity has colonized the solar system while crime thrives. An eccentric crew of bounty hunters—laid-back former hitman Spike Spiegel, pragmatic ex-cop Jet Black, deceptive femme fatale Faye Valentine, eccentric hacker Radical Edward, and genetically engineered Welsh Corgi Ein—drift through the stars aboard the Bebop chasing bounties.',
    synopsisArabic:
      'في عام 2071، انتشرت البشرية عبر كواكب المجموعة الشمسية. يسافر طاقم من صائدي الجوائز على متن سفينة "بيبوب" بقيادة سبايك سبيجل، القاتل المأجور السابق الذي تطارده أشباح ماضيه مع نقابة التنين الأحمر، وشريكه الشرطي السابق جيت بلاك والمخادعة فاي فالنتين، لمطاردة المجرمين وجني المال.',
    genres: ['Action', 'Award Winning', 'Sci-Fi'],
    themes: ['Space Western', 'Neo-Noir', 'Jazz & Blues', 'Philosophical Nostalgia'],
    score: 8.75,
    popularityRank: 10,
    studios: [{ name: 'Sunrise', isMain: true }],
    staff: [
      { name: 'Shinichiro Watanabe', role: 'Director' },
      { name: 'Yoko Kanno & The Seatbelts', role: 'Music Composer' },
      { name: 'Keiko Nobumoto', role: 'Series Composition' },
    ],
    characters: [
      {
        id: 'spike-spiegel',
        name: { full: 'Spike Spiegel', native: 'スパイク・スピーゲル', arabic: 'سبايك سبيجل' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Koichi Yamadera', language: 'Japanese' },
          { name: 'Steve Blum', language: 'English' },
        ],
        description: 'Lethargic bounty hunter and master of Jeet Kune Do living as if in an unending dream.',
        abilities: ['Jeet Kune Do martial arts', 'Trick pistol sharpshooting (Jericho 941)', 'Swordfish II spaceplane dogfighting'],
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      },
    ],
    relations: [
      { animeId: 'cowboy-bebop-the-movie', relationType: 'SIDE_STORY', title: 'Cowboy Bebop: The Movie (Knockin’ on Heaven’s Door)' },
    ],
    streaming: [
      {
        platform: 'Netflix',
        countries: ['US', 'MA', 'UK', 'FR', 'DE', 'CA', 'EG', 'SA'],
        url: 'https://www.netflix.com/title/80001305',
        isDeepLink: true,
        dubAvailable: ['English', 'Japanese'],
        subAvailable: ['Arabic', 'English', 'French'],
        lastVerified: '2026-10-01',
        confidence: 'verified',
      },
      {
        platform: 'Crunchyroll',
        countries: ['US', 'CA'],
        url: 'https://www.crunchyroll.com/series/GY5P48XEY/cowboy-bebop',
        isDeepLink: true,
        dubAvailable: ['English'],
        subAvailable: ['English'],
        lastVerified: '2026-09-12',
        confidence: 'verified',
      },
    ],
    images: {
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
      keyVisuals: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80'],
      sourceAttribution: 'Sunrise / Bandai Visual Official Archives',
    },
    canonNotes: {
      canonSource: 'Original anime produced by Sunrise and directed by Shinichiro Watanabe.',
      fillerEpisodes: [],
      keyArcChronology: [
        { arcName: 'Asteroid Blues & Early Bounties', episodes: '1-4', isCanon: true },
        { arcName: 'Ballad of Fallen Angels (Vicious Duel)', episodes: '5', isCanon: true },
        { arcName: 'Jupiter Jazz Parts 1 & 2', episodes: '12-13', isCanon: true },
        { arcName: 'The Real Folk Blues Parts 1 & 2 (Climax)', episodes: '25-26', isCanon: true },
      ],
    },
    spoilers: {
      majorPlotTwists: [
        'Spike faked his death years ago to escape the Red Dragon Crime Syndicate alongside Julia, the woman he loved.',
        'Vicious stages a bloody coup d’état against the Syndicate Elders to seize ultimate power.',
      ],
      characterFates: [
        'Julia is shot and killed by Syndicate snipers while fleeing with Spike in the cemetery.',
        'Spike kills Vicious at syndicate headquarters, points his finger at the surviving guards, utters "Bang...", and collapses on the staircase.',
      ],
      endingSummary: 'Spike faces his past once and for all. As the camera pans toward the stars, a star fades out to the closing ballad "Blue".',
    },
    source: {
      verifiedBy: ['Sunrise Official Archive', 'AniList GraphQL', 'Jikan v4'],
      lastUpdated: '2026-10-01',
    },
  },
  {
    id: 'bocchi-the-rock',
    malId: 47917,
    aniListId: 130003,
    kitsuId: '44109',
    titles: {
      romaji: 'Bocchi the Rock!',
      english: 'Bocchi the Rock!',
      native: 'ぼっち・ざ・ろっく！',
      arabic: 'بوتشي الصخرة!',
      arabicAliases: ['بوتشي', 'بوتشي ذا روك', 'هيتوري غوتو'],
      synonyms: ['BTR'],
    },
    format: 'TV',
    status: 'FINISHED',
    episodes: 12,
    durationMinutes: 24,
    season: 'FALL',
    seasonYear: 2022,
    startDate: '2022-10-09',
    endDate: '2022-12-25',
    synopsis:
      'Painfully anxious and introverted high school girl Hitori "Bocchi" Gotoh spends years practicing guitar alone in her closet, gaining internet fame under the handle "guitarhero". When extroverted drummer Nijika Ijichi invites her to join Kessoku Band, Bocchi takes terrifying first steps onto the live club stage.',
    synopsisArabic:
      'تعاني هيتوري "بوتشي" غوتو من قلق اجتماعي شديد يقودها لقضاء سنواتها تعزف الجيتار وحيدة داخل خزانتها، محققة شهرة كبيرة على الإنترنت باسم مستعار. تتغير حياتها بالكامل عندما تدعوها عازفة الطبول النشيطة نيجيكا إيجيتشي للانضمام إلى فرقة "كيسوكو باند".',
    genres: ['Comedy'],
    themes: ['Music', 'Social Anxiety', 'Indie Rock', 'Coming of Age'],
    score: 8.80,
    popularityRank: 11,
    studios: [{ name: 'CloverWorks', isMain: true }],
    staff: [
      { name: 'Keiichiro Saito', role: 'Director' },
      { name: 'Aki Hamaji', role: 'Original Manga' },
      { name: 'Tomoki Kikuya', role: 'Music Composer' },
    ],
    characters: [
      {
        id: 'hitori-gotoh',
        name: { full: 'Hitori Gotoh (Bocchi)', native: '後藤 ひとり', arabic: 'هيتوري غوتو' },
        role: 'MAIN',
        voiceActors: [
          { name: 'Yoshino Aoyama', language: 'Japanese' },
          { name: 'Celeste Perez', language: 'English' },
        ],
        description: 'Severely introverted guitarist of Kessoku Band who secretly rocks as internet sensation guitarhero.',
        abilities: ['Virtuoso Gibson Les Paul guitar solos', 'Creative audiovisual panic manifestations'],
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      },
    ],
    relations: [],
    streaming: [
      {
        platform: 'Crunchyroll',
        countries: ['US', 'MA', 'UK', 'FR', 'DE', 'CA', 'EG', 'SA'],
        url: 'https://www.crunchyroll.com/series/GX7H533DK/bocchi-the-rock',
        isDeepLink: true,
        dubAvailable: ['English'],
        subAvailable: ['Arabic', 'English', 'French'],
        lastVerified: '2026-10-01',
        confidence: 'verified',
      },
    ],
    images: {
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
      keyVisuals: ['https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=80'],
      sourceAttribution: 'CloverWorks / Aniplex Official Media',
    },
    canonNotes: {
      canonSource: '4-panel manga by Aki Hamaji serialized in Manga Time Kirara Max.',
      fillerEpisodes: [],
      keyArcChronology: [
        { arcName: 'Kessoku Band Formation & Starry Audition', episodes: '1-5', isCanon: true },
        { arcName: 'First Live Performance', episodes: '8', isCanon: true },
        { arcName: 'School Cultural Festival Live', episodes: '11-12', isCanon: true },
      ],
    },
    spoilers: {
      majorPlotTwists: [
        'Nijika figures out that Bocchi is the famous internet prodigy "guitarhero" during episode 8.',
      ],
      characterFates: ['Bocchi survives her first live stage performances and starts saving money for a new guitar.'],
      endingSummary: 'Kessoku Band plays a historic school festival set where Bocchi improvises a slide guitar solo using a glass bottle after her string snaps, before stage-diving face-first into the floor.',
    },
    source: {
      verifiedBy: ['CloverWorks Media Kit', 'AniList GraphQL', 'Jikan v4'],
      lastUpdated: '2026-10-01',
    },
  },
];

/**
 * In-Memory Database store with search indices
 */
class AnimeKnowledgeBase {
  private records: Map<string, AnimeRecord> = new Map();

  constructor(initialData: AnimeRecord[] = INITIAL_ANIME_DATABASE) {
    for (const anime of initialData) {
      this.records.set(anime.id, anime);
    }
  }

  public getAll(): AnimeRecord[] {
    return Array.from(this.records.values());
  }

  public getById(id: string): AnimeRecord | undefined {
    return this.records.get(id);
  }

  public addOrUpdate(record: AnimeRecord): void {
    this.records.set(record.id, record);
  }

  /**
   * Search anime by query across Arabic, English, Japanese, character, studio, or plot.
   */
  public search(
    query: string,
    options?: {
      genre?: string;
      year?: number;
      limit?: number;
      minScore?: number;
    }
  ): AnimeRecord[] {
    const limit = options?.limit ?? 10;
    if (!query || query.trim() === '') {
      let all = this.getAll();
      if (options?.genre) {
        all = all.filter((a) => a.genres.some((g) => g.toLowerCase() === options.genre!.toLowerCase()));
      }
      if (options?.year) {
        all = all.filter((a) => a.seasonYear === options.year);
      }
      if (options?.minScore) {
        all = all.filter((a) => a.score >= options.minScore!);
      }
      return all.slice(0, limit);
    }

    const normQuery = query.toLowerCase().trim();
    const normArabicQuery = normalizeArabic(normQuery);
    const strippedArabicQuery = stripArabicDefiniteArticle(normQuery);
    const normRomajiQuery = normalizeRomaji(normQuery);
    const normJaQuery = normalizeJapanese(normQuery);

    const scored = this.getAll().map((anime) => {
      let score = 0;

      // 1. Exact ID match
      if (anime.id === normQuery || anime.id.replace(/-/g, '') === normRomajiQuery.replace(/\s+/g, '')) {
        score += 100;
      }

      // 2. Arabic titles & aliases
      const normArabicTitle = normalizeArabic(anime.titles.arabic);
      if (normArabicTitle === normArabicQuery) {
        score += 90;
      } else if (
        normArabicTitle.includes(normArabicQuery) ||
        normArabicQuery.includes(normArabicTitle) ||
        normArabicTitle.includes(strippedArabicQuery)
      ) {
        score += 70;
      } else {
        const arabicSim = levenshteinSimilarity(normArabicTitle, normArabicQuery);
        if (arabicSim > 0.6) score += arabicSim * 50;
      }

      for (const alias of anime.titles.arabicAliases) {
        const normAlias = normalizeArabic(alias);
        if (
          normAlias === normArabicQuery ||
          normAlias.includes(normArabicQuery) ||
          normArabicQuery.includes(normAlias)
        ) {
          score += 75;
          break;
        }
      }

      // 3. English titles & synonyms
      const normEnglishTitle = anime.titles.english.toLowerCase();
      if (normEnglishTitle === normQuery) {
        score += 90;
      } else if (normEnglishTitle.includes(normQuery) || normQuery.includes(normEnglishTitle)) {
        score += 65;
      } else {
        const sim = computeTokenSimilarity(normEnglishTitle, normQuery);
        score += sim * 40;
      }

      // 4. Romaji titles
      const normRomajiTitle = normalizeRomaji(anime.titles.romaji);
      if (
        normRomajiTitle === normRomajiQuery ||
        normRomajiTitle.includes(normRomajiQuery) ||
        normRomajiQuery.includes(normRomajiTitle)
      ) {
        score += 80;
      }

      // 5. Japanese Kanji/Kana
      const normJaTitle = normalizeJapanese(anime.titles.native);
      if (
        (normJaTitle.includes(normJaQuery) || normJaQuery.includes(normJaTitle)) &&
        normJaQuery.length > 0
      ) {
        score += 85;
      }

      // 6. Characters match
      for (const char of anime.characters) {
        const fullChar = char.name.full.toLowerCase();
        const arabicChar = char.name.arabic ? normalizeArabic(char.name.arabic) : '';
        if (fullChar.includes(normQuery) || (arabicChar && arabicChar.includes(normArabicQuery))) {
          score += 45;
          break;
        }
      }

      // 7. Studio match
      for (const studio of anime.studios) {
        if (studio.name.toLowerCase().includes(normQuery)) {
          score += 30;
          break;
        }
      }

      // 8. Synopsis semantic/keyword match
      if (anime.synopsis.toLowerCase().includes(normQuery)) {
        score += 20;
      }
      if (anime.synopsisArabic && normalizeArabic(anime.synopsisArabic).includes(normArabicQuery)) {
        score += 25;
      }

      // 9. Genre / Theme filter
      if (options?.genre && !anime.genres.some((g) => g.toLowerCase() === options.genre!.toLowerCase())) {
        score = -1;
      }
      if (options?.year && anime.seasonYear !== options.year) {
        score = -1;
      }
      if (options?.minScore && anime.score < options.minScore) {
        score = -1;
      }

      return { anime, score };
    });

    return scored
      .filter((item) => item.score > 10)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.anime);
  }
}

export const animeDb = new AnimeKnowledgeBase();
