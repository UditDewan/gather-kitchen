import { defaultPantry, parseCommand } from './domain.mjs';

const $ = (selector) => document.querySelector(selector);
const escape = (value) => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const key = 'gather-kitchen-v1';
const initialConversation = $('#conversation').innerHTML;
const freshState = () => ({pantry:structuredClone(defaultPantry),preferences:{maxMinutes:30,servings:2,diet:'any',avoid:[]},shopping:null,checked:[]});
function validatedPreferences(value) {
  if (!value || !Number.isInteger(value.maxMinutes) || value.maxMinutes < 5 || value.maxMinutes > 120) throw new Error('Choose a cooking time from 5 to 120 whole minutes.');
  if (!Number.isInteger(value.servings) || value.servings < 1 || value.servings > 12) throw new Error('Choose a whole serving count from 1 to 12.');
  if (!['any','vegetarian','vegan'].includes(value.diet)) throw new Error('Choose any diet, vegetarian, or vegan.');
  if (!Array.isArray(value.avoid) || value.avoid.length > 100 || value.avoid.some(name => typeof name !== 'string' || !name.trim() || name.length > 80)) throw new Error('Use up to 100 non-empty ingredient exclusions, each 80 characters or fewer.');
  return {maxMinutes:value.maxMinutes,servings:value.servings,diet:value.diet,avoid:value.avoid.map(name => name.trim())};
}
let state = freshState();
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (saved && Array.isArray(saved.pantry) && saved.pantry.length <= 100 && saved.pantry.every(item => item && typeof item.name === 'string' && item.name.trim() && item.name.length <= 60 && Number.isFinite(item.quantity) && item.quantity > 0 && item.quantity <= 1000 && typeof item.unit === 'string' && item.unit.trim() && item.unit.length <= 24 && Number.isInteger(item.daysLeft) && item.daysLeft >= 0 && item.daysLeft <= 365)) {
    state.pantry = saved.pantry.map(item => ({...item,name:item.name.trim(),unit:item.unit.trim()}));
    if (saved.preferences) state.preferences = validatedPreferences(saved.preferences);
    if (saved.shopping && Array.isArray(saved.shopping.items) && Array.isArray(saved.shopping.available) && typeof saved.shopping.title === 'string') state.shopping = saved.shopping;
    if (Array.isArray(saved.checked)) state.checked = saved.checked.filter(item => typeof item === 'string');
  }
} catch { /* An unreadable browser save leaves the starter pantry available. */ }
let plans = [], selectedRecipe = null, cookingStep = null, ingredientIndex = null, initialized = null, requestId = 0, planVersion = 0, resetVersion = 0, traces = [], toastTimeout, timerInterval, timerEnd = null, timerRemaining = 0;

