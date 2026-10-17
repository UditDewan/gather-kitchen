export const defaultPantry = [
  { name: 'chickpeas', quantity: 1, unit: 'can (15 oz)', daysLeft: 120 },
  { name: 'cooked rice', quantity: 2, unit: 'cups', daysLeft: 2 },
  { name: 'spinach', quantity: 3, unit: 'cups', daysLeft: 2 },
  { name: 'lemon', quantity: 1, unit: 'whole', daysLeft: 3 },
  { name: 'Greek yogurt', quantity: 0.5, unit: 'cup', daysLeft: 5 },
  { name: 'olive oil', quantity: 1, unit: 'bottle', daysLeft: 90 },
  { name: 'cumin', quantity: 1, unit: 'jar', daysLeft: 180 },
  { name: 'salt', quantity: 1, unit: 'jar', daysLeft: 365 },
  { name: 'black beans', quantity: 1, unit: 'can (15 oz)', daysLeft: 120 },
];

export const recipes = [
  {
    id: 'lemon-chickpea-bowl', title: 'Lemon chickpea bowls',
    description: 'Crisp chickpeas, warm greens, and a bright lemon yogurt drizzle. A fresh start for the rice in your fridge.',
    minutes: 20, servings: 2, tags: ['vegetarian', 'use-it-up', 'one-pan'], color: '#d9a352',
    ingredients: [
      { name: 'chickpeas', quantity: 1, unit: 'can (15 oz)' },
      { name: 'cooked rice', quantity: 2, unit: 'cups' },
      { name: 'spinach', quantity: 3, unit: 'cups' },
      { name: 'lemon', quantity: 1, unit: 'whole' },
      { name: 'Greek yogurt', quantity: 0.5, unit: 'cup' },
      { name: 'olive oil', quantity: 1, unit: 'tbsp' },
      { name: 'cumin', quantity: 1, unit: 'tsp' },
      { name: 'salt', quantity: 0.25, unit: 'tsp' },
    ],
    steps: [
      { title: 'Prep the bright bits', instruction: 'Drain, rinse, and pat the chickpeas dry. Wash the spinach and lemon. Zest the lemon, then cut it in half.', minutes: 4 },
      { title: 'Get the chickpeas golden', instruction: 'Heat the olive oil in a skillet over medium heat. Add chickpeas, cumin, and half the salt. Cook for 7 minutes, stirring occasionally, until warm and lightly crisp.', minutes: 7 },
      { title: 'Warm the rice and greens', instruction: 'Add the cooked rice, spinach, and a splash of water to the skillet. Cover and heat, stirring occasionally, until the spinach wilts and the rice is steaming hot throughout. Use properly refrigerated cooked rice; discard rice if storage is uncertain.', minutes: 5 },
      { title: 'Drizzle and gather', instruction: 'Mix the yogurt with lemon zest, lemon juice to taste, the remaining salt, and a splash of water. Divide the skillet mixture between bowls and spoon the sauce over the top.', minutes: 4 },
    ],
  },
  {
    id: 'pantry-pasta', title: 'One-pan tomato pasta',
    description: 'A cozy tangle of pasta with silky tomatoes and spinach, cooked together in one roomy pan.',
    minutes: 25, servings: 2, tags: ['vegan', 'vegetarian', 'one-pan'], color: '#c86146',
    ingredients: [
      { name: 'dried pasta', quantity: 6, unit: 'oz' },
      { name: 'crushed tomatoes', quantity: 1, unit: 'can (14 oz)' },
      { name: 'spinach', quantity: 2, unit: 'cups' },
      { name: 'garlic', quantity: 2, unit: 'cloves' },
      { name: 'olive oil', quantity: 1, unit: 'tbsp' },
      { name: 'salt', quantity: 0.25, unit: 'tsp' },
    ],
    steps: [
      { title: 'Start with garlic', instruction: 'Peel and thinly slice the garlic. Wash the spinach. Warm the olive oil in a wide, deep pan over medium heat and cook the garlic gently for 1 minute.', minutes: 4 },
      { title: 'Make a one-pan simmer', instruction: 'Add the tomatoes, dried pasta, salt, and enough water to just cover the pasta. Bring to a simmer. Cook uncovered, stirring often, until the pasta is tender, about 12–16 minutes. Add small splashes of water if it starts to stick.', minutes: 17 },
      { title: 'Fold in the greens', instruction: 'Stir in the spinach until wilted. Let the sauce settle for a minute, taste, and divide between bowls. Choose egg-free pasta for a vegan meal.', minutes: 4 },
    ],
  },
  {
    id: 'black-bean-tacos', title: 'Smoky black bean tacos',
    description: 'Creamy spiced beans, crunchy cabbage, and a squeeze of lime. A weeknight taco table in 20 minutes.',
    minutes: 20, servings: 2, tags: ['vegan', 'vegetarian', 'quick'], color: '#b57a42',
    ingredients: [
      { name: 'black beans', quantity: 1, unit: 'can (15 oz)' },
      { name: 'corn tortillas', quantity: 6, unit: 'small' },
      { name: 'cabbage', quantity: 2, unit: 'cups, shredded' },
      { name: 'lime', quantity: 1, unit: 'whole' },
      { name: 'cumin', quantity: 1, unit: 'tsp' },
      { name: 'smoked paprika', quantity: 0.5, unit: 'tsp' },
      { name: 'olive oil', quantity: 1, unit: 'tbsp' },
      { name: 'salt', quantity: 0.25, unit: 'tsp' },
    ],
    steps: [
      { title: 'Make a quick slaw', instruction: 'Wash the cabbage and lime. Shred the cabbage if needed. Toss it with half the lime juice and half the salt. Drain and rinse the beans.', minutes: 5 },
      { title: 'Warm the smoky beans', instruction: 'Heat the oil in a skillet over medium heat. Add the beans, cumin, smoked paprika, remaining salt, and a splash of water. Simmer until hot, mashing a few beans to thicken the mixture.', minutes: 8 },
      { title: 'Warm the tortillas', instruction: 'Warm the tortillas in a dry pan, about 30 seconds per side, working in batches. Keep them wrapped in a clean towel until ready to serve.', minutes: 4 },
      { title: 'Build your tacos', instruction: 'Divide beans and slaw among the tortillas. Squeeze the remaining lime over the top and bring the tacos to the table.', minutes: 3 },
    ],
  },
  {
    id: 'fried-rice', title: 'Ginger garden fried rice',
    description: 'A quick skillet of ginger-scented rice, sweet peas, and soft scrambled eggs.',
    minutes: 15, servings: 2, tags: ['vegetarian', 'quick', 'use-it-up'], color: '#a8af72',
    ingredients: [
      { name: 'cooked rice', quantity: 2, unit: 'cups' },
      { name: 'eggs', quantity: 2, unit: 'large' },
      { name: 'frozen peas', quantity: 1, unit: 'cup' },
      { name: 'carrot', quantity: 1, unit: 'medium' },
      { name: 'ginger', quantity: 1, unit: 'tbsp, grated' },
      { name: 'soy sauce', quantity: 1, unit: 'tbsp' },
      { name: 'olive oil', quantity: 1, unit: 'tbsp' },
    ],
    steps: [
      { title: 'Ready the skillet', instruction: 'Wash and finely dice the carrot. Peel and grate the ginger. Beat the eggs in a bowl. Heat the oil in a large skillet over medium-high heat.', minutes: 4 },
      { title: 'Cook the vegetables', instruction: 'Add the carrot and stir-fry for 3 minutes. Add the ginger and peas and cook for another minute.', minutes: 4 },
      { title: 'Scramble, then stir-fry', instruction: 'Push the vegetables aside, add the eggs, and scramble until fully set. Stir in the cooked rice and soy sauce. Stir-fry until steaming hot throughout, breaking up any clumps. Use properly refrigerated cooked rice; discard rice if storage is uncertain.', minutes: 6 },
      { title: 'Serve while hot', instruction: 'Divide between bowls and serve immediately.', minutes: 1 },
    ],
  },
  {
    id: 'lentil-soup', title: 'Golden lentil soup',
    description: 'Red lentils turn tender with carrots, cumin, and lemon for a comforting pot with a sunny finish.',
    minutes: 35, servings: 2, tags: ['vegan', 'vegetarian', 'one-pot'], color: '#d2a248',
    ingredients: [
      { name: 'red lentils', quantity: 0.75, unit: 'cup, dry' },
      { name: 'carrot', quantity: 2, unit: 'medium' },
      { name: 'onion', quantity: 1, unit: 'small' },
      { name: 'garlic', quantity: 2, unit: 'cloves' },
      { name: 'vegetable broth', quantity: 3, unit: 'cups' },
      { name: 'cumin', quantity: 1, unit: 'tsp' },
      { name: 'lemon', quantity: 0.5, unit: 'whole' },
      { name: 'olive oil', quantity: 1, unit: 'tbsp' },
    ],
    steps: [
      { title: 'Chop and rinse', instruction: 'Wash and dice the carrots. Peel and dice the onion; mince the garlic. Rinse the lentils in a fine sieve and check for debris.', minutes: 6 },
      { title: 'Build a fragrant base', instruction: 'Warm the oil in a pot over medium heat. Add the onion and carrots and cook for 5 minutes. Stir in the garlic and cumin for 1 minute.', minutes: 6 },
      { title: 'Simmer until tender', instruction: 'Add the lentils and broth. Bring to a simmer, partially cover, and cook for about 20 minutes, stirring occasionally, until the lentils and carrots are tender. Add water if the soup becomes too thick.', minutes: 21 },
      { title: 'Finish with lemon', instruction: 'Squeeze the lemon into the soup a little at a time, tasting as you go. Ladle into bowls.', minutes: 2 },
    ],
  },
  {
    id: 'tomato-toast', title: 'Tomato & white bean toast',
    description: 'Juicy tomatoes and lemony mashed beans on crisp toast. A small effort with a very good payoff.',
    minutes: 10, servings: 2, tags: ['vegan', 'vegetarian', 'quick'], color: '#cf785e',
    ingredients: [
      { name: 'bread', quantity: 4, unit: 'slices' },
      { name: 'white beans', quantity: 1, unit: 'can (15 oz)' },
      { name: 'tomato', quantity: 2, unit: 'medium' },
      { name: 'lemon', quantity: 0.5, unit: 'whole' },
      { name: 'olive oil', quantity: 1, unit: 'tbsp' },
      { name: 'salt', quantity: 0.25, unit: 'tsp' },
    ],
    steps: [
      { title: 'Mash the beans', instruction: 'Drain and rinse the beans. Mash with the olive oil, half the salt, and lemon juice to taste, leaving some texture.', minutes: 3 },
      { title: 'Toast and chop', instruction: 'Toast the bread until crisp. Meanwhile, wash and chop the tomatoes and toss with the remaining salt. Choose bread made without milk, eggs, or honey for a vegan meal.', minutes: 4 },
      { title: 'Pile it high', instruction: 'Spread the beans over the warm toast, add the tomatoes, and serve right away.', minutes: 3 },
    ],
  },
];

