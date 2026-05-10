// lib/auditEngine.ts
// Audit engine — pure functions only, no API calls, no side effects.
// All pricing as of May 2025. Sources in PRICING_DATA.md.

export type ToolEntry = {
  plan: string;
  monthlySpend: number;
  seats: number;
};

export type AuditResult = {
  tool: string;
  currentSpend: number;
  recommendedAction: string;
  savings: number;
  reason: string;
  isOptimal: boolean;
};

export type AuditSummary = {
  results: AuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  showCredex: boolean;      // true if savings > $500/mo
  alreadyOptimal: boolean;  // true if savings < $100/mo
};

// ─── Per-tool audit functions ───────────────────────────────────────────────

function auditCursor(entry: ToolEntry, useCase: string): AuditResult {
  const { plan, monthlySpend, seats } = entry;
  let savings = 0;
  let recommendedAction = "No change needed";
  let reason = "You're on the right plan for your usage.";
  let isOptimal = true;

  // Business plan ($40/seat) is overkill for teams under 3
  if (plan === "Business" && seats < 3) {
    const currentCost = seats * 40;
    const recommendedCost = seats * 20; // Pro plan
    savings = currentCost - recommendedCost;
    recommendedAction = `Downgrade to Cursor Pro ($20/seat)`;
    reason = `Cursor Business adds admin controls and SSO — unnecessary for teams under 3. Pro covers the same AI features.`;
    isOptimal = false;
  }

  // Enterprise is almost always overkill unless >50 seats
  if (plan === "Enterprise" && seats < 50) {
    savings = monthlySpend * 0.4; // rough 40% estimate since enterprise is custom
    recommendedAction = "Downgrade to Cursor Business";
    reason = `Enterprise pricing is negotiated and typically 40%+ above Business. For teams under 50, Business covers all core features.`;
    isOptimal = false;
  }

  return {
    tool: "Cursor",
    currentSpend: monthlySpend || seats * getPlanPrice("cursor", plan),
    recommendedAction,
    savings,
    reason,
    isOptimal,
  };
}

function auditGithubCopilot(entry: ToolEntry, useCase: string): AuditResult {
  const { plan, monthlySpend, seats } = entry;
  let savings = 0;
  let recommendedAction = "No change needed";
  let reason = "You're on the right plan for your usage.";
  let isOptimal = true;

  // If use case is not coding, Copilot may be the wrong tool entirely
  if (useCase !== "Coding" && useCase !== "Mixed") {
    savings = monthlySpend;
    recommendedAction = "Consider cancelling GitHub Copilot";
    reason = `Copilot is purpose-built for coding. For ${useCase.toLowerCase()} use cases, Claude Pro or ChatGPT Plus gives better value.`;
    isOptimal = false;
  }

  // Business ($19/seat) vs Individual ($10/seat) — Individual fine for solo
  if (plan === "Business" && seats === 1) {
    savings = 9; // $19 - $10
    recommendedAction = "Downgrade to GitHub Copilot Individual ($10/mo)";
    reason = `Business adds policy management and audit logs — only needed for teams. Solo developers get identical AI features on Individual.`;
    isOptimal = false;
  }

  // Enterprise ($39/seat) — rarely justified under 20 seats
  if (plan === "Enterprise" && seats < 20) {
    const currentCost = seats * 39;
    const recommendedCost = seats * 19;
    savings = currentCost - recommendedCost;
    recommendedAction = `Downgrade to GitHub Copilot Business ($19/seat)`;
    reason = `Enterprise adds SAML SSO and custom policies. For teams under 20, Business covers all AI coding features at half the cost.`;
    isOptimal = false;
  }

  return {
    tool: "GitHub Copilot",
    currentSpend: monthlySpend || seats * getPlanPrice("github_copilot", plan),
    recommendedAction,
    savings,
    reason,
    isOptimal,
  };
}

