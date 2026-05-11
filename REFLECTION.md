# REFLECTION.md

## 1. The hardest bug you hit this week

Write about one specific bug. Follow this structure:
- What was the symptom (what did you see on screen?)
- What hypotheses did you form?
- What did you try?
- What actually fixed it?

Example structure to fill in with your real experience:
"On Day 3, after wiring the form to /api/audit, 
the redirect was working locally but on Vercel the 
results page showed a blank screen. My first hypothesis 
was that the Supabase environment variables weren't 
set on Vercel — I checked and they were. My second 
hypothesis was that the Row Level Security policy was 
blocking anon reads. I opened the Supabase SQL editor 
and ran a manual SELECT — it returned nothing despite 
rows existing. I then checked the RLS policies and 
found the select policy was missing the `to anon` 
clause. Adding that fixed it immediately."

Write your actual bug here — whatever was hardest 
this week. The CI lint errors, the Supabase 403, 
the localStorage setState warning — pick the one 
that took you longest to solve and describe it 
exactly like above.

---

## 2. A decision you reversed mid-week

Think about something you planned to do one way 
but changed. Examples from this project:

- Started saving audit results in localStorage, 
  then switched to Supabase when you realised 
  localStorage doesn't work for shareable URLs
- Planned to use Jest but switched to Vitest
- Originally put the lead capture form before 
  the results, then moved it after (the assignment 
  required value shown before email capture)

Write what you decided, what made you reverse it, 
and what you learned from the reversal.

---

## 3. What you would build in week 2

Be specific. Good answers include:
- PDF export of the audit report (jsPDF or 
  Puppeteer to screenshot the results page)
- Benchmark mode: "Your AI spend per developer 
  is $X — companies your size average $Y"
- A simple admin dashboard showing all audits 
  and leads (for Credex's sales team)
- Embeddable widget — a <script> tag a blogger 
  could drop into their site
- Referral codes — share the tool, both parties 
  get a discount on Credex credits
- Automated weekly email to leads when pricing 
  changes affect their stack

Pick 3–4 and explain why each one matters for 
the business, not just the product.

---

## 4. How you used AI tools

Be honest and specific. The assignment says they 
can tell when a codebase is one-shot generated.

Structure:
- Which tools you used (Claude, Cursor, ChatGPT etc.)
- What tasks you used them for
- What you didn't trust them with
- One specific time the AI was wrong and you caught it

Example:
"I used Claude heavily for boilerplate — the 
Supabase client setup, the Resend email template, 
and the CI yml file. I used it to explain the 
correct React pattern for lazy localStorage 
initialisation when it flagged the setState-in-effect 
lint error.

I did NOT use AI for the audit engine logic — the 
per-tool rules and savings calculations I wrote 
myself because the reasoning had to be defensible 
to a finance person, and AI-generated rules tend 
to be vague.

One time AI was wrong: Claude suggested using 
`useEffect` with an empty dependency array to load 
localStorage on mount. This caused the lint error 
`react-hooks/set-state-in-effect`. The correct 
pattern was a lazy useState initialiser — I caught 
this because the CI failed and I had to research 
the actual React docs to understand why."

---

## 5. Self-ratings

Rate yourself 1–10 on each with one honest sentence:

**Discipline:** X/10
Reason: ...

**Code quality:** X/10
Reason: ...

**Design sense:** X/10
Reason: ...

**Problem-solving:** X/10
Reason: ...

**Entrepreneurial thinking:** X/10
Reason: ...