import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createApp } from '../src/server.mjs';
import { defaultPantry, recipes } from '../public/domain.mjs';

let app;
let base;
const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', 'MCP-Protocol-Version': '2025-11-25' };
before(async () => {
  app = createApp();
  await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${app.address().port}`;
});
after(async () => { await new Promise(resolve => app.close(resolve)); });

const rpc = (message, extra = {}) => fetch(`${base}/rpc`, { method: 'POST', headers: { ...headers, ...extra }, body: JSON.stringify(message) });

test('negotiates 2025-11-25 and accepts the initialized notification', async () => {
  const response = await rpc({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'gather-test', version: '1' } } });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).result.protocolVersion, '2025-11-25');
  const notification = await rpc({ jsonrpc: '2.0', method: 'notifications/initialized' });
  assert.equal(notification.status, 202);
});

test('official SDK client discovers tools and completes plan, scale, and shopping workflow', async () => {
  const client = new Client({ name: 'gather-integration-test', version: '1.0.0' });
  try {
    await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/rpc`)));
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map(tool => tool.name).sort(), ['gather_get_recipe', 'gather_plan_dinner', 'gather_shopping_list']);
    const plan = await client.callTool({ name: 'gather_plan_dinner', arguments: { pantry: defaultPantry.map(item => item.name), useSoon: ['spinach'], maxMinutes: 30, servings: 2, diet: 'any', avoid: [] } });
    assert.ok(!plan.isError);
    const data = plan.structuredContent;
    assert.ok(data.recommendations.length > 0);
    const recipeId = data.recommendations[0].id;
    const recipe = await client.callTool({ name: 'gather_get_recipe', arguments: { recipeId, servings: 4 } });
    assert.equal(recipe.structuredContent.servings, 4);
    const shopping = await client.callTool({ name: 'gather_shopping_list', arguments: { recipeId, servings: 4, pantry: [] } });
    assert.deepEqual(shopping.structuredContent.items, recipe.structuredContent.ingredients);
    assert.ok(shopping.structuredContent.items.length > 0);
    const bad = await client.callTool({ name: 'gather_get_recipe', arguments: { recipeId, servings: -1 } });
    assert.equal(bad.isError, true);
  } finally { await client.close(); }
});

test('rejects cross-origin access, unsupported versions, malformed JSON, and oversized requests', async () => {
  const message = { jsonrpc: '2.0', id: 2, method: 'tools/list' };
  assert.equal((await rpc(message, { Origin: 'https://untrusted.example' })).status, 403);
  assert.equal((await rpc(message, { 'MCP-Protocol-Version': '1900-01-01' })).status, 400);
  const broken = await fetch(`${base}/rpc`, { method: 'POST', headers, body: '{broken' });
  assert.equal(broken.status, 400);
  assert.equal((await broken.json()).error.code, -32700);
  const huge = await fetch(`${base}/rpc`, { method: 'POST', headers, body: JSON.stringify({ text: 'x'.repeat(70_000) }) });
  assert.equal(huge.status, 413);
});

test('only exposes intended public assets and health, and disallows standalone SSE', async () => {
  assert.equal((await fetch(`${base}/health`)).status, 200);
  assert.equal((await fetch(`${base}/package.json`)).status, 404);
  assert.equal((await fetch(`${base}/src/server.mjs`)).status, 404);
  assert.equal((await fetch(`${base}/rpc`, { headers: { Accept: 'text/event-stream' } })).status, 405);
});

test('rejects a hostile Host header before serving content', async () => {
  const status = await new Promise((resolve, reject) => {
    http.get(`${base}/health`, { headers: { Host: 'untrusted.example' } }, response => {
      response.resume();
      resolve(response.statusCode);
    }).on('error', reject);
  });
  assert.equal(status, 403);
});

test('serves an image for every recipe without exposing arbitrary image paths', async () => {
  for (const recipe of recipes) {
    const response = await fetch(`${base}/images/${recipe.id}.png`);
    assert.equal(response.status, 200, recipe.id);
    assert.equal(response.headers.get('content-type'), 'image/png');
    const bytes = new Uint8Array(await response.arrayBuffer());
    assert.deepEqual([...bytes.slice(0,8)], [137,80,78,71,13,10,26,10]);
  }
  assert.equal((await fetch(`${base}/images/unknown.png`)).status, 404);
});
