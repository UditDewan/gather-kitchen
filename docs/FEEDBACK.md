# Product feedback

This draft describes the implementation and documentation actually used. Add only observations reproduced during final testing. It does not claim experience with Alexa+ developer access, devices, or an AWS account.

## Official MCP TypeScript SDK 1.32.1

**Use:** Define three validated tools and serve them over Streamable HTTP with JSON responses. The browser uses the same tools for planning, recipe details, and shopping preparation.

**What worked well:** The SDK exposes `McpServer`, tool registration, and a Streamable HTTP transport, allowing the application to keep meal logic separate from protocol handling. Structured tool results fit the recipe cards and ingredient lists without requiring free-form response parsing.

**Onboarding:** Implementation followed the v1.x API and pinned the package version. The official repository's main branch now documents the split v2 packages, while the installed `@modelcontextprotocol/sdk` package follows v1.x. Matching documentation to the installed major version matters. This is a documentation-navigation observation, not a claimed SDK runtime failure.

**Needs work / proposed suggestion:** Make the package-major version especially prominent beside setup snippets and transport examples. A minimal browser-to-local-server example that demonstrates initialization, notifications, structured results, and origin checks would shorten this type of prototype's setup.

**Would use again:** Yes, for exposing focused application capabilities to MCP clients. Before a production integration, add authenticated access and test the actual target client.

## MCP protocol documentation

**Use:** Implement protocol version 2025-11-25 over Streamable HTTP, including the POST request lifecycle and supported GET behavior.

**What worked well:** The transport specification distinguishes JSON responses from SSE streams and explicitly defines origin validation and local binding guidance. This supports a small local server without inventing a custom protocol.

**Needs work / proposed suggestion:** A concise compatibility table beside the transport quickstart would help developers choose the correct SDK generation and understand which examples target each protocol version.

**Onboarding:** Read the versioned transport specification and the official SDK's v1 source/docs. Actual local protocol checks are recorded in [VALIDATION.md](VALIDATION.md), separately from browser and device coverage.

**Would use again:** Yes. The tool boundary keeps browser presentation and recipe behavior separate while making the same functions available to another client.

## Node.js and Zod

**Use:** Node's built-in HTTP server serves the local application; its test runner covers domain and integration behavior. Zod defines the MCP input boundary for ingredient names, supported diets, time, recipe IDs, and servings.

**What worked well:** The application can share plain JavaScript domain functions between browser and server. Validation lives next to the tool definitions and rejects unsupported input before running meal logic.

**Needs work / proposed suggestion:** No specific defect in these tools is claimed. Gather's own parser vocabulary and ingredient-quantity limitations need improvement before broader use.

**Observed local integration issue:** Initial HTTP checks encountered invalid chunk framing. A minimal reproduction without the MCP SDK also exhibited the framing problem, so it was not attributed to an Amazon or MCP SDK defect. The implementation now bridges the SDK's Web Standard transport to Node HTTP and writes the response body with `res.write(...)` before `res.end()`, which produced valid chunked responses in local integration checks. The endpoint is `/rpc`; changing the path alone did not resolve the issue.

**Onboarding:** Node 22 or later and `npm ci` are the documented prerequisites. No cloud credentials or external model setup are part of this implementation.

**Would use again:** Yes, for a small local application with explicit input boundaries.

## Alexa+, AWS, and hackathon feedback

**Alexa+:** Used the permitted simulated-experience path. No Alexa SDK, device integration, production API, certification, or preview onboarding was used or tested. Actual Alexa response quality, microphone handling, and device interaction remain unevaluated.

**AWS:** No runtime AWS services or Kiro Crew usage are claimed. No AWS Builder mini-challenge entry is claimed.

**Hackathon documentation:** The rules explicitly explain that the simulated path is exempt from the runtime technology hook requirement. That makes a local, reproducible submission possible without implying access to the Alexa+ service.

**Proposed feature request, important:** Provide a public conformance walkthrough for moving a simulated experience to a real Alexa+ integration, including supported MCP features, authentication, and a device-testing checklist. This is a request, not a report of a missing capability verified inside a private preview.

## Friction-log status

No scored friction log is claimed. The version-navigation observation above is documented, but no unobserved Amazon onboarding failure, SDK error, or performance result has been invented. If a reproducible issue occurs, record the attempted task, exact steps, expected and actual outcomes, severity, workaround, and suggested improvement before including it in the entry.

## References

- [Official SDK and branch/version guidance](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP 2025-11-25 transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- [Hackathon rules](https://amazonappdev2026.devpost.com/rules)
