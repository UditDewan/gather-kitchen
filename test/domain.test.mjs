import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultPantry, recipes, getRecipe, planDinner, buildShoppingList, parseCommand } from '../public/domain.mjs';

const pantry = defaultPantry.map(item => item.name);

test('default pantry ranks the fully covered chickpea bowl first', () => {
  const result = planDinner({ pantry, useSoon: ['spinach', 'lemon', 'cooked rice'] });
  assert.equal(result.recommendations.length, 3);
  assert.equal(result.recommendations[0].id, 'lemon-chickpea-bowl');
  assert.equal(result.recommendations[0].coverage, 100);
  assert.equal(result.recommendations[0].score, 136);
  assert.deepEqual(result.recommendations[0].missingIngredients, []);
});

test('time, vegan, and avoidance constraints are hard filters', () => {
  const result = planDinner({ pantry, maxMinutes: 20, diet: 'vegan', avoid: ['corn'] });
  assert.deepEqual(result.recommendations.map(recipe => recipe.id), ['tomato-toast']);
  assert.deepEqual(planDinner({ maxMinutes: 9 }).recommendations, []);
  assert.ok(planDinner({ maxMinutes: 180, avoid: ['dairy', 'eggs'] }).recommendations.every(recipe => recipe.tags.includes('vegan')));
  assert.ok(planDinner({ maxMinutes: 180, avoid: ['gluten'] }).recommendations.every(recipe => !['pantry-pasta', 'fried-rice', 'tomato-toast'].includes(recipe.id)));
});

test('normalizes whole names and aliases, without substring matches', () => {
  const result = buildShoppingList({ recipeId: 'lemon-chickpea-bowl', pantry: ['  GARBANZO Beans ', 'baby   spinach', 'greek-yoghurt', 'lemon grass', 'uncooked rice'] });
  assert.deepEqual(result.available.map(item => item.name), ['chickpeas', 'spinach', 'Greek yogurt']);
  assert.ok(result.items.some(item => item.name === 'lemon'));
  assert.ok(result.items.some(item => item.name === 'cooked rice'));
  assert.ok(!planDinner({ pantry, maxMinutes: 180, avoid: ['garbanzo beans'] }).recommendations.some(recipe => recipe.id === 'lemon-chickpea-bowl'));
  assert.deepEqual(planDinner({ pantry: ['constructor'], avoid: ['constructor'] }).constraints.pantry, ['constructor']);
});

test('scales recipe quantities without mutating the catalogue', () => {
  const recipe = getRecipe({ recipeId: 'lemon-chickpea-bowl', servings: 3 });
  assert.equal(recipe.servings, 3);
  assert.equal(recipe.ingredients.find(item => item.name === 'Greek yogurt').quantity, 0.75);
  assert.equal(recipe.ingredients.find(item => item.name === 'chickpeas').quantity, 1.5);
  recipe.ingredients[0].quantity = 99;
  recipe.steps[0].instruction = 'changed';
  assert.equal(recipes[0].ingredients[0].quantity, 1);
  assert.notEqual(recipes[0].steps[0].instruction, 'changed');
});

test('shopping list partitions all ingredients and scales missing quantities', () => {
  const result = buildShoppingList({ recipeId: 'black-bean-tacos', servings: 4, pantry: ['canned black beans', 'cumin'] });
  assert.equal(result.items.length + result.available.length, 8);
  assert.equal(result.items.find(item => item.name === 'corn tortillas').quantity, 12);
  assert.equal(result.available.find(item => item.name === 'black beans').quantity, 2);
  assert.match(result.note, /not remaining quantity/);
});

test('use-soon bonus is awarded only for ingredients in the pantry', () => {
  const first = planDinner({ pantry: [], useSoon: ['spinach', 'lemon'], maxMinutes: 180 });
  assert.ok(first.recommendations.every(recipe => recipe.score === 0));
  const second = planDinner({ pantry: ['lemon'], useSoon: ['lemon'], maxMinutes: 180 });
  assert.ok(second.recommendations.every(recipe => recipe.score === recipe.coverage + 12));
});

test('invalid requests produce actionable validation errors', () => {
  assert.throws(() => planDinner(null), /object/);
  assert.throws(() => planDinner({ pantry: 'beans' }), /Pantry.*array/);
  assert.throws(() => planDinner({ pantry: [null] }), /ingredient names/);
  assert.throws(() => planDinner({ maxMinutes: '20' }), /whole number/);
  assert.throws(() => planDinner({ maxMinutes: 0 }), /minutes/);
  assert.throws(() => planDinner({ servings: 1.5 }), /Servings/);
  assert.throws(() => planDinner({ diet: 'keto' }), /Diet/);
  assert.throws(() => planDinner({ avoid: [8] }), /Avoid/);
  assert.throws(() => getRecipe({ recipeId: '__proto__' }), /valid recipe ID/);
  assert.throws(() => buildShoppingList({ recipeId: 'fried-rice', pantry: [''] }), /Pantry/);
});

test('deterministic commands expose only recognized intents and constraints', () => {
  assert.deepEqual(parseCommand('Plan a vegan dinner for three in 20 minutes without dairy and eggs'), {
    intent: 'plan', constraints: { maxMinutes: 20, servings: 3, diet: 'vegan', avoid: ['dairy', 'eggs'] },
  });
  assert.deepEqual(parseCommand('Make a shopping list'), { intent: 'shopping', constraints: {} });
  assert.deepEqual(parseCommand('Start cooking'), { intent: 'cook', constraints: {} });
  assert.deepEqual(parseCommand('Next step'), { intent: 'next', constraints: {} });
  assert.deepEqual(parseCommand('Say that again'), { intent: 'repeat', constraints: {} });
  assert.deepEqual(parseCommand('hello'), { intent: 'help', constraints: {} });
  assert.deepEqual(parseCommand('no dietary restrictions'), { intent: 'plan', constraints: { diet: 'any' } });
  assert.deepEqual(parseCommand('Plan dinner for 20 minutes'), { intent: 'plan', constraints: { maxMinutes: 20 } });
  assert.deepEqual(parseCommand('Plan dinner without dairy for two in 20 minutes'), { intent: 'plan', constraints: { maxMinutes: 20, servings: 2, avoid: ['dairy'] } });
  assert.throws(() => parseCommand({ text: 'hello' }), /command/);
});

test('catalogue has six complete original recipe records', () => {
  assert.equal(recipes.length, 6);
  assert.equal(new Set(recipes.map(recipe => recipe.id)).size, 6);
  for (const recipe of recipes) {
    assert.equal(recipe.servings, 2);
    assert.equal(recipe.steps.reduce((total, step) => total + step.minutes, 0), recipe.minutes);
    assert.ok(recipe.ingredients.length > 0);
    assert.ok(recipe.ingredients.every(item => item.quantity > 0 && item.unit && item.name));
    assert.ok(recipe.steps.every(step => step.title && step.instruction));
  }
});
