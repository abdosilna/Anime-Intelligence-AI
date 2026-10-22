/**
 * OpenAPI 3.0.3 Specification for Anime Intelligence AI
 */

export const OPENAPI_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'Anime Intelligence AI — Engine & Knowledge API',
    version: '1.0.0',
    description:
      'High-performance specialized AI engine and retrieval-augmented knowledge retrieval system for Japanese anime, characters, story arcs, official streaming availability, scene discovery, and multilingual Arabic/English/Japanese Q&A.',
    contact: {
      name: 'Anime Intelligence AI Engineering',
      email: 'engineering@anime-intelligence.ai',
    },
    license: {
      name: 'Apache-2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Current Environment / Local Server',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Service Health & Engine Status',
        description: 'Returns the operational status, database statistics, and model adapter availability.',
        responses: {
          '200': {
            description: 'System healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', example: '2026-10-22T06:00:00.000Z' },
                    engine: { type: 'string', example: 'Anime Intelligence AI v1.0.0' },
                    database: {
                      type: 'object',
                      properties: {
                        indexedAnimeCount: { type: 'integer', example: 10 },
                        verifiedScenesCount: { type: 'integer', example: 7 },
                      },
                    },
                    geminiApiAttached: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/anime/search': {
      get: {
        summary: 'Search Anime Knowledge Base',
        description:
          'Searches anime across English, Romaji, Japanese (Kanji/Kana), Modern Standard Arabic, and Moroccan Darija aliases.',
        parameters: [
          { name: 'q', in: 'query', description: 'Search query (title, character, or plot)', required: false, schema: { type: 'string' } },
          { name: 'genre', in: 'query', description: 'Filter by genre', required: false, schema: { type: 'string' } },
          { name: 'year', in: 'query', description: 'Filter by release year', required: false, schema: { type: 'integer' } },
          { name: 'limit', in: 'query', description: 'Max results', required: false, schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          '200': {
            description: 'Search results matching criteria',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string' },
                    total: { type: 'integer' },
                    results: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/AnimeRecord' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/anime/{id}': {
      get: {
        summary: 'Get Detailed Anime Record',
        description: 'Retrieves complete metadata, canon chronology, streaming links, and spoiler data for a specific anime ID.',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'Unique anime slug or ID', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Anime details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AnimeRecord' },
              },
            },
          },
          '404': { description: 'Anime not found' },
        },
      },
    },
    '/anime/{id}/characters': {
      get: {
        summary: 'Get Characters for Anime',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'Unique anime slug', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'List of characters and voice actor credits',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    animeId: { type: 'string' },
                    characters: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CharacterRecord' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/anime/{id}/episodes': {
      get: {
        summary: 'Get Episode & Canon Arc Chronology',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'Anime slug', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Episode counts, canon source details, and filler classifications',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    animeId: { type: 'string' },
                    totalEpisodes: { type: 'integer' },
                    canonNotes: { $ref: '#/components/schemas/CanonNotes' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/chat': {
      post: {
        summary: 'Intelligent RAG Anime Question Answering',
        description:
          'Submits a question to the RAG pipeline. Supports English, Japanese, Modern Standard Arabic, and Moroccan Darija. Enforces spoiler shields and returns citations.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', example: 'اشرح لي قصة هجوم العمالقة بدون حرق' },
                  conversationId: { type: 'string', example: 'user-sess-102' },
                  spoilerMode: { type: 'string', enum: ['safe', 'unrestricted'], default: 'safe' },
                  language: { type: 'string', enum: ['auto', 'ar', 'en', 'ja', 'darija'], default: 'auto' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Grounding-cited answer with spoiler metadata',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChatMessage' },
              },
            },
          },
        },
      },
    },
    '/recommendations': {
      post: {
        summary: 'Generate Multi-Criteria Anime Recommendations',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  genres: { type: 'array', items: { type: 'string' }, example: ['Action', 'Fantasy'] },
                  mood: { type: 'string', example: 'dark psychological' },
                  pacing: { type: 'string', enum: ['fast', 'moderate', 'slow'] },
                  maxEpisodes: { type: 'integer', example: 50 },
                  status: { type: 'string', enum: ['FINISHED', 'RELEASING'] },
                  minScore: { type: 'number', example: 8.5 },
                  targetCountry: { type: 'string', example: 'MA' },
                  includeNiche: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Scored recommendations with concrete explanations in English and Arabic',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: { type: 'integer' },
                    recommendations: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          anime: { $ref: '#/components/schemas/AnimeRecord' },
                          matchScore: { type: 'number' },
                          reasons: { type: 'array', items: { type: 'string' } },
                          reasonsArabic: { type: 'array', items: { type: 'string' } },
                          isNicheGem: { type: 'boolean' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/availability': {
      get: {
        summary: 'Check Official Legal Streaming Availability',
        parameters: [
          { name: 'anime_id', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'country', in: 'query', description: 'ISO 2-letter country code (e.g. MA, US, JP, FR)', schema: { type: 'string', default: 'MA' } },
          { name: 'platform', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Streaming providers, verified deep links, and fallback searches',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    animeId: { type: 'string' },
                    animeTitle: { type: 'string' },
                    country: { type: 'string' },
                    countryName: { type: 'string' },
                    platforms: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/StreamingAvailability' },
                    },
                    officialSearchFallbacks: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/scenes/search': {
      post: {
        summary: 'Natural Language Scene & Clip Discovery',
        description: 'Search iconic anime moments by describing what happens in the scene.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: { type: 'string', example: 'Levi ambushes the beast titan in the smoke' },
                  anime_id: { type: 'string' },
                  limit: { type: 'integer', default: 5 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Matching scenes with verified episode, timestamp estimates, and official legal clips',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string' },
                    matches: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/SceneRecord' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/images/search': {
      get: {
        summary: 'Find High-Resolution Artwork & Key Visuals',
        parameters: [
          { name: 'q', in: 'query', description: 'Anime title or character name', schema: { type: 'string' } },
          { name: 'type', in: 'query', enum: ['poster', 'banner', 'key_visual', 'character', 'all'], schema: { type: 'string', default: 'all' } },
        ],
        responses: {
          '200': {
            description: 'High-res images with source attribution',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer' },
                    images: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/AnimeImage' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/sources/{id}': {
      get: {
        summary: 'Data Provenance & Source Verification',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Source verification audit trail',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    animeId: { type: 'string' },
                    verifiedBy: { type: 'array', items: { type: 'string' } },
                    lastUpdated: { type: 'string' },
                    canonSource: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      AnimeRecord: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          titles: {
            type: 'object',
            properties: {
              romaji: { type: 'string' },
              english: { type: 'string' },
              native: { type: 'string' },
              arabic: { type: 'string' },
              arabicAliases: { type: 'array', items: { type: 'string' } },
            },
          },
          format: { type: 'string' },
          status: { type: 'string' },
          episodes: { type: 'integer', nullable: true },
          seasonYear: { type: 'integer' },
          score: { type: 'number' },
          genres: { type: 'array', items: { type: 'string' } },
          studios: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                isMain: { type: 'boolean' },
              },
            },
          },
        },
      },
      CharacterRecord: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: {
            type: 'object',
            properties: {
              full: { type: 'string' },
              native: { type: 'string' },
              arabic: { type: 'string' },
            },
          },
          role: { type: 'string' },
          abilities: { type: 'array', items: { type: 'string' } },
        },
      },
      CanonNotes: {
        type: 'object',
        properties: {
          canonSource: { type: 'string' },
          fillerEpisodes: { type: 'array', items: { type: 'string' } },
          keyArcChronology: { type: 'array', items: { type: 'object' } },
        },
      },
      StreamingAvailability: {
        type: 'object',
        properties: {
          platform: { type: 'string' },
          countries: { type: 'array', items: { type: 'string' } },
          url: { type: 'string' },
          isDeepLink: { type: 'boolean' },
          confidence: { type: 'string', enum: ['verified', 'estimated', 'unconfirmed'] },
        },
      },
      SceneRecord: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          animeTitle: { type: 'string' },
          season: { type: 'integer' },
          episode: { type: 'integer' },
          timestampApprox: { type: 'string' },
          sceneTitle: { type: 'string' },
          sceneTitleArabic: { type: 'string' },
          description: { type: 'string' },
          officialClipUrl: { type: 'string' },
          confidence: { type: 'string' },
        },
      },
      ChatMessage: {
        type: 'object',
        properties: {
          role: { type: 'string' },
          content: { type: 'string' },
          timestamp: { type: 'integer' },
          citations: { type: 'array', items: { type: 'object' } },
          spoilersContained: { type: 'boolean' },
        },
      },
      AnimeImage: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          url: { type: 'string' },
          type: { type: 'string' },
          attribution: { type: 'string' },
        },
      },
    },
  },
};
