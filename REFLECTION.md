# REFLECTION.md

## 1. The hardest bug I hit this week

The hardest bug was the 403 Forbidden error on the live
Vercel deployment. Locally everything worked — the form
submitted, the audit saved, the results page loaded. But
on Vercel, the results page showed only "Error: Forbidden."

My first hypothesis was missing environment variables. I
checked Vercel's Settings → Environment Variables and all
three Supabase keys were present. That wasn't it.

My second hypothesis was a Next.js server component issue —
maybe the server-side fetch was being blocked differently
on Vercel vs locally. I added console.log statements to
the API route and checked Vercel's function logs. The
insert was succeeding but the SELECT was returning nothing.

My third hypothesis was Supabase Row Level Security. I
opened the SQL editor and ran a manual SELECT on the
audits table — it returned zero rows despite data existing.
I then inspected the RLS policies and found the select
policy was missing the `to anon` clause. The policy read:

  create policy "Anyone can read audits" on audits
    for select using (true);

It needed to be:

  create policy "Anyone can read audits" on audits
    for select to anon using (true);

Adding `to anon` fixed it immediately. The lesson: RLS
policies without a role clause default to authenticated
users only, not anonymous visitors.

## 2. A decision I reversed mid-week

I originally saved audit results in localStorage and
redirected to /audit/[uuid] reading from there. This
worked locally but I realised on Day 3 that it completely
broke the shareable URL requirement — opening the link
in a new browser or on another device showed nothing
because localStorage is per-browser.

I reversed the decision and moved storage to Supabase.
This required building a real API route (/api/audit),
changing the form submit handler from synchronous to
async, and converting the results page from a client
component to a server component. It added about 2 hours
of work but was the correct call — the shareable URL
is one of the six required MVP features.

The lesson: test the full user journey (including
"send this link to someone else") before considering
a feature done.

## 3. What I would build in week 2

**1. PDF export of the audit report.**
The results page is already well-designed. Adding a
"Download PDF" button using html2canvas + jsPDF would
make it shareable in a format that works in board
meetings and Slack threads without needing a link.

**2. Benchmark mode.**
"Your AI spend per developer is $X — companies your
size average $Y." This requires aggregating anonymised
data from completed audits. After 500+ audits there
would be enough data to make the benchmarks meaningful.
This is the feature that turns the tool from a one-time
audit into something people return to quarterly.

**3. Admin dashboard for Credex.**
A simple internal page (behind auth) showing all leads,
their savings amounts, and email addresses. Sorted by
savings descending so the sales team can prioritise
outreach. Currently this data is in Supabase but only
accessible via the dashboard — a purpose-built view
would save the sales team time.

**4. Automated pricing updates.**
Currently pricing data is hardcoded and manually
verified. A weekly cron job (Vercel Cron or Inngest)
that scrapes official pricing pages and alerts when
numbers change would keep the audit engine accurate
without manual work.

## 4. How I used AI tools

I used Claude extensively throughout the week.

**What I used it for:**
- Boilerplate code: the Supabase client setup, the
  Resend email template HTML, the CI yml file, the
  Vitest config — all generated with Claude and then
  reviewed and adjusted by me
- Debugging: when the setState-in-effect lint error
  appeared, I described it to Claude and it explained
  the lazy useState initialiser pattern and why it
  was the correct fix
- The PROMPTS.md content and email template HTML

**What I did NOT use AI for:**
- The audit engine logic — the per-tool savings rules
  and reasoning strings I wrote myself. The reasoning
  has to be defensible to a finance person. AI-generated
  rules were too vague ("consider switching tools") —
  I needed specific dollar amounts and seat thresholds
- The user interviews — those required real conversations
- The ECONOMICS.md unit economics — the math had to
  reflect my own understanding of the business model

**One time AI was wrong and I caught it:**
Claude suggested using useEffect with an empty
dependency array to load localStorage on mount:

  useEffect(() => {
    const saved = localStorage.getItem("auditForm");
    if (saved) setForm(JSON.parse(saved));
  }, []);

This caused the lint error `react-hooks/set-state-in-effect`
and failed CI. The correct pattern is a lazy useState
initialiser that runs synchronously before first render:

  const [form, setForm] = useState(() => {
    if (typeof window === "undefined") return defaultFormState();
    const saved = localStorage.getItem("auditForm");
    return saved ? JSON.parse(saved) : defaultFormState();
  });

I caught this because CI failed and I had to read the
actual React docs to understand why. Claude's initial
suggestion was common but not correct for this linter.

## 5. Self-ratings

**Discipline: 6/10**
I got all the work done but most commits landed on
two days rather than spread across the week — something
I would do differently if starting again.

**Code quality: 7/10**
The audit engine is clean, typed, and testable. The
API routes are straightforward. I would add more error
boundaries and loading states with more time.

**Design sense: 7/10**
The results page is clean and the hero savings number
is clear. The form is functional but could be more
visually engaging — tool logos would help significantly.

**Problem-solving: 8/10**
Diagnosed and fixed the Supabase RLS bug, the CI lint
errors, and the localStorage pattern issue methodically
by forming hypotheses and testing them.

**Entrepreneurial thinking: 7/10**
The GTM and ECONOMICS files reflect genuine thinking
about the business model. The user interviews changed
one real design decision. Would score higher with more
time to validate assumptions with more users.