const aliases = {
  'garbanzo bean': 'chickpeas', 'garbanzo beans': 'chickpeas', 'chickpea': 'chickpeas', 'canned chickpeas': 'chickpeas',
  'leftover rice': 'cooked rice', 'cooked white rice': 'cooked rice', 'cooked brown rice': 'cooked rice',
  'baby spinach': 'spinach', 'fresh spinach': 'spinach', 'lemons': 'lemon', 'limes': 'lime',
  'yogurt': 'greek yogurt', 'plain yogurt': 'greek yogurt', 'greek yoghurt': 'greek yogurt', 'yoghurt': 'greek yogurt',
  'extra virgin olive oil': 'olive oil', 'ground cumin': 'cumin', 'table salt': 'salt', 'sea salt': 'salt',
  'black bean': 'black beans', 'canned black beans': 'black beans', 'pasta': 'dried pasta', 'dry pasta': 'dried pasta',
  'canned crushed tomatoes': 'crushed tomatoes', 'garlic cloves': 'garlic', 'egg': 'eggs', 'carrots': 'carrot',
  'fresh ginger': 'ginger', 'red lentil': 'red lentils', 'onions': 'onion', 'vegetable stock': 'vegetable broth',
  'veggie broth': 'vegetable broth', 'white bean': 'white beans', 'cannellini beans': 'white beans',
  'canned white beans': 'white beans', 'tomatoes': 'tomato', 'sourdough': 'bread',
};

