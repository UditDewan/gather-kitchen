import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { defaultPantry, parseCommand, planDinner, getRecipe, buildShoppingList } from '../public/domain.mjs';

const source = await readFile(new URL('../public/app.mjs', import.meta.url), 'utf8');
const imports = "import { defaultPantry, parseCommand } from './domain.mjs';";
assert.ok(source.startsWith(imports));
const flush = async () => { for (let i = 0; i < 8; i++) await new Promise(resolve => setImmediate(resolve)); };
const planResult = request => ({ structuredContent: planDinner(request.arguments) });

// Exercise the real app's state transitions without introducing a browser-test dependency.
async function loadApp(saved) {
  const elements = new Map(), storage = new Map();
  if (saved) storage.set('gather-kitchen-v1', JSON.stringify(saved));
  let focused = null;
  class Element {
    constructor(id = '') {
      this.id = id; this.html = id === '#conversation' ? '<p>Initial greeting</p>' : '';
      this.children = []; this.listeners = {}; this.options = []; this.value = ''; this.checked = false; this.open = false;
      this.classList = { toggle() {}, add() {}, remove() {} }; this.parentElement = {};
    }
    get innerHTML() { return this.html; }
    set innerHTML(value) { this.html = value; this.children = []; }
    addEventListener(type, handler) { this.listeners[type] = handler; }
    append(child) { this.children.push(child); }
    add(option) { this.options.push(option); }
    focus() { focused = this.id; }
    setAttribute() {}
    removeAttribute() {}
    showModal() { this.open = true; }
    close() { if (this.open) { this.open = false; this.listeners.close?.(); } }
  }
  const element = id => { if (!elements.has(id)) elements.set(id, new Element(id)); return elements.get(id); };
  let handler = ({ name, arguments: args }) => ({
    structuredContent: name === 'gather_plan_dinner' ? planDinner(args) : name === 'gather_get_recipe' ? getRecipe(args) : buildShoppingList(args),
  });
  const context = vm.createContext({
    defaultPantry, parseCommand, structuredClone, performance, console, URL, Blob,
    document: { querySelector: element, querySelectorAll: () => [], createElement: () => new Element(), addEventListener() {} },
    window: { addEventListener() {} }, location: { hash: '' }, confirm: () => true,
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    Option: class { constructor(label, value) { this.label = label; this.value = value; } },
    setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1, clearInterval() {},
    fetch: async (_url, options) => {
      const request = JSON.parse(options.body);
      const result = request.method === 'tools/call' ? await handler(request.params) : {};
      return { ok: true, status: 200, json: async () => ({ result }) };
    },
  });
  vm.runInContext(source.slice(imports.length), context, { filename: 'app.mjs' });
  await flush();
  return {
    run: code => vm.runInContext(code, context), element, focus: () => focused,
    handleTools: next => { handler = next; },
    deferTools() {
      const pending = [];
      handler = request => new Promise(resolve => pending.push({ request, resolve }));
      return pending;
    },
  };
}

test('corrupt saved pantry and preferences do not break startup', async () => {
  for (const pantry of [[null], [{ name: '   ', quantity: 1, unit: 'cup', daysLeft: 2 }]]) {
    const app = await loadApp({ pantry });
    assert.equal(app.run('state.pantry.length'), defaultPantry.length);
    assert.ok(app.run('plans.length') > 0);
  }
  const app = await loadApp({ pantry: defaultPantry, preferences: { maxMinutes: 30.5, servings: 2, diet: 'any', avoid: [] } });
  assert.equal(app.run('state.preferences.maxMinutes'), 30);
});

test('invalid chat constraints and parser errors preserve valid preferences', async () => {
  const app = await loadApp();
  const preferences = app.run('JSON.stringify(state.preferences)');
  for (const command of ['Plan dinner for 99 people in 20 minutes', 'Plan dinner in 999 minutes', `Plan dinner without ${'x'.repeat(90)}`]) {
    await app.run(`command(${JSON.stringify(command)})`);
    assert.equal(app.run('JSON.stringify(state.preferences)'), preferences);
  }
  assert.match(app.element('#conversation').children.at(-1).innerHTML, /80 characters/);
});

test('plaintext MCP tool errors reach the user without JSON parsing failures', async () => {
  const app = await loadApp();
  app.handleTools(() => ({ isError: true, content: [{ type: 'text', text: 'Choose a valid recipe.' }] }));
  await assert.rejects(app.run("callTool('gather_get_recipe', {})"), /Choose a valid recipe\./);
  assert.equal(app.run('traces.at(-1).response'), 'Choose a valid recipe.');
});

test('newer plans win over older successes and errors, with snapshotted arguments', async () => {
  const app = await loadApp();
  for (const staleError of [false, true]) {
    const pending = app.deferTools();
    app.run("state.preferences.diet = 'any'; selectedRecipe = { id: 'lemon-chickpea-bowl' }");
    const first = app.run('planDinner(true)');
    await flush();
    assert.equal(app.run('selectedRecipe'), null);
    app.run("state.preferences.diet = 'vegan'");
    const second = app.run('planDinner(true)');
    await flush();
    assert.equal(pending.length, 2);
    assert.equal(pending[0].request.arguments.diet, 'any');
    assert.equal(pending[1].request.arguments.diet, 'vegan');
    pending[1].resolve(planResult(pending[1].request));
    await second;
    const plans = app.run('JSON.stringify(plans)'), status = app.element('#plan-status').textContent;
    pending[0].resolve(staleError ? { isError: true, content: [{ type: 'text', text: 'Old request failed' }] } : planResult(pending[0].request));
    await first;
    assert.equal(app.run('JSON.stringify(plans)'), plans);
    assert.equal(app.element('#plan-status').textContent, status);
    assert.equal(app.element('#plan-form button').disabled, false);
  }
});

test('reset clears conversation and traces and ignores requests from before reset', async () => {
  const app = await loadApp(), pending = app.deferTools();
  const old = app.run('planDinner(true)');
  await flush();
  app.element('#reset-demo').listeners.click();
  await flush();
  assert.equal(app.element('#conversation').innerHTML, '<p>Initial greeting</p>');
  assert.equal(app.run('traces.length'), 0);
  assert.equal(app.element('#tool-count').textContent, '0 calls');
  pending[1].resolve(planResult(pending[1].request));
  await flush();
  assert.equal(app.run('traces.length'), 1);
  pending[0].resolve({ isError: true, content: [{ type: 'text', text: 'Stale before reset' }] });
  await old;
  assert.equal(app.run('traces.length'), 1);
  assert.equal(app.element('#conversation').children.length, 0);
});

test('changing a cooking step gives its focusable heading keyboard focus', async () => {
  const app = await loadApp();
  app.run("selectedRecipe = { title: 'Dinner', servings: 2, steps: [{ title: 'First', instruction: 'Prep', minutes: 1 }, { title: 'Second', instruction: 'Cook', minutes: 1 }] }; cookingStep = 1; renderCooking()");
  assert.equal(app.focus(), '#recipe-dialog-title');
  assert.match(app.element('#recipe-dialog-content').innerHTML, /id="recipe-dialog-title"[^>]*tabindex="-1"/);
  app.run('cookingStep = 2; renderCooking()');
  assert.equal(app.focus(), '#recipe-dialog-title');
  assert.match(app.element('#recipe-dialog-content').innerHTML, /Dinner is served/);
});
