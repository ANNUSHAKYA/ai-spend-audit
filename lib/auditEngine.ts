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

function auditCursor(entry: ToolEntry): AuditResult {
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
        reason = `Cursor Business ($40/seat) adds SSO and centralised billing — only valuable at 5+ seats. At ${seats} seat${seats === 1 ? "" : "s"}, Pro ($20/seat) delivers identical AI features, saving $${savings}/mo with zero capability loss.`;
        isOptimal = false;
    }

    // Enterprise is almost always overkill unless >50 seats
    if (plan === "Enterprise" && seats < 50) {
        savings = monthlySpend * 0.4; // rough 40% estimate since enterprise is custom
        recommendedAction = "Downgrade to Cursor Business";
        reason = `Cursor Enterprise is custom-negotiated and typically runs 40%+ above Business. For ${seats} seats, Business ($40/seat) covers all core AI features — estimated saving $${Math.round(savings)}/mo.`;
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
        reason = `GitHub Copilot is purpose-built for coding IDEs. For ${useCase.toLowerCase()} workflows it has no relevant features — you're paying $${monthlySpend}/mo for a tool your team won't open. Claude Pro ($20/mo) or ChatGPT Plus ($20/mo) are far better fits.`;
        isOptimal = false;
    }

    // Business ($19/seat) vs Individual ($10/seat) — Individual fine for solo
    if (plan === "Business" && seats === 1) {
        savings = 9; // $19 - $10
        recommendedAction = "Downgrade to GitHub Copilot Individual ($10/mo)";
        reason = `GitHub Copilot Business ($19/seat) adds audit logs and policy controls — only meaningful for compliance-focused teams of 10+. Individual ($10/seat) provides identical code completion and chat for solo developers, saving $9/mo per seat.`;
        isOptimal = false;
    }

    // Enterprise ($39/seat) — rarely justified under 20 seats
    if (plan === "Enterprise" && seats < 20) {
        const currentCost = seats * 39;
        const recommendedCost = seats * 19;
        savings = currentCost - recommendedCost;
        recommendedAction = `Downgrade to GitHub Copilot Business ($19/seat)`;
        reason = `Copilot Enterprise ($39/seat) adds custom SAML SSO, knowledge bases, and GitHub.com Copilot Chat — only worth it at 20+ seats. For ${seats} seats, Business ($19/seat) has identical AI features, saving $${savings}/mo.`;
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

function auditClaude(entry: ToolEntry, useCase: string): AuditResult {
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
        reason = `Claude Team ($30/seat, 5-seat minimum) is designed for collaboration features your team size doesn't need yet. ${seats} individual Pro plans ($20/seat) deliver the same model access at $${savings}/mo less — upgrade to Team when you hit 8+ seats.`;
        isOptimal = false;
    }

    // Max plan ($100/mo) — only justified for very heavy power users
    if (plan === "Max" && useCase !== "Coding" && useCase !== "Research") {
        savings = 80; // Max vs Pro = $100 - $20
        recommendedAction = "Downgrade to Claude Pro ($20/mo)";
        reason = `Claude Max ($100/mo) unlocks 5x more usage than Pro and is designed for users who hit Pro's daily limits. For ${useCase.toLowerCase()} workflows, Pro's limits are rarely reached — downgrading saves $80/mo with no practical impact.`;
        isOptimal = false;
    }

    // API Direct — if low usage, a flat plan may be cheaper
    if (plan === "API Direct" && monthlySpend < 20) {
        savings = 0; // API is pay-as-you-go, low spend is fine
        reason = `At $${monthlySpend}/mo, pay-as-you-go API is the correct model for your usage level. A flat Pro plan ($20/mo) would only make sense above that threshold.`;
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
        reason = `ChatGPT Team ($30/seat) adds shared workspaces and admin controls — irrelevant for a single user. ChatGPT Plus ($20/mo) gives identical GPT-4o access, saving $10/mo immediately.`;
        isOptimal = false;
    }

    // If use case is coding, ChatGPT is often redundant with Cursor/Copilot
    if (
        (plan === "Plus" || plan === "Team") &&
        useCase === "Coding"
    ) {
        savings = monthlySpend * 0.5;
        recommendedAction = "Consider consolidating: Cursor already includes GPT-4 class models";
        reason = `For coding-focused teams, Cursor Pro already bundles GPT-4 class model access. Paying $${monthlySpend}/mo for ChatGPT on top is likely redundant unless your team actively uses both for different tasks — audit usage logs before renewing.`;
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
        reason = `At $${monthlySpend}/mo, model routing is your highest-leverage cost lever. Claude Haiku 3.5 costs ~20x less than Sonnet per token and matches Sonnet on tasks like summarisation, classification, and extraction. Routing just 50% of calls to Haiku could save ~$${Math.round(savings)}/mo.`;
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
        reason = `GPT-4o-mini costs ~15x less per token than GPT-4o and matches it on tasks like summarisation, extraction, and classification. At $${monthlySpend}/mo, routing even 40% of calls to gpt-4o-mini could save ~$${Math.round(savings)}/mo without meaningful quality loss.`;
        isOptimal = false;
    }

    // High OpenAI spend — suggest Anthropic as alternative
    if (monthlySpend > 500) {
        savings = monthlySpend * 0.4;
        recommendedAction = "Benchmark Anthropic API — often 30–40% cheaper for equivalent output";
        reason = `At $${monthlySpend}/mo, a provider benchmark is worth running. Anthropic Claude Haiku 3.5 and Sonnet frequently outperform GPT-4o-mini on quality-per-dollar for text tasks. A 30-day parallel test has produced 30–40% cost reductions for similar workloads.`;
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

function auditGemini(entry: ToolEntry): AuditResult {
    const { plan, monthlySpend } = entry;
    let savings = 0;
    let recommendedAction = "No change needed";
    let reason = "You're on the right plan for your usage.";
    let isOptimal = true;

    // Ultra ($300/mo) is rarely justified vs Claude Max or ChatGPT Enterprise
    if (plan === "Ultra") {
        savings = 200;
        recommendedAction = "Compare with Claude Max ($100/mo) or ChatGPT Plus ($20/mo)";
        reason = `Gemini Ultra at $300/mo is the most expensive consumer AI subscription available. Claude Max ($100/mo) and ChatGPT Plus ($20/mo) offer comparable capability for most workflows — you could save $200/mo switching to Claude Max or $280/mo switching to ChatGPT Plus.`;
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
        reason = `Windsurf is an AI coding IDE — it only delivers value inside a code editor. For ${useCase.toLowerCase()} workflows, you're paying $${monthlySpend}/mo for a tool that doesn't fit the job. Cancel and redirect that budget to Claude Pro or ChatGPT Plus.`;
        isOptimal = false;
    }

    // Team plan ($35/seat) vs Pro ($15/seat) for small teams
    if (plan === "Team" && seats < 3) {
        const currentCost = seats * 35;
        const recommendedCost = seats * 15;
        savings = currentCost - recommendedCost;
        recommendedAction = `Switch to Windsurf Pro ($15/seat) — saves $${savings}/mo`;
        reason = `Windsurf Team ($35/seat) adds SSO and centralised billing — governance features only worth paying for at 5+ seats. At ${seats} seats, Pro ($15/seat) gives identical AI completions and model access, saving $${savings}/mo.`;
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
    // const size = parseInt(teamSize) || 1; // Removed as unused

    const normalize = (entry: { plan: string; monthlySpend: string; seats: string }): ToolEntry => ({
        plan: entry.plan,
        monthlySpend: parseFloat(entry.monthlySpend) || 0,
        seats: parseInt(entry.seats) || 1,
    });

    if (tools.cursor?.enabled)
        results.push(auditCursor(normalize(tools.cursor)));

    if (tools.github_copilot?.enabled)
        results.push(auditGithubCopilot(normalize(tools.github_copilot), useCase));

    if (tools.claude?.enabled)
        results.push(auditClaude(normalize(tools.claude), useCase));

    if (tools.chatgpt?.enabled)
        results.push(auditChatGPT(normalize(tools.chatgpt), useCase));

    if (tools.anthropic_api?.enabled)
        results.push(auditAnthropicAPI(normalize(tools.anthropic_api)));

    if (tools.openai_api?.enabled)
        results.push(auditOpenAIAPI(normalize(tools.openai_api)));

    if (tools.gemini?.enabled)
        results.push(auditGemini(normalize(tools.gemini)));

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