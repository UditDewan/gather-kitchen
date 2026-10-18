# Gather: submission draft

**Track:** Alexa+, simulated-experience path with a working MCP server
**Mini challenges:** None claimed
**Tagline:** A little less food waste. A lot less "what's for dinner?"

## What it does

Gather helps a household turn its pantry into a realistic dinner plan. Tell it how much time you have and how many people are eating. It recommends meals from six original recipes, prioritizes ingredients marked to use soon, and explains what is already available. Adjust the plan, open scaled cooking instructions, or create a list of missing ingredients without starting over.

The intended user is someone standing in their kitchen at the end of the day, trying to make a small decision with the ingredients they already own. Gather brings pantry context, dinner selection, cooking guidance, and shopping preparation into one conversation.

## How it works

The web app simulates an Alexa+ style conversational experience. A deterministic parser translates supported English commands into recipe, time, servings, and diet actions. It does not call an external language model.

Planning, recipe retrieval, and shopping-list requests go through a real MCP server using the official TypeScript SDK 1.32.1, MCP version 2025-11-25, and Streamable HTTP. Three tools expose shared pure domain functions: `gather_plan_dinner`, `gather_get_recipe`, and `gather_shopping_list`. The browser stores household state locally and sends the relevant context with each request; the server has no shared household database.

Pantry coverage and use-soon preferences rank the recipes. Time, vegetarian/vegan choices, and supported ingredient exclusions filter candidates. Recipe quantities scale to the selected number of servings. Input validation, bounded requests, and local host/origin checks define the server boundary.

## What makes it useful

The experience carries a single household decision from "what can I make?" to "what do I need?" to "what comes next?" It preserves context when the number of diners changes and keeps the result inspectable through recipe cards, ingredient lists, and cooking steps. Its small original recipe catalog makes the demonstration repeatable without account setup or external service availability.

## Scope and honest boundaries

This is an Alexa+ experience simulation, not an installed Alexa skill, approved integration, or connection to a real Alexa device. The MCP tools are implemented locally. No AWS service is used, and no AWS or Open Source mini-challenge eligibility is claimed.

Ingredient matching checks presence rather than remaining quantities. Exclusion filters are not an allergy guarantee. Use-soon indicators are user preferences, not food-safety assessments. The six-recipe catalog and deterministic command vocabulary are deliberately limited. There is no live grocery ordering, cloud account, or cross-device sync.

## New work

Gather was created for this hackathon during the submission window. The work includes the original recipe catalog and illustration, browser interface and state, command parser, three MCP tools, local HTTP server, tests, and submission materials. Record the actual repository history with the entry; do not describe any deployment, invitation, or upload as completed until verified.

## Submission links

- **Private repository:** [UditDewan/gather-kitchen](https://github.com/UditDewan/gather-kitchen). Created, pushed, and verified PRIVATE on October 17, 2026.
- **Public demo video:** PENDING. Record the [demo script](DEMO-SCRIPT.md), upload to YouTube or Vimeo, and insert its public URL.
- **Product feedback:** [FEEDBACK.md](FEEDBACK.md).
- **Run instructions:** [README.md](../README.md).
- **License:** [MIT](../LICENSE) for original material; dependencies retain their own licenses.

## Before submitting

Deadline: **October 23, 2026 at 3:00 p.m. EDT**.

- [ ] Confirm individual eligibility and join the hackathon using the entrant's account.
- [x] Verify the private GitHub repository URL, committed source, lockfile, assets, license, and setup instructions.
- [x] Run `npm ci`, `npm test`, `npm run check`, and the core browser demo. Results: 23 tests passed; see [VALIDATION.md](VALIDATION.md). Repeat if the source changes before submission.
- [ ] Record and publish an English demo shorter than three minutes on YouTube or Vimeo. Show the working simulation and clearly label its scope. Use original or licensed audiovisual material.
- [ ] At submission time, share the private repository with the reviewers required by the current rules: `chris-trag`, `knmeiss`, `giolaq`, `anishamalde`, `mosesroth`, and `emersonsklar`; satisfy the separate `testing@devpost.com` access requirement. Verify access and invitation status. Invitations expire after seven days.
- [ ] Paste the project description, tool feedback, primary track, verified repository URL, and video URL into Devpost.
- [ ] Recheck the current official rules, then submit through the entrant's account.

This checklist is preparation, not confirmation that the entry has been submitted or that reviewer invitations have been sent.

## Sources checked October 15, 2026

- [Official event and submission requirements](https://amazonappdev2026.devpost.com/)
- [Official rules, including the simulation exemption](https://amazonappdev2026.devpost.com/rules)
- [Track resources](https://amazonappdev2026.devpost.com/resources)
- [MCP SDK v1.x](https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x)
- [MCP Streamable HTTP specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
