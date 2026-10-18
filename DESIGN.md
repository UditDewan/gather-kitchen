# Gather interface design

## Direction

The October 17, 2026 redesign uses the published recipe-library and recipe-detail screens on [Crouton's official website](https://crouton.app/) as a visual reference. The [App Store listing](https://apps.apple.com/us/app/crouton-recipe-manager/id1461650987) identifies the referenced product. Gather borrows the general language of compact headings, pale surfaces, photo-led recipe cards, pill controls, and clearly grouped ingredients. It retains its own branding, recipes, imagery, and application behavior.

## Visual system

| Element | Decision |
| --- | --- |
| Page | Pale gray `#f4f5f7`; white content surfaces |
| Sidebar | Cool gray `#eef0f3`; blue selected item |
| Text | Charcoal `#22282f`; secondary text `#626b76` |
| Actions | Blue `#0967ad`; pale blue secondary actions |
| Pantry matches | Green `#18775b` on a pale green surface |
| Use-soon estimate | Amber text on pale amber |
| Typography | System rounded/native font stack; compact bold headings |
| Shapes | 12–16 px content corners; pills for controls and short metadata |
| Food | Six distinct local photographs, cropped with `object-fit: cover` |
| Icons | Existing authored SVG symbol set with consistent strokes |
| Motion | Short press/hover feedback and one 180 ms sheet entrance; reduced-motion override |

## Layout and behavior

Desktop keeps navigation on the left, dinner content in the center, and a light conversation panel on the right. The featured recipe places its image beside the description, metadata, pantry match, and cooking actions. Two alternative cards form a photo grid below it.

At narrower widths the conversation follows the main view. On mobile the sidebar becomes four navigation items, preferences become a two-column group, and the featured image sits above its text. The alternative cards remain a two-column grid. Dialog ingredients and method become one column; actions stack where space is limited.

**Find dinner** submits the selected constraints. **View recipe** opens the full recipe. **Cook this** and each card's **Cook** button fetch the selected recipe and start at step one. Existing timer, shopping, pantry, keyboard-focus, and persistence behavior is retained.

## Changes from the earlier interface

| Before | After | Why |
| --- | --- | --- |
| Large serif editorial headlines | Compact, direct page titles | Put recipes and controls closer to the top |
| Cream and forest-green surfaces | Pale gray, white, and blue | Follow the light native-app reference |
| One bowl illustration reused | A distinct image for each recipe | Make meal choices visually recognizable |
| Text-led alternatives | Photo cards with View and Cook actions | Make browsing and starting a recipe clearer |
| Dark conversation block | Light supporting panel | Keep attention on dinner choices |
| Decorative ingredient/method headings | Ingredients and Method | Make recipe details immediately scannable |

The redesign uses no new runtime dependency. Original PNG images are stored locally and the server explicitly allows each path. Images are illustrative, not portion or ingredient-safety evidence. There is no imported Crouton artwork, branding, or code.

See [the app guide](docs/APP-EXPLAINED.md), [image credits](docs/IMAGE-CREDITS.md), and [validation record](docs/VALIDATION.md).