function auditClaude(entry: ToolEntry, useCase: string, teamSize: number): AuditResult {
  const { plan, monthlySpend, seats } = entry;
  let savings = 0;
  let recommendedAction = "No change needed";
  let reason = "You're on the right plan for your usage.";
  let isOptimal = true;

  // Team plan requires min 5 seats ($30/seat) — overkill for small teams
  if (plan === "Team" && seats < 5) {
    const currentCost = seats * 30;
    const recommendedCost = seats * 20; // Pro per person
    savings = currentCost - recommendedCost;
    recommendedAction = `Switch each user to Claude Pro ($20/user/mo)`;
    reason = `Claude Team requires a 5-seat minimum but charges per seat. For teams under 5, individual Pro plans cost less with the same capability.`;
    isOptimal = false;
  }

  // Max plan ($100/mo) — only justified for very heavy power users
  if (plan === "Max" && useCase !== "Coding" && useCase !== "Research") {
    savings = 80; // Max vs Pro = $100 - $20
    recommendedAction = "Downgrade to Claude Pro ($20/mo)";
    reason = `Claude Max is designed for users hitting Pro's limits daily. For ${useCase.toLowerCase()} workflows, Pro's limits are rarely reached.`;
    isOptimal = false;
  }

  // API Direct — if low usage, a flat plan may be cheaper
  if (plan === "API Direct" && monthlySpend < 20) {
    savings = 0; // API is pay-as-you-go, low spend is fine
    reason = "API direct at low usage is the most cost-efficient option.";
    isOptimal = true;
  }

  return {
    tool: "Claude",
    currentSpend: monthlySpend || seats * getPlanPrice("claude", plan),
    recommendedAction,
    savings,
    reason,
    isOptimal,
  };
}

function auditChatGPT(entry: ToolEntry, useCase: string): AuditResult {
  const { plan, monthlySpend, seats } = entry;
  let savings = 0;
  let recommendedAction = "No change needed";
  let reason = "You're on the right plan for your usage.";
  let isOptimal = true;

  // Team ($30/seat, min 2) vs Plus ($20/seat) for solo users
  if (plan === "Team" && seats === 1) {
    savings = 10;
    recommendedAction = "Downgrade to ChatGPT Plus ($20/mo)";
    reason = `ChatGPT Team adds collaborative workspaces and admin controls. Solo users get identical model access on Plus at $10/mo less.`;
    isOptimal = false;
  }

  // If use case is coding, ChatGPT is often redundant with Cursor/Copilot
  if (
    (plan === "Plus" || plan === "Team") &&
    useCase === "Coding"
  ) {
    savings = monthlySpend * 0.5;
    recommendedAction = "Consider consolidating: Cursor already includes GPT-4 class models";
    reason = `For coding-focused teams, Cursor Pro includes similar model access. Running both creates redundant spend — audit if both are actively used.`;
    isOptimal = false;
  }

  return {
    tool: "ChatGPT",
    currentSpend: monthlySpend || seats * getPlanPrice("chatgpt", plan),
    recommendedAction,
    savings,
    reason,
    isOptimal,
  };
}

function auditAnthropicAPI(entry: ToolEntry): AuditResult {
  const { monthlySpend } = entry;
  let savings = 0;
  let recommendedAction = "No change needed";
  let reason = "API direct spend looks reasonable.";
  let isOptimal = true;

  // High API spend — suggest checking model selection
  if (monthlySpend > 200) {
    savings = monthlySpend * 0.35;
    recommendedAction = "Audit model selection — switch heavy tasks to claude-haiku-3-5";
    reason = `At $${monthlySpend}/mo, model selection matters. Claude Haiku is ~20x cheaper than Sonnet for tasks that don't need top capability (summarisation, classification, extraction).`;
    isOptimal = false;
  }

  return {
    tool: "Anthropic API",
    currentSpend: monthlySpend,
    recommendedAction,
    savings,
    reason,
    isOptimal,
  };
}

function auditOpenAIAPI(entry: ToolEntry): AuditResult {
  const { monthlySpend } = entry;
  let savings = 0;
  let recommendedAction = "No change needed";
  let reason = "API direct spend looks reasonable.";
  let isOptimal = true;

  if (monthlySpend > 200) {
    savings = monthlySpend * 0.3;
    recommendedAction = "Audit model selection — use gpt-4o-mini for lighter tasks";
    reason = `GPT-4o-mini is ~15x cheaper than GPT-4o. For tasks like summarisation, extraction, or classification, it performs comparably.`;
    isOptimal = false;
  }

  // High OpenAI spend — suggest Anthropic as alternative
  if (monthlySpend > 500) {
    savings = monthlySpend * 0.4;
    recommendedAction = "Benchmark Anthropic API — often 30–40% cheaper for equivalent output";
    reason = `At this spend level, a provider benchmark is worth running. Anthropic's Claude Haiku and Sonnet often outperform GPT-4o-mini on quality/cost for text tasks.`;
    isOptimal = false;
  }

  return {
    tool: "OpenAI API",
    currentSpend: monthlySpend,
    recommendedAction,
    savings,
    reason,
    isOptimal,
  };
}

