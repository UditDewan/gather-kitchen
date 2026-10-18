# Food image source record

The six recipe images were created for Gather on October 17, 2026 using the built-in image-generation tool. They are original illustrative food images, not photos copied from Crouton or another recipe publisher. No remote image service is used when running the app. The original generated PNG files were copied into `public/images/` without content edits.

## Files and prompts

The chickpea image used this prompt:

> Create one square photorealistic editorial food photograph for a recipe manager app. Overhead view of a cream ceramic bowl of golden cumin-roasted chickpeas, fluffy cooked rice and wilted spinach, drizzled with white lemon Greek yogurt sauce, a small lemon wedge at the edge. Inviting realistic home-cooked food, soft daylight from upper left, pale warm stone tabletop, subtle linen corner. Food fills most of frame and remains recognizable when cropped to landscape or portrait. Rich natural colors, crisp food texture, understated styling. No text, no branding, no people, no extra dishes or ingredients.

Saved as [lemon-chickpea-bowl.png](../public/images/lemon-chickpea-bowl.png).

The other five prompts used this common frame, replacing `{subject}` with the text in the table:

> Create one square photorealistic editorial food photograph for a recipe manager app: {subject}. Overhead view, inviting realistic home-cooked food, soft daylight from upper left, pale warm stone tabletop with a subtle linen corner. Food fills most of the frame and is recognizable cropped to landscape or portrait. Rich natural colors, crisp texture, understated styling. No text, no branding, no people, no extra dishes or ingredients.

| File | Subject |
| --- | --- |
| [pantry-pasta.png](../public/images/pantry-pasta.png) | a wide white ceramic bowl of spaghetti in silky red crushed tomato sauce with wilted spinach and thin garlic slices. Vegan, no cheese, no basil |
| [black-bean-tacos.png](../public/images/black-bean-tacos.png) | three rustic small corn tortillas filled with warm smoky black beans and finely shredded cabbage, lime wedges on a cream ceramic plate. Vegan, no cream or cheese |
| [fried-rice.png](../public/images/fried-rice.png) | a cream ceramic bowl of golden fried rice with green peas, small diced carrots and soft yellow scrambled egg, subtle grated ginger and soy sauce seasoning |
| [lentil-soup.png](../public/images/lentil-soup.png) | a cream ceramic bowl of thick golden red lentil soup with diced cooked carrots, onion and cumin, a lemon wedge beside the bowl. Vegan, no cream or bread |
| [tomato-toast.png](../public/images/tomato-toast.png) | two generous slices of toasted rustic bread spread with creamy mashed white beans and juicy chopped ripe red tomatoes, dressed with olive oil and lemon, on a cream ceramic plate. Vegan, no cheese, no herbs |

Recipe text and ingredient quantities are the source of truth. The images illustrate the dishes; they do not establish exact portions, dietary certification, or nutrition values.
