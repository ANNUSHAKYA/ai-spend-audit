## Day 1 — 2025-05-08

**Hours worked:** 4

**What I did:** Set up Next.js project with TypeScript and Tailwind. Created GitHub repo and deployed blank app to Vercel. Built the spend input form with all 8 tools.

**What I learned:** ...

**Blockers / what I'm stuck on:** ...

**Plan for tomorrow:** Build the audit engine logic in /lib/auditEngine.ts

## Day 2 — 2025-05-09

**Hours worked:** 5

**What I did:** Researched and documented current pricing for all 8 tools. Built the audit engine in /lib/auditEngine.ts with per-tool rules. Wired the form to run the audit and redirect to a results page. Basic results page showing per-tool breakdown and total savings.

**What I learned:** ...

**Blockers / what I'm stuck on:** ...

**Plan for tomorrow:** Move audit storage to Supabase, build proper results page UI, add shareable URLs with OG tags.

## Day 3 — 2025-05-10

**Hours worked:** 5

**What I did:** Created Supabase project and set up audits + leads tables. Built /api/audit POST route. Updated form to call the API instead of localStorage. Rebuilt results page as a server component with proper OG tags and shareable URLs. Tested full flow locally and on Vercel.

**What I learned:** ...

**Blockers / what I'm stuck on:** ...

**Plan for tomorrow:** Add Anthropic API summary, lead capture form, and transactional email via Resend.

## Day 4 — 2025-05-11

**Hours worked:** 5

**What I did:** Got Anthropic API key and installed SDK. Built /api/summary route with Claude generating personalised 80-100 word summaries. Added skeleton loader for summary on results page. Built /api/leads route saving to Supabase and sending email via Resend. Built lead capture form with honeypot abuse protection. Tested full flow including email delivery.

**What I learned:** ...

**Blockers / what I'm stuck on:** ...

**Plan for tomorrow:** Write tests for audit engine, set up GitHub Actions CI, polish UI for Lighthouse scores.

## Day 5 — 2025-05-12

**Hours worked:** 4

**What I did:** Set up Vitest and wrote 6 tests covering the audit engine — downgrade recommendations, optimal plan detection, Credex threshold, API model optimisation, edge cases, and wrong-tool detection. All pass. Set up GitHub Actions CI — lint and tests run on every push to main, currently green. Ran Lighthouse on live URL and fixed accessibility issues (labels, aria attributes, lang attribute). Scores now above threshold.

**What I learned:** ...

**Blockers / what I'm stuck on:** ...

**Plan for tomorrow:** Write all entrepreneurial files (GTM, ECONOMICS, LANDING_COPY, METRICS) and do 3 real user interviews.

## Day 6 — 2025-05-13

**Hours worked:** 6

**What I did:** Conducted 3 user interviews with real 
people (notes in USER_INTERVIEWS.md). Wrote GTM.md with 
specific channels and 30-day plan. Wrote ECONOMICS.md 
with full unit economics and $1M ARR path. Wrote 
LANDING_COPY.md with headline, FAQ. Wrote METRICS.md 
with North Star and input metrics. Completed 
ARCHITECTURE.md with Mermaid diagram and stack 
justification.

**What I learned:** ...

**Blockers / what I'm stuck on:** ...

**Plan for tomorrow:** Complete REFLECTION.md, README.md, 
DEVLOG Day 7 entry, final end-to-end test, submit.