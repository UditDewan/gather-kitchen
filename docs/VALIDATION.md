# Validation record

Browser walkthrough completed on **October 16, 2026**; clean dependency installation and automated checks repeated on **October 17, 2026**, using Windows and Node.js **24.16**. These results describe the local project, not an Alexa certification, public deployment, or submitted hackathon entry.

## Automated checks

| Check | Result |
| --- | --- |
| `npm ci` | Passed using the committed dependency lockfile |
| `npm test` | 23 tests passed: 8 browser-state, 9 domain, 6 protocol |
| `npm run check` | Passed JavaScript syntax checks |

Browser-state tests cover malformed saved data, invalid commands, tool errors, overlapping requests, reset behavior, cooking-step keyboard focus, and direct cooking from the selected recipe card. They exercise browser logic with a test harness; they are separate from the interactive browser checks below.

Domain tests cover recipe ranking, time/diet/exclusion filters, ingredient aliases, quantity scaling without catalog mutation, shopping-list partitions, use-soon handling, input validation, command parsing, and the six-recipe catalog.

Protocol tests cover MCP 2025-11-25 initialization, tool discovery and calls through the official client, plan/recipe/shopping behavior, request validation, allowed assets, and hostile Origin/Host handling. The endpoint is `http://127.0.0.1:4173/rpc`.

## Interactive browser checks

The following were exercised in the Codex in-app browser:

| Area | Observed result |
| --- | --- |
| Desktop layout, 1440 x 1000 | Inspected; no horizontal page overflow |
| Mobile layout, 390 x 844 | Inspected; no horizontal page overflow |
| Pantry | Ingredient addition and removal worked |
| Dinner planning | Vegetarian dinner for two in 20 minutes could be revised to four servings |
| Shopping list | Removing Greek yogurt produced a four-serving list with 1 cup Greek yogurt |
| Shopping controls | Checkbox state persisted; list export was exercised |
| Cooking guide | Next-step navigation and step timer controls worked |

The documented two-to-four-serving plan, shopping list, and cooking sequence was rehearsed in one browser session. On mobile, keyboard focus followed the current cooking-step heading; the next step reset the timer from 04:00 to 07:00 as expected.

## October 17 interface redesign checks

After the Crouton-inspired redesign, `npm test` passed all 23 tests and `npm run check` passed. The added regressions cover shopping-checkbox focus retention, the selected-card Cook action and valid image responses for all six recipes while rejecting unknown image paths.

The redesigned UI was inspected in the in-app browser at 1440 x 1000 and 390 x 844. The visible recipe images loaded successfully, and neither size produced horizontal page overflow. The following checks were repeated on the redesigned interface:

- Featured recipe detail, ingredient quantities, and method displayed correctly.
- Cooking started at the first step; timer start/pause and next-step reset worked, with focus on the current step heading.
- A mobile alternative card's Cook action opened its own recipe, Tomato & white bean toast, at “Mash the beans.”
- The mobile recipe dialog had no horizontal overflow and its image loaded.
- Pantry navigation, ingredient editing, and saving worked; the existing values were preserved.
- The saved four-serving shopping list showed 1 cup Greek yogurt. Checking it updated progress to 1 of 1; the original unchecked state was restored.
- Pressing Space on a shopping checkbox retained keyboard focus on that ingredient after the list updated.
- About and Tonight navigation worked, and existing saved preferences/pantry data remained usable.

Export and microphone/audio were not repeated during this visual pass. Export had been exercised in the earlier walkthrough; microphone/audio remain unverified. These are local browser checks, not tests on physical mobile devices.

## Not checked or completed

- Live Alexa+ service, Alexa device interaction, preview access, or certification.
- Browser microphone recognition or audio playback.
- Public hosting, remote authentication, other browser engines, or physical phones.
- Recording or uploading the demo video.
- Devpost submission or reviewer invitations.
- Reviewer access to the private repository.

The supported runtime is declared as Node 22 or later, but the checks recorded here ran on Node 24.16. No broader runtime compatibility claim is implied.

## Repository publication

On October 17, 2026, the source was committed and pushed to [UditDewan/gather-kitchen](https://github.com/UditDewan/gather-kitchen). GitHub reported `PRIVATE` visibility, and the remote main-branch commit matched the local commit. Reviewer invitations and access have not been configured.
