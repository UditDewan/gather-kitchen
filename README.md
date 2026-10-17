# Gather

**A pantry-first dinner companion with a conversational interface and real MCP tools.**

Gather turns the ingredients already at home into a dinner plan, scaled cooking steps, and a short shopping list. It is built for the **Alexa+ simulated-experience track** of the [Build, Ship, Shape hackathon](https://amazonappdev2026.devpost.com/).

The browser experience simulates a conversational kitchen assistant. It is not connected to an Alexa device or the Alexa+ service. Its MCP server is real: the browser calls three tools through MCP JSON-RPC over Streamable HTTP, using protocol version `2025-11-25`.

For a thorough walkthrough of the features, recommendation algorithm, architecture, tool contracts, and limitations, read [Gather: a complete guide to the app](docs/APP-EXPLAINED.md).

## Run locally

Install Node.js **22 or newer**, then run these commands from the project directory:

```sh
npm ci
npm start
```

Open **http://127.0.0.1:4173**. Keep the terminal running. Stop with Ctrl+C. No API keys, paid services, external LLM, or cloud account are required.

```sh
npm test       # Browser-state, domain, and MCP integration checks
npm run check  # JavaScript syntax checks
```

The default port is 4173. Set the `PORT` environment variable to use another port. The server binds to `127.0.0.1` and intentionally rejects nonlocal hosts and cross-origin requests.

## What it does

- Rank six original recipes by ingredient coverage and ingredients marked to use soon.
- Apply preparation-time, servings, vegetarian/vegan, and ingredient-exclusion constraints.
- Scale recipe quantities and show ordered cooking steps.
- Generate a shopping list for ingredients missing from the pantry.
- Keep household choices in the current browser using localStorage.

## How it works

```text
Browser interface + deterministic command parser
                    |
                    | MCP JSON-RPC over HTTP /rpc
                    v
Node HTTP server + official MCP TypeScript SDK 1.32.1
                    |
                    v
Shared pure recipe and planning functions
```

| File | Responsibility |
| --- | --- |
| `public/app.mjs` | Browser state, UI, and MCP client requests |
| `public/domain.mjs` | Original recipe catalog, deterministic parsing, ranking, scaling, and shopping lists |
| `src/mcp.mjs` | Validated MCP tool definitions using the official SDK and Zod |
| `src/server.mjs` | Static files, local HTTP boundary, and Streamable HTTP transport |
| `test/` | Browser-state regressions, domain behavior, and protocol integration checks |

The browser carries the current pantry and preferences with each tool call. The server does not maintain a shared household database or account system. The planning logic is deterministic; it does not generate recipes or interpret arbitrary language through an external model.

### MCP tools

Endpoint: `http://127.0.0.1:4173/rpc`

| Tool | Result |
| --- | --- |
| `gather_plan_dinner` | Up to three matching recipes, ranked using pantry coverage and use-soon ingredients |
| `gather_get_recipe` | A selected recipe with quantities scaled for 1 to 12 servings |
| `gather_shopping_list` | Missing ingredients and their scaled quantities |

The transport is stateless. POST supports MCP initialization, notifications, tool listing, and tool calls. GET returns 405 because this server does not offer a separate server-initiated SSE stream. Integration checks exercise the protocol rather than treating a REST endpoint as MCP.

## Deliberate limits

The catalog contains six recipes. Pantry matching checks whether an ingredient is present, not how much remains. A pantry match therefore does not guarantee enough food for the selected servings. Ingredient exclusions are filters, not an allergy or cross-contamination guarantee. Marking an ingredient to use soon is a preference, not a food-safety assessment.

The conversation parser understands a limited set of commands. This is a working simulation of the interaction, not a general-purpose AI assistant. There is no grocery ordering, live price lookup, real Alexa connection, or AWS integration. Browser storage can be cleared and does not sync across devices. Keep this server local; remote use would require authentication and deployment work.

## Hackathon materials

- [Submission draft and remaining checklist](docs/SUBMISSION.md)
- [Demo recording script](docs/DEMO-SCRIPT.md)
- [Product feedback](docs/FEEDBACK.md)
- [Validation results and untested areas](docs/VALIDATION.md)

Local validation on Windows with Node 24.16 passed `npm ci`, all **20 tests** (6 browser-state, 9 domain, 5 protocol), and `npm run check`. Desktop and mobile layouts and the core meal-planning workflow were inspected in the in-app browser. See the validation record for the scope of those checks.

The [source repository](https://github.com/UditDewan/gather-kitchen) is private, verified October 17, 2026. Reviewer invitations, video upload, and Devpost submission remain separate from running this project. No mini-challenge eligibility is assumed.

## License and sources

Original code, recipe text, and original artwork are provided under the [MIT License](LICENSE). Dependencies retain their own licenses; the project license does not relicense third-party packages.

- [Hackathon rules](https://amazonappdev2026.devpost.com/rules)
- [Hackathon resources](https://amazonappdev2026.devpost.com/resources)
- [MCP TypeScript SDK, v1.x](https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x)
- [MCP 2025-11-25 Streamable HTTP specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
