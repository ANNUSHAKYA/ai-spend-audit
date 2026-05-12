# AI Spend Audit

Free instant audit of your AI tool spend. Built for 
startup founders and engineering managers who suspect 
they're overpaying for Cursor, Claude, ChatGPT, or 
GitHub Copilot — but haven't done the math yet.

**Live URL:** https://ai-spend-audit-sigma.vercel.app/

---

## Screenshots

[Embed 3 screenshots here]

To add screenshots:
1. Take them from your live Vercel URL
2. Drag them into a GitHub issue to get an image URL
3. Paste the URL here as: https://ai-spend-audit-sigma.vercel.app/

Screenshot 1: The spend input form
Screenshot 2: Audit results page with savings hero number
Screenshot 3: Lead capture form / email confirmation

<img width="1440" height="900" alt="Image" src="https://github.com/user-attachments/assets/0efa8356-c602-40ff-b2e1-36d41f8ab2fd" />

<img width="1440" height="900" alt="Image" src="https://github.com/user-attachments/assets/36223d7e-aaf8-4a7a-b92c-9a7102fcab00" />

<img width="1440" height="900" alt="Image" src="https://github.com/user-attachments/assets/a454bc99-ec08-41f9-8c23-d76019571038" />



---

## Quick Start

### Run locally
```bash
git clone https://github.com/ANNUSHAKYA/ai-spend-audit
cd ai-spend-audit
npm install
cp .env.example .env.local
# Fill in your keys in .env.local
npm run dev
```

Open http://localhost:3000

### Environment variables needed
NEXT_PUBLIC_SUPABASE_URL=https://dkggxkhxytnxfmpastmq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_1TZaPARy44Gb7zNsTXc5Kw_3jEUMwPj
ANTHROPIC_API_KEY=your-anthropic-api-key-here
RESEND_API_KEY=re_XB6LbSKE_Mt6htQ4cm9fx6qNYWPfxib7V
NEXT_PUBLIC_APP_URL=https://ai-spend-audit-sigma.vercel.app

### Run tests
```bash
npm test
```

### Deploy
Push to main — Vercel auto-deploys.

---

## Decisions

**1. Next.js App Router over Pages Router**
Server components let the audit result page fetch 
data on the server — faster initial load, better SEO, 
and Open Graph tags that actually work for sharing.

**2. Hardcoded rules for audit logic, not AI**
The audit engine uses deterministic TypeScript rules, 
not an LLM. A finance person reading the savings 
reasoning needs to agree with it — AI-generated 
explanations are often vague or wrong on specifics. 
The AI is used only for the personalised summary 
paragraph where fluency matters more than precision.

**3. Supabase over Firebase**
Supabase gives a real Postgres database with Row Level 
Security. The leads table needs to be write-only from 
the public side — RLS policies enforce this in one SQL 
statement. Firebase would require more custom rules.

**4. Email captured after results, never before**
The assignment required this, but it's also just 
correct product thinking. Gating value behind email 
kills conversion. Show the audit first, then offer 
to send it — users who've already seen savings are 
far more likely to give their email.

**5. Vitest over Jest**
Vitest is native to the Vite ecosystem, faster, and 
requires zero configuration for TypeScript. Jest needs 
a babel transform setup for ESM imports. For a 
Next.js + TypeScript project, Vitest is the right call.