function save() {
  try { localStorage.setItem(key, JSON.stringify(state)); }
  catch { toast('Your browser could not save this change. Keep this tab open to retain it.'); }
}
function toast(message) { $('#toast').textContent = message; $('#toast').hidden = false; clearTimeout(toastTimeout); toastTimeout = setTimeout(() => { $('#toast').hidden = true; }, 5000); }
function status(message, error = false) { $('#plan-status').textContent = message; $('#plan-status').classList.toggle('error', error); }
function preferencesToForm() {
  for (const [field,id,label] of [['maxMinutes','max-minutes','minutes'],['servings','servings','people'],['diet','diet','']]) {
    const select = $(`#${id}`), value = String(state.preferences[field]);
    if (![...select.options].some(option => option.value === value)) select.add(new Option(`${value} ${label}`, value));
    select.value = value;
  }
  $('#avoid-summary').hidden = !state.preferences.avoid.length;
  $('#avoid-summary').innerHTML = `Avoiding: ${state.preferences.avoid.map(escape).join(', ')} <button type="button" id="clear-avoid">Clear</button>`;
}
function renderTraces() {
  $('#tool-count').textContent = `${traces.length} call${traces.length === 1 ? '' : 's'}`;
  $('#tool-traces').innerHTML = traces.slice().reverse().map(trace => `<details class="tool-trace"><summary class="${trace.error ? 'trace-failed' : ''}">${escape(trace.name)} · ${trace.error ? 'error' : 'done'} · ${trace.ms}ms</summary><pre>${escape(JSON.stringify({endpoint:'/rpc',arguments:trace.args,response:trace.response},null,2))}</pre></details>`).join('');
}
async function rpc(method, params, notification = false) {
  const response = await fetch('/rpc', {method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json, text/event-stream','MCP-Protocol-Version':'2025-11-25'},body:JSON.stringify({jsonrpc:'2.0',...(!notification ? {id:++requestId} : {}),method,params})});
  if (!response.ok) throw new Error(`The kitchen server returned ${response.status}. Please try again.`);
  if (notification) return;
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message || 'The tool request failed.');
  return payload.result;
}
async function callTool(name,args) {
  const start = performance.now(), epoch = resetVersion;
  try {
    if (!initialized) initialized = (async () => { await rpc('initialize',{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'gather-web',version:'1.0.0'}}); await rpc('notifications/initialized',{},true); })().catch(error => { initialized = null; throw error; });
    await initialized;
    const result = await rpc('tools/call',{name,arguments:args});
    const text = result.content?.find(item => item.type === 'text')?.text;
    if (result.isError) throw new Error(text || 'The tool could not complete this request.');
    const data = result.structuredContent ?? JSON.parse(text);
    if (epoch === resetVersion) { traces.push({name,args,response:data,ms:Math.round(performance.now()-start)}); renderTraces(); } return data;
  } catch (error) {
    if (epoch === resetVersion) { traces.push({name,args,response:error.message,error:true,ms:Math.round(performance.now()-start)}); renderTraces(); } throw error;
  }
}
function pantryArgs() { return {pantry:state.pantry.map(item => item.name),useSoon:state.pantry.filter(item => item.daysLeft <= 3).map(item => item.name)}; }
function recipeMeta(recipe) { return `<div class="recipe-meta"><span>${icon('clock')}${recipe.minutes} min</span><span>${icon('people')}${recipe.servings} servings</span><span>${icon('leaf')}${recipe.tags.includes('vegan') ? 'Vegan' : 'Vegetarian'}</span></div>`; }
function renderPlans() {
  const recipe = plans[0];
  if (!recipe) {
    $('#recommendation').innerHTML = '<div class="empty-state"><p class="eyebrow">A LITTLE MORE ROOM TO COOK</p><h2>No recipes fit just yet.</h2><p>Try more time, fewer exclusions, or a different dietary preference. Gather has six recipes to work with.</p><button class="primary-button" id="relax-preferences">Reset preferences</button></div>';
    $('#recipe-options').innerHTML = ''; $('#option-count').textContent = ''; return;
  }
  $('#recommendation').innerHTML = `<article class="featured-recipe">
    <div class="featured-photo"><img src="/images/${escape(recipe.id)}.png" alt="${escape(recipe.title)}" width="1254" height="1254" fetchpriority="high"><span class="pick-label">${icon('spark')} Tonight's pick</span><span class="pantry-badge">${icon('check')}${recipe.coverage}% in your pantry</span></div>
    <div class="featured-copy"><h2>${escape(recipe.title)}</h2>${recipeMeta(recipe)}<p class="recipe-description">${escape(recipe.description)}</p><p class="recipe-reason">${icon('leaf')}${recipe.useSoonIngredients.length ? `Uses your ${escape(recipe.useSoonIngredients.join(', '))}.` : 'A good fit for your time and preferences.'}</p><p class="missing-count">${recipe.missingIngredients.length ? `${recipe.missingIngredients.length} ingredient${recipe.missingIngredients.length === 1 ? '' : 's'} missing` : 'All ingredients matched. Check your quantities.'}</p><div class="recipe-actions"><button type="button" class="primary-button" data-cook="${escape(recipe.id)}">Cook this ${icon('arrow')}</button><button type="button" class="secondary-button" data-recipe="${escape(recipe.id)}">View recipe</button></div></div>
  </article>`;
  const alternatives = plans.slice(1,4);
  $('#option-count').textContent = `${alternatives.length} more idea${alternatives.length === 1 ? '' : 's'}`;
  $('#recipe-options').innerHTML = alternatives.length ? alternatives.map(item => `<article class="recipe-card">
    <button type="button" class="recipe-photo" data-recipe="${escape(item.id)}" aria-label="View ${escape(item.title)}"><img src="/images/${escape(item.id)}.png" alt="" width="1254" height="1254" loading="lazy"></button>
    <div class="card-body"><h3>${escape(item.title)}</h3>${recipeMeta(item)}<div class="card-summary"><span class="pantry-badge">${icon('leaf')}${item.coverage}% in pantry</span><span class="missing-count">${item.missingIngredients.length ? `${item.missingIngredients.length} missing` : 'All matched'}</span></div><div class="recipe-actions"><button type="button" class="secondary-button" data-recipe="${escape(item.id)}">View recipe</button><button type="button" class="primary-button" data-cook="${escape(item.id)}">Cook ${icon('arrow')}</button></div></div>
  </article>`).join('') : '<p class="no-alternatives">This is the only recipe that fits. Change your preferences above to see more ideas.</p>';
}
async function planDinner(announce = false) {
  const version = ++planVersion, args = structuredClone({...state.preferences,...pantryArgs()});
  selectedRecipe = null; plans = []; cookingStep = null; stopTimer(); if ($('#recipe-dialog').open) $('#recipe-dialog').close();
  $('#plan-form button').disabled = true; status('Checking your pantry and preferences…');
  $('#recommendation').innerHTML = '<div class="empty-state"><h2>Finding dinner…</h2><p>Checking your pantry and preferences.</p></div>';
  $('#recipe-options').innerHTML = ''; $('#option-count').textContent = '';
  try {
    const result = await callTool('gather_plan_dinner',args);
    if (version !== planVersion) return false;
    plans = result.recommendations; renderPlans();
    status(plans.length ? `${plans.length} recipes fit your evening. Pantry matches check ingredient presence.` : 'No recipes match these preferences.');
    if (announce) addMessage(plans.length ? `I'd make ${plans[0].title.toLowerCase()}. It takes ${plans[0].minutes} minutes, serves ${plans[0].servings}, and you have ${plans[0].coverage}% of its ingredients. ${plans[0].useSoonIngredients.length ? `It also uses your ${plans[0].useSoonIngredients.join(' and ')}.` : ''}` : 'None of the six recipes fits these preferences. Try more time or clear an exclusion.');
    return true;
  } catch (error) { if (version !== planVersion) return false; status(error.message,true); if (announce) addMessage(error.message); if (!plans.length) $('#recommendation').innerHTML = '<div class="empty-state"><h2>The kitchen is offline.</h2><p>Start the Gather server and choose Find dinner to try again. No recipe result has been invented.</p></div>'; return false; }
  finally { if (version === planVersion) $('#plan-form button').disabled = false; }
}
function showView() {
  const name = ['tonight','pantry','shopping','about'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'tonight';
  document.querySelectorAll('.view').forEach(view => { view.hidden = view.id !== `view-${name}`; });
  document.querySelectorAll('.nav-link').forEach(link => { const active = link.dataset.view === name; link.classList.toggle('active',active); if(active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
  if (name === 'pantry') renderPantry(); if (name === 'shopping') renderShopping();
}
function renderPantry() {
  $('#pantry-count').textContent = state.pantry.length; $('#pantry-total').textContent = state.pantry.length;
  const soon = state.pantry.filter(item => item.daysLeft <= 3);
  $('#pantry-nudge-copy').textContent = soon.length ? `${soon.length} ingredients marked to use soon. Let's give them a good dinner.` : 'Use what you have. Make something you’ll love.';
  $('#pantry-items').innerHTML = state.pantry.length ? state.pantry.map((item,index) => `<article class="pantry-item"><span class="ingredient-symbol" aria-hidden="true">${escape(item.name[0].toUpperCase())}</span><div class="pantry-item-info"><h3>${escape(item.name)}</h3><p>${item.quantity} ${escape(item.unit)}</p></div><span class="freshness-tag ${item.daysLeft <= 3 ? 'soon' : ''}">${item.daysLeft <= 3 ? 'Use soon · ' : ''}${item.daysLeft}d</span><div class="item-actions"><button data-edit="${index}" aria-label="Edit ${escape(item.name)}">Edit</button><button data-remove="${index}" aria-label="Remove ${escape(item.name)}">Remove</button></div></article>`).join('') : '<div class="empty-state"><h2>A clean slate.</h2><p>Add your first ingredient to start planning from your pantry.</p></div>';
}
function openIngredient(index = null) {
  ingredientIndex = index; const item = index === null ? {name:'',quantity:1,unit:'piece',daysLeft:7} : state.pantry[index];
  $('#ingredient-dialog-title').textContent = index === null ? 'Add ingredient' : 'Edit ingredient';
  for (const [id,value] of [['name',item.name],['quantity',item.quantity],['unit',item.unit],['days',item.daysLeft]]) $(`#ingredient-${id}`).value = value;
  $('#ingredient-error').textContent = ''; $('#ingredient-dialog').showModal(); $('#ingredient-name').focus();
}
$('#ingredient-form').addEventListener('submit',event => {
  event.preventDefault();
  const item = {name:$('#ingredient-name').value.trim(),quantity:Number($('#ingredient-quantity').value),unit:$('#ingredient-unit').value.trim(),daysLeft:Number($('#ingredient-days').value)};
  if (!item.name || item.name.length > 60 || !item.unit || item.unit.length > 24 || item.quantity <= 0 || item.quantity > 1000 || !Number.isFinite(item.quantity) || !Number.isInteger(item.daysLeft) || item.daysLeft < 0 || item.daysLeft > 365) { $('#ingredient-error').textContent = 'Please enter a name, unit, positive quantity, and 0–365 days.'; return; }
  if (state.pantry.some((entry,index) => index !== ingredientIndex && entry.name.toLowerCase() === item.name.toLowerCase())) { $('#ingredient-error').textContent = 'That ingredient is already here. Edit its existing entry.'; return; }
  if (ingredientIndex === null && state.pantry.length >= 100) { $('#ingredient-error').textContent = 'This demo supports up to 100 pantry ingredients.'; return; }
  if (ingredientIndex === null) state.pantry.push(item); else state.pantry[ingredientIndex] = item;
  save(); renderPantry(); $('#ingredient-dialog').close(); toast('Pantry updated. Plan dinner to use your latest ingredients.');
});
async function openRecipe(id) {
  const version = planVersion;
  try { const recipe = await callTool('gather_get_recipe',{recipeId:id,servings:state.preferences.servings}); if (version !== planVersion) return false; selectedRecipe = recipe; cookingStep = null; stopTimer(); renderRecipe(); if(!$('#recipe-dialog').open) $('#recipe-dialog').showModal(); return true; }
  catch(error) { if (version === planVersion) toast(error.message); return false; }
}
function renderRecipe() {
  const recipe = selectedRecipe;
  $('#recipe-dialog-content').innerHTML = `<div class="recipe-dialog-hero"><img src="/images/${escape(recipe.id)}.png" alt="${escape(recipe.title)}" width="1254" height="1254"></div><div class="recipe-dialog-intro"><h2 id="recipe-dialog-title" class="dialog-title">${escape(recipe.title)}</h2>${recipeMeta(recipe)}<p class="dialog-description">${escape(recipe.description)}</p></div><div class="recipe-dialog-grid"><section><h3>Ingredients</h3><ul class="ingredient-list">${recipe.ingredients.map(item => `<li><span>${escape(item.name)}</span><small>${item.quantity} ${escape(item.unit)}</small></li>`).join('')}</ul></section><section><h3>Method</h3><ol class="recipe-steps">${recipe.steps.map(step => `<li><strong>${escape(step.title)} · ${step.minutes} min</strong>${escape(step.instruction)}</li>`).join('')}</ol></section></div><div class="recipe-dialog-actions"><button class="primary-button" id="start-cooking">Start cooking ${icon('arrow')}</button><button class="secondary-button" id="recipe-shopping">Make shopping list ${icon('list')}</button></div>`;
}
function stopTimer() { clearInterval(timerInterval); timerInterval = null; timerEnd = null; timerRemaining = 0; }
function timerLabel(seconds) { return `${Math.floor(seconds / 60).toString().padStart(2,'0')}:${(seconds % 60).toString().padStart(2,'0')}`; }
function renderCooking() {
  stopTimer();
  if(cookingStep >= selectedRecipe.steps.length) {
    $('#recipe-dialog-content').innerHTML = `<div class="cook-finish"><div class="finish-icon">${icon('check')}</div><p class="eyebrow">YOU MADE SOMETHING GOOD</p><h2 id="recipe-dialog-title" tabindex="-1">Dinner is served.</h2><p>${escape(selectedRecipe.title)} for ${selectedRecipe.servings}.<br>Take a seat. Enjoy what you made.</p><button class="primary-button" id="done-cooking">Back to the kitchen ${icon('arrow')}</button></div>`; $('#recipe-dialog-title').focus(); return;
  }
  const step = selectedRecipe.steps[cookingStep]; timerRemaining = step.minutes * 60;
  $('#recipe-dialog-content').innerHTML = `<p class="eyebrow">${escape(selectedRecipe.title)}</p><div class="step-progress" aria-label="Step ${cookingStep+1} of ${selectedRecipe.steps.length}">${selectedRecipe.steps.map((_,index)=>`<span class="${index <= cookingStep ? 'done' : ''}"></span>`).join('')}</div><p class="cooking-topline">STEP ${cookingStep+1} OF ${selectedRecipe.steps.length}</p><h2 id="recipe-dialog-title" class="cooking-title" tabindex="-1">${escape(step.title)}</h2><p class="cooking-instruction">${escape(step.instruction)}</p><div class="timer-box">${icon('clock')}<span class="timer-display" id="timer-display" role="timer" aria-label="Step timer">${timerLabel(timerRemaining)}</span><button id="toggle-timer">Start timer</button><button id="reset-timer">Reset</button></div><div class="cooking-actions"><button class="secondary-button" id="previous-step">${cookingStep === 0 ? 'View recipe' : 'Previous step'}</button><button class="primary-button" id="next-step">${cookingStep === selectedRecipe.steps.length-1 ? 'Finish cooking' : 'Next step'} ${icon('arrow')}</button></div><p class="shopping-note">The timer runs while this page stays open. Moving to another step resets it.</p>`;
  $('#recipe-dialog-title').focus();
}
function toggleTimer() {
  if (timerEnd) { timerRemaining = Math.max(0,Math.ceil((timerEnd-Date.now())/1000)); clearInterval(timerInterval); timerEnd = null; $('#toggle-timer').textContent = 'Resume timer'; return; }
  if (!timerRemaining) timerRemaining = selectedRecipe.steps[cookingStep].minutes*60;
  timerEnd = Date.now()+timerRemaining*1000; $('#toggle-timer').textContent = 'Pause timer';
  timerInterval = setInterval(() => { timerRemaining = Math.max(0,Math.ceil((timerEnd-Date.now())/1000)); if ($('#timer-display')) $('#timer-display').textContent = timerLabel(timerRemaining); if (!timerRemaining) { clearInterval(timerInterval); timerEnd = null; $('#toggle-timer').textContent = 'Start again'; toast('Your step timer is finished. Check your food before continuing.'); speak('Your step timer is finished.'); } },250);
}
async function makeShopping(recipeId = selectedRecipe?.id || plans[0]?.id) {
  if (!recipeId) { addMessage('Plan a dinner first, then I can make its shopping list.'); return; }
  const version = planVersion, servings = state.preferences.servings, pantry = state.pantry.map(item => item.name);
  try {
    const [list,recipe] = await Promise.all([callTool('gather_shopping_list',{recipeId,servings,pantry}),callTool('gather_get_recipe',{recipeId,servings})]);
    if (version !== planVersion) return;
    state.shopping = {...list,recipeId,title:recipe.title,servings:recipe.servings}; state.checked = []; save(); renderShopping(); $('#recipe-dialog').close(); location.hash = 'shopping';
    addMessage(list.items.length ? `Your list for ${recipe.title.toLowerCase()} has ${list.items.length} missing ingredients. Check quantities in your pantry before you shop.` : `You have every ingredient for ${recipe.title.toLowerCase()}. Check your quantities before you start.`);
  } catch(error) { if (version === planVersion) toast(error.message); }
}
function renderShopping() {
  const list = state.shopping;
  if (!list) { $('#shopping-content').innerHTML = `<div class="empty-state"><p class="eyebrow">LET'S KEEP IT SIMPLE</p><h2>Good dinner. Small shopping trip.</h2><p>Pick a recipe to see only the ingredients missing from your pantry.</p><button class="primary-button" id="build-shopping">Use tonight's pick ${icon('arrow')}</button></div>`; return; }
  const count = list.items.filter(item => state.checked.includes(item.name)).length;
  $('#shopping-content').innerHTML = `<article class="shopping-card"><div class="shopping-header"><div><p class="eyebrow">ON THE MENU</p><h2>${escape(list.title)}</h2><p>For ${list.servings} · ${list.items.length} ingredient${list.items.length === 1 ? '' : 's'} to pick up</p></div>${icon('list')}</div><div class="shopping-progress"><span style="width:${list.items.length ? count/list.items.length*100 : 100}%"></span></div><p class="shopping-progress-label">${count} of ${list.items.length} checked off</p>${list.items.length ? list.items.map(item=>`<label class="shopping-item"><input type="checkbox" data-check="${escape(item.name)}" ${state.checked.includes(item.name)?'checked':''}><span>${escape(item.name)}<small>${item.quantity} ${escape(item.unit)}</small></span></label>`).join('') : '<div class="empty-state"><h2>Your pantry has this one covered.</h2><p>No missing ingredients. Check quantities, and you’re ready to cook.</p></div>'}<p class="shopping-note">${escape(list.note || 'Matches check ingredient presence, not available quantities.')} This list is a snapshot. Rebuild it after changing your pantry.</p><div class="shopping-actions"><button class="primary-button" id="export-shopping">${icon('download')} Export list</button><button class="secondary-button" id="refresh-shopping">Refresh from pantry</button><button class="secondary-button" data-recipe="${escape(list.recipeId)}">View recipe</button></div></article><div class="already-have"><h3>Already in your pantry</h3><div class="ingredient-chips">${list.available.map(item=>`<span class="ingredient-chip">${icon('check')}${escape(item.name)}</span>`).join('') || '<p class="helper-copy">Add ingredients to your pantry to find more matches.</p>'}</div></div>`;
}
function exportShopping() {
  const list = state.shopping;
  const text = `GATHER · ${list.title}\nServes ${list.servings}\n\n${list.items.length ? list.items.map(item=>`${state.checked.includes(item.name)?'[x]':'[ ]'} ${item.quantity} ${item.unit} ${item.name}`).join('\n') : 'No missing ingredients.'}\n\nAlready in your pantry: ${list.available.map(item=>item.name).join(', ')}\n\n${list.note || 'Check available quantities before shopping.'}\n`;
  const url = URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})); const link = document.createElement('a'); link.href = url; link.download = 'gather-shopping-list.txt'; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); toast('Shopping list exported.');
}
function speak(text) { if ($('#speak-replies').checked && 'speechSynthesis' in window) { speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.rate = .95; speechSynthesis.speak(utterance); } }
function addMessage(text, role = 'assistant') {
  const message = document.createElement('div'); message.className = `chat-message ${role}-message`; message.innerHTML = `<span class="message-label">${role === 'assistant' ? 'GATHER' : 'YOU'}</span><p>${escape(text)}</p>`; $('#conversation').append(message); $('#conversation').scrollTop = $('#conversation').scrollHeight; if (role === 'assistant') speak(text);
}
async function command(text) {
  text = text.trim(); if (!text || text.length > 300) return;
  addMessage(text,'user'); $('#command').value = '';
  const epoch = resetVersion;
  try {
    const parsed = parseCommand(text);
    const preferences = validatedPreferences({...state.preferences,...parsed.constraints});
    if (parsed.intent === 'help') { addMessage('Try “vegan dinner for four in 20 minutes”, “make a shopping list”, or “start cooking”. In the cooking dialog, use the Next step and Previous step buttons. I understand a small set of commands in this simulator.'); return; }
    if (parsed.intent === 'next') { if(cookingStep === null || !selectedRecipe || !$('#recipe-dialog').open) addMessage('Open a recipe and start cooking first.'); else { cookingStep = Math.min(cookingStep+1,selectedRecipe.steps.length); renderCooking(); addMessage(cookingStep >= selectedRecipe.steps.length ? 'Dinner is served. Enjoy!' : selectedRecipe.steps[cookingStep].instruction); } return; }
    if (parsed.intent === 'repeat') { addMessage(cookingStep !== null && selectedRecipe?.steps[cookingStep] ? selectedRecipe.steps[cookingStep].instruction : 'Open a recipe and start cooking, then ask me to repeat a step.'); return; }
    const changed = Object.keys(parsed.constraints).length > 0;
    if (changed) { state.preferences = preferences; preferencesToForm(); save(); }
    if (parsed.intent === 'shopping' || parsed.intent === 'cook') {
      if ((changed || !plans.length) && !await planDinner()) return;
      if (parsed.intent === 'shopping') { await makeShopping(); return; }
      if(plans.length && await openRecipe(plans[0].id)) { cookingStep = 0; renderCooking(); addMessage(`Let's make ${selectedRecipe.title.toLowerCase()}. ${selectedRecipe.steps[0].instruction}`); } return;
    }
    location.hash = 'tonight'; await planDinner(true);
  } catch(error) { if (epoch === resetVersion) addMessage(error.message); }
}
$('#plan-form').addEventListener('submit',event => { event.preventDefault(); try { const preferences = validatedPreferences({...state.preferences,maxMinutes:Number($('#max-minutes').value),servings:Number($('#servings').value),diet:$('#diet').value}); state.preferences = preferences; save(); planDinner(true); } catch(error) { status(error.message,true); } });
$('#chat-form').addEventListener('submit',event => { event.preventDefault(); command($('#command').value); });
$('#command').addEventListener('keydown',event => { if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); command($('#command').value); } });
$('#add-ingredient').addEventListener('click',()=>openIngredient());
$('#close-ingredient').addEventListener('click',()=>$('#ingredient-dialog').close());
$('#close-recipe').addEventListener('click',()=>$('#recipe-dialog').close());
$('#recipe-dialog').addEventListener('close',()=>{ stopTimer(); cookingStep = null; });
$('#plan-from-pantry').addEventListener('click',()=>{ location.hash = 'tonight'; planDinner(true); });
$('#reset-demo').addEventListener('click',()=>{ if(!confirm('Reset your pantry, preferences, shopping list, and conversation to the demo? This removes your saved Gather changes.')) return; resetVersion++; state = freshState(); selectedRecipe = null; plans = []; cookingStep = null; traces = []; requestId = 0; stopTimer(); $('#recipe-dialog').close(); $('#ingredient-dialog').close(); $('#conversation').innerHTML = initialConversation; $('#command').value = ''; renderTraces(); save(); preferencesToForm(); renderPantry(); renderShopping(); location.hash = 'tonight'; planDinner(); toast('Demo restored.'); });
document.addEventListener('click',async event => {
  const button = event.target.closest('button'); if (!button) return;
  if(button.dataset.recipe) openRecipe(button.dataset.recipe);
  else if(button.dataset.cook) { if(await openRecipe(button.dataset.cook)) { cookingStep = 0; renderCooking(); } }
  else if(button.dataset.prompt) command(button.dataset.prompt);
  else if(button.dataset.edit !== undefined) openIngredient(Number(button.dataset.edit));
  else if(button.dataset.remove !== undefined) { state.pantry.splice(Number(button.dataset.remove),1); save(); renderPantry(); toast('Ingredient removed. Plan dinner to refresh matches.'); }
  else if(button.id === 'clear-avoid') { state.preferences.avoid = []; preferencesToForm(); save(); planDinner(); }
  else if(button.id === 'relax-preferences') { state.preferences = freshState().preferences; preferencesToForm(); save(); planDinner(); }
  else if(button.id === 'start-cooking') { cookingStep = 0; renderCooking(); }
  else if(button.id === 'next-step') { cookingStep++; renderCooking(); }
  else if(button.id === 'previous-step') { if(cookingStep === 0) { stopTimer(); cookingStep = null; renderRecipe(); $('#recipe-dialog-title').tabIndex = -1; $('#recipe-dialog-title').focus(); } else { cookingStep--; renderCooking(); } }
  else if(button.id === 'done-cooking') $('#recipe-dialog').close();
  else if(button.id === 'toggle-timer') toggleTimer();
  else if(button.id === 'reset-timer') { stopTimer(); timerRemaining = selectedRecipe.steps[cookingStep].minutes*60; $('#timer-display').textContent = timerLabel(timerRemaining); $('#toggle-timer').textContent = 'Start timer'; }
  else if(button.id === 'recipe-shopping') makeShopping(selectedRecipe.id);
  else if(button.id === 'build-shopping') makeShopping(plans[0]?.id);
  else if(button.id === 'refresh-shopping') makeShopping(state.shopping.recipeId);
  else if(button.id === 'export-shopping') exportShopping();
});
document.addEventListener('change',event => {
  if (!event.target.dataset.check) return;
  const name = event.target.dataset.check;
  state.checked = state.checked.filter(item=>item !== name);
  if (event.target.checked) state.checked.push(name);
  save(); renderShopping();
  [...document.querySelectorAll('.shopping-item input')].find(input => input.dataset.check === name)?.focus();
});
$('#speak-replies').addEventListener('change',()=>{ if(!$('#speak-replies').checked && 'speechSynthesis' in window) speechSynthesis.cancel(); });
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (Recognition) {
  $('#voice-input').hidden = false; $('#voice-disclosure').hidden = false;
  const recognition = new Recognition(); recognition.lang = 'en-US'; recognition.continuous = false; recognition.interimResults = false; let listening = false;
  $('#voice-input').addEventListener('click',()=>{ if(listening) { recognition.stop(); return; } try { recognition.start(); } catch(error) { toast(`Voice could not start: ${error.message}`); } });
  recognition.onstart = ()=>{ listening = true; $('#voice-input').innerHTML = `${icon('mic')} Stop listening`; $('#voice-input').classList.add('on-air'); };
  recognition.onend = ()=>{ listening = false; $('#voice-input').innerHTML = `${icon('mic')} Use voice`; $('#voice-input').classList.remove('on-air'); };
  recognition.onresult = event => { $('#command').value = event.results[0][0].transcript; toast('Voice captured. Review the text, then send.'); $('#command').focus(); };
  recognition.onerror = event => toast(`Voice unavailable (${event.error}). You can type your request instead.`);
}
if (!('speechSynthesis' in window)) { $('#speak-replies').disabled = true; $('#speak-replies').parentElement.title = 'Spoken replies are unavailable in this browser.'; }
window.addEventListener('hashchange',showView);
preferencesToForm(); renderPantry(); renderShopping(); showView(); planDinner();
