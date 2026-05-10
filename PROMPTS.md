# PROMPTS.md

## AI Audit Summary Prompt

### The prompt used in production (`/app/api/summary/route.ts`):

The prompt instructs Claude to act as a concise financial advisor specialising in AI infrastructure. It passes:
- Team size and use case
- Total monthly and annual savings identified
- Per-tool breakdown with current spend, savings opportunity, and recommended action

It asks for an 80-100 word second-person paragraph with one concrete next step. Bullet points are explicitly forbidden.

### Why I wrote it this way:
- **Second person** ("Your biggest opportunity...") makes it feel personalised, not generic
- **Specific numbers** in the prompt ensure the output contains the user's actual figures
- **"Direct, slightly urgent but not salesy"** tone avoids making it feel like an ad
- **80-100 word limit** keeps it scannable — this sits above a detailed breakdown

### What I tried that didn't work:
- First attempt had no word limit — output was 300 words, too long for a summary card
- First attempt didn't specify "no bullet points" — Claude returned a bulleted list by default
- Tried "friendly" as a tone descriptor — output felt patronising, switched to "direct"

### Fallback behaviour:
If the Anthropic API fails (timeout, quota, network error), the route returns a
templated string built from the audit data. The page never shows an error to the user.