const exclusionGroups = {
  dairy: ['greek yogurt'], milk: ['greek yogurt'], lactose: ['greek yogurt'],
  egg: ['eggs'], eggs: ['eggs'], soy: ['soy sauce'], soya: ['soy sauce'],
  wheat: ['dried pasta', 'bread', 'soy sauce'], gluten: ['dried pasta', 'bread', 'soy sauce'],
  rice: ['cooked rice'], beans: ['chickpeas', 'black beans', 'white beans'],
  legumes: ['chickpeas', 'black beans', 'white beans', 'red lentils', 'frozen peas', 'soy sauce'],
  tomato: ['tomato', 'crushed tomatoes'], peas: ['frozen peas'], corn: ['corn tortillas'],
};

function normalize(value) {
  const name = value.trim().toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ');
  return Object.hasOwn(aliases, name) ? aliases[name] : name;
}

function ingredientNames(value, label) {
  if (!Array.isArray(value) || value.length > 100 || value.some(name => typeof name !== 'string' || !name.trim() || name.length > 80)) {
    throw new Error(`${label} must be an array of up to 100 non-empty ingredient names (80 characters each).`);
  }
  return [...new Set(value.map(normalize))];
}

function validateServings(servings) {
  if (!Number.isInteger(servings) || servings < 1 || servings > 12) throw new Error('Servings must be a whole number from 1 to 12.');
}

