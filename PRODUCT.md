# Gather product brief

Gather helps home cooks choose dinner from ingredients they already have, inspect a scaled recipe, make a missing-ingredient shopping list, and follow cooking steps with a timer.

The primary surface is a local browser app for desktop and mobile. It is an Alexa+ experience simulator backed by three real MCP tools. A deterministic parser supports a small set of typed commands. The catalog contains six recipes. Pantry matching checks ingredient presence; the app does not track consumption or verify available quantities.

The core journey is Tonight → recipe → shopping or cooking. My pantry supports adding, editing, and removing ingredients. Preferences, pantry entries, shopping snapshots, and checks persist in browser storage. Existing saved data and tool contracts must survive visual changes.

The October 17, 2026 brief is a UI redesign using Crouton Recipe Manager as the visual reference. The accepted direction is a compact, light recipe app with prominent food photography, rounded controls, clear ingredient lists, and an unobtrusive conversation panel. See [DESIGN.md](DESIGN.md).

Keep the existing HTML/CSS/ES-module stack and Node server. No new framework, account system, recipe importing, weekly calendar, grocery ordering, cloud synchronization, or live Alexa integration is part of this redesign. Success means the redesigned screens work at desktop and mobile sizes while preserving the current dinner workflow.
