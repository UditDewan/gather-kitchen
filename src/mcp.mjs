import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { planDinner, getRecipe, buildShoppingList } from '../public/domain.mjs';

const ingredients = z.array(z.string().trim().min(1).max(80)).max(100);
const servings = z.number().int().min(1).max(12).default(2);
const recipeId = z.string().min(1).max(80).describe('Recipe ID returned by gather_plan_dinner.');
const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

export function createMcpServer() {
  const server = new McpServer({ name: 'gather-mcp-server', version: '1.0.0' });
  const register = (name, title, description, inputSchema, handler) => {
    server.registerTool(name, { title, description, inputSchema, annotations }, async args => {
      try {
        const data = handler(args);
        return { content: [{ type: 'text', text: JSON.stringify(data) }], structuredContent: data };
      } catch (error) {
        return { isError: true, content: [{ type: 'text', text: error.message }] };
      }
    });
  };
  register('gather_plan_dinner', 'Plan dinner from your pantry',
    'Find up to three recipes within a time limit and diet, ranked by pantry coverage and use-soon ingredients. Exclusions are ingredient filters, not an allergy guarantee. Pantry matching checks presence, not quantity. Returns an empty list when constraints cannot be met.',
    {
      pantry: ingredients.describe('Names of ingredients available at home.'),
      useSoon: ingredients.default([]).describe('Available ingredients the person wants to use first; not a food safety assessment.'),
      maxMinutes: z.number().int().min(5).max(120).default(30),
      servings,
      diet: z.enum(['any', 'vegetarian', 'vegan']).default('any'),
      avoid: ingredients.default([]).describe('Ingredient names to exclude.')
    }, planDinner);
  register('gather_get_recipe', 'Get a scaled recipe and cooking steps',
    'Get an original recipe by ID with quantities scaled to 1-12 servings and ordered cooking steps. Use the ID from gather_plan_dinner.',
    { recipeId, servings }, getRecipe);
  register('gather_shopping_list', 'Find ingredients to buy',
    'Return missing ingredients and scaled quantities for a recipe, plus ingredients already present. This does not place an order or verify remaining pantry quantities.',
    { recipeId, servings, pantry: ingredients }, buildShoppingList);
  return server;
}