function validateObject(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Provide a dinner request as an object.');
}

export function getRecipe(input = {}) {
  validateObject(input);
  const { recipeId, servings = 2 } = input;
  validateServings(servings);
  const recipe = recipes.find(item => item.id === recipeId);
  if (!recipe) throw new Error('Choose a valid recipe ID from the dinner recommendations.');
  return {
    ...recipe, servings,
    tags: [...recipe.tags],
    ingredients: recipe.ingredients.map(item => ({ ...item, quantity: Number((item.quantity * servings / recipe.servings).toFixed(3)) })),
    steps: recipe.steps.map(step => ({ ...step })),
  };
}

export function planDinner(input = {}) {
  validateObject(input);
  const { pantry = [], useSoon = [], maxMinutes = 30, servings = 2, diet = 'any', avoid = [] } = input;
  validateServings(servings);
  if (!Number.isInteger(maxMinutes) || maxMinutes < 1 || maxMinutes > 180) throw new Error('Cooking time must be a whole number from 1 to 180 minutes.');
  if (!['any', 'vegetarian', 'vegan'].includes(diet)) throw new Error('Diet must be any, vegetarian, or vegan.');
  const pantryNames = ingredientNames(pantry, 'Pantry');
  const soonNames = ingredientNames(useSoon, 'Use-soon ingredients').filter(name => pantryNames.includes(name));
  const avoidNames = ingredientNames(avoid, 'Avoid');
  const exclusions = new Set(avoidNames.flatMap(name => [name, ...(Object.hasOwn(exclusionGroups, name) ? exclusionGroups[name] : [])]));
  const recommendations = recipes
    .filter(recipe => recipe.minutes <= maxMinutes && (diet === 'any' || recipe.tags.includes(diet)))
    .filter(recipe => !recipe.ingredients.some(item => exclusions.has(normalize(item.name))))
    .map(recipe => {
      const scaled = getRecipe({ recipeId: recipe.id, servings });
      const matchedIngredients = scaled.ingredients.filter(item => pantryNames.includes(normalize(item.name))).map(item => item.name);
      const missingIngredients = scaled.ingredients.filter(item => !pantryNames.includes(normalize(item.name)));
      const useSoonIngredients = matchedIngredients.filter(name => soonNames.includes(normalize(name)));
      const coverage = Math.round(matchedIngredients.length / scaled.ingredients.length * 100);
      const score = coverage + useSoonIngredients.length * 12;
      return { ...scaled, coverage, matchedIngredients, missingIngredients, useSoonIngredients, score };
    })
    .sort((a, b) => b.score - a.score || a.minutes - b.minutes || a.id.localeCompare(b.id))
    .slice(0, 3);
  return { recommendations, constraints: { pantry: pantryNames, useSoon: soonNames, maxMinutes, servings, diet, avoid: avoidNames } };
}

