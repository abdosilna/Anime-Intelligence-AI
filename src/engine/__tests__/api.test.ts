import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../../serverApp.ts';

test('Express API Endpoints & Vercel Compatibility Suite', async (t) => {
  // Start server on ephemeral port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  t.after(() => {
    server.close();
  });

  await t.test('1. GET /health returns 200 and system metadata', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.ok(data.database.indexedAnimeCount >= 10);
  });

  await t.test('2. GET /api/health (dual prefix) returns 200', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
  });

  await t.test('3. GET /api/openapi.json returns valid OpenAPI 3.0.3 document', async () => {
    const res = await fetch(`${baseUrl}/api/openapi.json`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.openapi, '3.0.3');
    assert.ok(data.paths['/health']);
    assert.ok(data.paths['/chat']);
  });

  await t.test('4. GET /anime/search returns search results', async () => {
    const res = await fetch(`${baseUrl}/anime/search?q=هجوم+العمالقة`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.results.length > 0);
    assert.equal(data.results[0].id, 'attack-on-titan');
  });

  await t.test('5. GET /anime/:id returns specific record', async () => {
    const res = await fetch(`${baseUrl}/anime/frieren-beyond-journeys-end`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.id, 'frieren-beyond-journeys-end');
    assert.ok(data.titles.native.includes('葬送のフリーレン'));
  });

  await t.test('6. GET /anime/:id/characters returns character roster', async () => {
    const res = await fetch(`${baseUrl}/anime/attack-on-titan/characters`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.animeId, 'attack-on-titan');
    assert.ok(data.characters.length > 0);
  });

  await t.test('7. GET /anime/:id/episodes returns canon and episode notes', async () => {
    const res = await fetch(`${baseUrl}/anime/detective-conan/episodes`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.animeId, 'detective-conan');
    assert.ok(data.canonNotes.keyArcChronology.length > 0);
  });

  await t.test('8. POST /chat handles question answering with citations', async () => {
    const res = await fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Tell me about Attack on Titan without spoilers',
        spoilerMode: 'safe',
        language: 'en',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.role, 'assistant');
    assert.ok(data.citations.length > 0);
  });

  await t.test('9. POST /recommendations returns multi-criteria suggestions', async () => {
    const res = await fetch(`${baseUrl}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        genres: ['Action'],
        mood: 'dark psychological',
        targetCountry: 'MA',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.recommendations.length > 0);
    assert.ok(data.recommendations[0].reasons.length > 0);
  });

  await t.test('10. GET /availability returns verified regional platforms', async () => {
    const res = await fetch(`${baseUrl}/availability?anime_id=attack-on-titan&country=MA`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.country, 'MA');
    assert.ok(data.platforms.length > 0);
  });

  await t.test('11. POST /scenes/search returns matching scenes', async () => {
    const res = await fetch(`${baseUrl}/scenes/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Levi vs Beast Titan',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.matches.length > 0);
  });

  await t.test('12. GET /images/search returns official posters & visuals', async () => {
    const res = await fetch(`${baseUrl}/images/search?q=Death+Note&type=poster`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.images.length > 0);
  });

  await t.test('13. GET /sources/:id returns provenance audit trail', async () => {
    const res = await fetch(`${baseUrl}/sources/attack-on-titan`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.animeId, 'attack-on-titan');
    assert.ok(data.verifiedBy.length > 0);
  });

  await t.test('14. Unknown API route returns JSON 404 (NEVER HTML)', async () => {
    const res = await fetch(`${baseUrl}/api/non-existent-endpoint`);
    assert.equal(res.status, 404);
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('application/json'), 'Must return JSON content-type');
    const data = await res.json();
    assert.equal(data.error, 'ROUTE_NOT_FOUND');
  });

  await t.test('15. OPTIONS preflight returns 204 with CORS headers', async () => {
    const res = await fetch(`${baseUrl}/chat`, {
      method: 'OPTIONS',
      headers: { Origin: 'https://external-website.com' },
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), '*');
  });
});
