# Gather demo script

**Target length:** about 2 minutes 30 seconds. Keep the final recording under 3 minutes.  
**Format:** screen recording with English narration. Type the commands so the demonstration does not depend on microphone support.

## Before recording

1. Run `npm ci`, `npm test`, `npm run check`, then `npm start`. Open http://127.0.0.1:4173.
2. Click **Reset demo**, then open **My pantry**. Remove **Greek yogurt**. Leave the other eight default ingredients available. This creates one visible missing ingredient without changing the recipe recommendation.
3. Use a fresh conversation. Set two servings and no ingredient exclusions. Keep the browser large enough to show the recipe cards and conversation.
4. Browser rehearsal of the two-to-four-serving plan and shopping flow was completed on **October 16, 2026**: the top meal is **Lemon chickpea bowls**, and the four-serving shopping list contains **1 cup Greek yogurt**. Rehearse the narration and timing before recording; see [VALIDATION.md](VALIDATION.md) for the checked scope.
5. Record original footage and narration. Do not add copyrighted music, third-party logos, or footage without permission. Keep account details and unrelated tabs outside the recording.

## 0:00-0:18 | Show the kitchen dashboard

**Say:**

"This is Gather, a pantry-first dinner companion. It helps answer a small but daily question: what can I make with what I already have? This is a simulated Alexa+ experience, with a real MCP server behind the browser."

## 0:18-0:45 | Plan dinner

**Type:** `Plan a vegetarian dinner for two in 20 minutes`

**Show:** the top recommendation, Lemon chickpea bowls, with its time, servings, vegetarian label, and pantry-coverage percentage.

**Say:**

"I've stocked a sample pantry and marked the ingredients I want to use soon. I ask for a vegetarian dinner for two in twenty minutes. Gather checks the time and diet constraints, then ranks recipes by pantry coverage and ingredients to use first. The lemon chickpea bowls are the best match."

## 0:45-1:08 | Change the number of diners

**Type:** `Make it for four`

**Show:** the updated serving count on the recommendation card. The next section shows a scaled ingredient quantity in the shopping list.

**Say:**

"Now two friends are joining. I can change the plan to four servings without entering the pantry again. The meal stays within my existing preferences, and the ingredient quantities scale with the number of people."

## 1:08-1:35 | Create the shopping list

**Type:** `Make a shopping list`

**Show:** the missing ingredient: 1 cup Greek yogurt.

**Say:**

"I removed yogurt from the pantry before this demo. Gather puts only that missing ingredient on the list, with the quantity needed for four people. It matches ingredient presence, so I still need to check that I have enough of the ingredients already at home. Nothing is ordered or purchased."

## 1:35-2:02 | Start cooking

**Type:** `Start cooking`. Once the cooking dialog opens, click its **Next step** button.

**Show:** the first and second cooking steps. Optionally click **Start timer**, then **Pause timer**. The dialog is modal, so use its controls while it is open; the conversation input behind it is unavailable.

**Say:**

"When I'm ready, the conversation opens the cooking guide. Each step is short and ordered, and I can move between steps or start a timer. The recipe is a small, original, inspectable set of instructions, rather than a generated answer that changes on every run."

## 2:02-2:30 | Show the implementation and close

**Show:** close the cooking dialog using **Close recipe**, then open **MCP tool activity** below the conversation and inspect a successful tool request and response.

**Say:**

"Planning, recipe details, and shopping lists call three real tools through MCP version 2025-11-25 over Streamable HTTP. Household state stays in this browser. The demo uses six recipes and a deterministic command parser, with no external model, AWS service, or live Alexa connection. Gather brings the dinner decision, the missing ingredients, and the next cooking step into one place."

## After recording

Trim pauses and verify the entire video stays under three minutes. Upload it as a public English video on YouTube or Vimeo. Check playback while signed out and copy the working URL into [SUBMISSION.md](SUBMISSION.md) and the Devpost form. Recording, upload, and submission are not completed by this script.