export function buildShoppingList(input = {}) {
  validateObject(input);
  const { recipeId, servings = 2, pantry = [] } = input;
  const recipe = getRecipe({ recipeId, servings });
  const pantryNames = ingredientNames(pantry, 'Pantry');
  return {
    items: recipe.ingredients.filter(item => !pantryNames.includes(normalize(item.name))),
    available: recipe.ingredients.filter(item => pantryNames.includes(normalize(item.name))),
    note: 'Pantry matches are by ingredient, not remaining quantity.',
  };
}

// shortcut: command parsing covers a small English vocabulary; use Alexa intents for production voice input.
export function parseCommand(text) {
  if (typeof text !== 'string' || text.length > 1000) throw new Error('Enter a command of up to 1,000 characters.');
  const command = text.trim().toLowerCase();
  const constraints = {};
  const minutes = command.match(/\b(\d{1,3})\s*(?:minutes?|mins?)\b/);
  if (minutes) constraints.maxMinutes = Number(minutes[1]);
  const numberWords = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
  const servings = command.match(/\b(?:for|serves?|servings?\s*(?:of|:)?|feed)\s+(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b(?!\s*(?:minutes?|mins?)\b)/);
  if (servings) constraints.servings = numberWords[servings[1]] ?? Number(servings[1]);
  if (/\bvegan\b/.test(command)) constraints.diet = 'vegan';
  else if (/\bvegetarian\b/.test(command)) constraints.diet = 'vegetarian';
  else if (/\b(?:any diet|no dietary restrictions)\b/.test(command)) constraints.diet = 'any';
  const exclusion = command.match(/\b(?:without|avoid|no|allergic to)\s+(.+?)(?=\s+(?:for|in|under|within)\s+(?:\d|one\b|two\b|three\b|four\b|five\b|six\b|seven\b|eight\b|nine\b|ten\b|eleven\b|twelve\b)|[.!?;]|$)/);
  if (exclusion && !/^dietary restrictions\b/.test(exclusion[1])) {
    const names = exclusion[1].split(/\s*(?:,|\band\b|&)\s*/).map(name => name.trim()).filter(Boolean);
    if (names.length) constraints.avoid = ingredientNames(names, 'Avoid');
  }
  let intent = 'help';
  if (/\b(?:shopping|grocery|groceries|what.*buy)\b/.test(command)) intent = 'shopping';
  else if (/\b(?:next|continue)\b/.test(command)) intent = 'next';
  else if (/\b(?:repeat|say that again|read again)\b/.test(command)) intent = 'repeat';
  else if (/\b(?:cook|start|recipe|instructions)\b/.test(command)) intent = 'cook';
  else if (/\b(?:plan|dinner|meal|make|eat|suggest|recommend)\b/.test(command) || Object.keys(constraints).length) intent = 'plan';
  return { intent, constraints };
}