function auditGemini(entry: ToolEntry, useCase: string): AuditResult {
  const { plan, monthlySpend, seats } = entry;
  let savings = 0;
  let recommendedAction = "No change needed";
  let reason = "You're on the right plan for your usage.";
  let isOptimal = true;

  // Ultra ($300/mo) is rarely justified vs Claude Max or ChatGPT Enterprise
  if (plan === "Ultra") {
    savings = 200;
    recommendedAction = "Compare with Claude Max ($100/mo) or ChatGPT Plus ($20/mo)";
    reason = `Gemini Ultra at $300/mo is the most expensive consumer AI plan. Claude Max and ChatGPT Plus offer comparable capability at 60–90% lower cost depending on use case.`;
    isOptimal = false;
  }

  return {
    tool: "Gemini",
    currentSpend: monthlySpend || getPlanPrice("gemini", plan),
    recommendedAction,
    savings,
    reason,
    isOptimal,
  };
}

function auditWindsurf(entry: ToolEntry, useCase: string): AuditResult {
  const { plan, monthlySpend, seats } = entry;
  let savings = 0;
  let recommendedAction = "No change needed";
  let reason = "You're on the right plan for your usage.";
  let isOptimal = true;

  // If not coding, Windsurf is wrong tool entirely
  if (useCase !== "Coding" && useCase !== "Mixed") {
    savings = monthlySpend;
    recommendedAction = "Cancel Windsurf — wrong tool for your use case";
    reason = `Windsurf is a coding-only IDE. For ${useCase.toLowerCase()} workflows, Claude Pro or ChatGPT Plus is far more appropriate.`;
    isOptimal = false;
  }

  // Team plan ($35/seat) vs Pro ($15/seat) for small teams
  if (plan === "Team" && seats < 3) {
    const currentCost = seats * 35;
    const recommendedCost = seats * 15;
    savings = currentCost - recommendedCost;
    recommendedAction = `Switch to Windsurf Pro ($15/seat) — saves $${savings}/mo`;
    reason = `Windsurf Team adds SSO and centralised billing. For teams under 3, Pro gives identical AI features at less than half the price.`;
    isOptimal = false;
  }

  return {
    tool: "Windsurf",
    currentSpend: monthlySpend || seats * getPlanPrice("windsurf", plan),
    recommendedAction,
    savings,
    reason,
    isOptimal,
  };
}

// ─── Helper: fallback plan prices ───────────────────────────────────────────
// Used when user didn't enter a monthly spend manually.
// Update these numbers from PRICING_DATA.md after your research.

function getPlanPrice(toolId: string, plan: string): number {
  const prices: Record<string, Record<string, number>> = {
    cursor: { Hobby: 0, Pro: 20, Business: 40, Enterprise: 100 },
    github_copilot: { Individual: 10, Business: 19, Enterprise: 39 },
    claude: { Free: 0, Pro: 20, Max: 100, Team: 30, Enterprise: 60, "API Direct": 0 },
    chatgpt: { Plus: 20, Team: 30, Enterprise: 60, "API Direct": 0 },
    gemini: { Pro: 20, Ultra: 300, API: 0 },
    windsurf: { Free: 0, Pro: 15, Team: 35 },
  };
  return prices[toolId]?.[plan] ?? 0;
}

// ─── Main export: run the full audit ────────────────────────────────────────

export function runAudit(
  tools: Record<string, { enabled: boolean; plan: string; monthlySpend: string; seats: string }>,
  teamSize: string,
  useCase: string
): AuditSummary {
  const results: AuditResult[] = [];
  const size = parseInt(teamSize) || 1;

  const normalize = (entry: { plan: string; monthlySpend: string; seats: string }): ToolEntry => ({
    plan: entry.plan,
    monthlySpend: parseFloat(entry.monthlySpend) || 0,
    seats: parseInt(entry.seats) || 1,
  });

  if (tools.cursor?.enabled)
    results.push(auditCursor(normalize(tools.cursor), useCase));

  if (tools.github_copilot?.enabled)
    results.push(auditGithubCopilot(normalize(tools.github_copilot), useCase));

  if (tools.claude?.enabled)
    results.push(auditClaude(normalize(tools.claude), useCase, size));

  if (tools.chatgpt?.enabled)
    results.push(auditChatGPT(normalize(tools.chatgpt), useCase));

  if (tools.anthropic_api?.enabled)
    results.push(auditAnthropicAPI(normalize(tools.anthropic_api)));

  if (tools.openai_api?.enabled)
    results.push(auditOpenAIAPI(normalize(tools.openai_api)));

  if (tools.gemini?.enabled)
    results.push(auditGemini(normalize(tools.gemini), useCase));

  if (tools.windsurf?.enabled)
    results.push(auditWindsurf(normalize(tools.windsurf), useCase));

  const totalMonthlySavings = results.reduce((sum, r) => sum + r.savings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    results,
    totalMonthlySavings,
    totalAnnualSavings,
    showCredex: totalMonthlySavings > 500,
    alreadyOptimal: totalMonthlySavings < 100,
  };
}