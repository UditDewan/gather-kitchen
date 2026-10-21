# Product feedback

This draft describes the implementation and documentation actually used. Add only observations reproduced during final testing. It does not claim experience with Alexa+ developer access, devices, or an AWS account.

## Official MCP TypeScript SDK 1.32.1

**Use:** Define three validated tools and serve them over Streamable HTTP with JSON responses. The browser uses the same tools for planning, recipe details, and shopping preparation.

**What worked well:** The SDK exposes `McpServer`, tool registration, and a Streamable HTTP transport, allowing the application to keep meal logic separate from protocol handling. Structured tool results fit the recipe cards and ingredient lists without requiring free-form response parsing.

**Onboarding:** Implementation followed the v1.x API and pinned the package version to 1.32.1. Using the versioned v1.x documentation kept its imports and examples aligned with the installed package. This is a documentation-navigation observation, not a claimed SDK runtime failure.

**Needs work / proposed suggestion:** Make the package-major version especially prominent beside setup snippets and transport examples. A minimal browser-to-local-server example that demonstrates initialization, notifications, structured results, and origin checks would shorten this type of prototype's setup.

**Would use again:** Yes, for exposing focused application capabilities to MCP clients. Before a production integration, add authenticated access and test the actual target client.

## MCP protocol documentation

**Use:** Implement protocol version 2025-11-25 over Streamable HTTP, including the POST request lifecycle and supported GET behavior.

**What worked well:** The transport specification distinguishes JSON responses from SSE streams and explicitly defines origin validation and local binding guidance. This supports a small local server without inventing a custom protocol.

**Needs work / proposed suggestion:** A concise compatibility table beside the transport quickstart would help developers choose the correct SDK generation and understand which examples target each protocol version.

**Onboarding:** Read the versioned transport specification and the official SDK's v1 source/docs. Actual local protocol checks are recorded in [VALIDATION.md](VALIDATION.md), separately from browser and device coverage.

**Would use again:** Yes. The tool boundary keeps browser presentation and recipe behavior separate while making the same functions available to another client.

## Node.js

**Use:** Node's built-in HTTP server serves the local application; its test runner covers browser state, domain behavior, and MCP integration.

**What worked well:** The application can share plain JavaScript domain functions between browser and server. The built-in test runner runs the project's checks without adding a separate test framework.

**Needs work / proposed suggestion:** No specific defect in these tools is claimed. Gather's own parser vocabulary and ingredient-quantity limitations need improvement before broader use.

**Observed local integration issue:** Initial HTTP checks encountered invalid chunk framing. A minimal reproduction without the MCP SDK also exhibited the framing problem, so it was not attributed to an Amazon or MCP SDK defect. The implementation now bridges the SDK's Web Standard transport to Node HTTP and writes the response body with `res.write(...)` before `res.end()`, which produced valid chunked responses in local integration checks. The endpoint is `/rpc`; changing the path alone did not resolve the issue.

**Onboarding:** Node 22 or later and `npm ci` are the documented prerequisites. No cloud credentials or external model setup are part of this implementation.

**Would use again:** Yes, for a small local application with explicit input boundaries.

## Zod 3.25.76

**Use:** Define the MCP input boundary for ingredient names, supported diets, cooking time, recipe IDs, and servings.

**What worked well:** Schemas live beside the tool definitions and reject unsupported input before meal logic runs. Boundary tests verify invalid servings and malformed requests through the actual MCP client.

**Onboarding:** Installed from the lockfile alongside the official MCP SDK; the existing plain JavaScript functions could keep their own domain checks.

**Needs work / proposed suggestion:** No package defect was observed. Keeping UI validation, Zod schemas, and domain limits consistent is an application maintenance task; examples showing that separation would be useful.

**Would use again:** Yes, for readable validation at a tool or HTTP boundary.

## Browser storage and optional speech APIs

**Use:** `localStorage` saves the pantry, preferences, shopping snapshot, and checked ingredients. Optional speech recognition fills the command input, and optional speech synthesis reads replies aloud.

**What worked well:** Storage preserved household state across reloads during the browser walkthrough. The app validates restored data and explains failed storage writes. Typed commands make the complete demo independent of audio support.

**Onboarding:** These browser APIs require no application API key. Storage is tied to the browser origin; speech support and permissions depend on the browser and its provider.

**Needs work / proposed suggestion:** The browser-state tests exposed malformed shopping records that could stop startup; Gather now rejects those records while keeping a valid pantry. This was an application bug, not a storage API defect. Microphone recognition and spoken playback have not been tested, so no audio quality or reliability claim is made.

**Would use again:** Yes for local prototype storage. Evaluate speech on the intended browser before recommending the optional voice controls.

## Image-generation tool

**Use:** Generate six original illustrative recipe images during development. The packaged PNGs are local assets; the app does not call an image-generation service at runtime.

**What worked well:** Shared prompts produced a consistent overhead food-photo treatment for the recipe cards and detail sheets. Desktop and mobile browser checks confirmed that the images loaded and remained usable when cropped.

**Onboarding:** Generated through the development environment's built-in image tool; the entrant needs no image-service account or key to run Gather. The [source record](IMAGE-CREDITS.md) includes the prompts and file mapping.

**Needs work / proposed suggestion:** Generated food images require inspection against recipe text and cannot establish exact portions or nutrition. Recipe quantities remain the source of truth.

**Would use again:** Yes for clearly documented illustrative assets, with visual review before packaging.

## Alexa+, AWS, and hackathon feedback

**Alexa+:** Built the self-hosted MCP-server deliverable and demonstrated its tools through an Alexa-style browser simulation. No Alexa SDK, device integration, production API, certification, or preview onboarding was used or tested. Actual Alexa response quality, microphone handling, and device interaction remain unevaluated.

**AWS:** No runtime AWS services or Kiro Crew usage are claimed. No AWS Builder mini-challenge entry is claimed.

**Hackathon documentation:** The rules allow a self-hosted MCP server using protocol version 2025-11-25 or later over Streamable HTTP and require access for judges through the code repository and demo video. They separately describe a simulated-experience alternative. Gather implements the MCP route's runtime technology directly, and its browser demo makes the interaction reproducible without implying access to the Alexa+ service or ownership of Amazon hardware.

**Proposed feature request, important:** Provide a public conformance walkthrough for moving a simulated experience to a real Alexa+ integration, including supported MCP features, authentication, and a device-testing checklist. This is a request, not a report of a missing capability verified inside a private preview.

## Friction-log status

No scored friction log is claimed. The version-navigation observation above is documented, but no unobserved Amazon onboarding failure, SDK error, or performance result has been invented. If a reproducible issue occurs, record the attempted task, exact steps, expected and actual outcomes, severity, workaround, and suggested improvement before including it in the entry.

## References

- [Official SDK and branch/version guidance](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP 2025-11-25 transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- [Hackathon rules](https://amazonappdev2026.devpost.com/rules)
