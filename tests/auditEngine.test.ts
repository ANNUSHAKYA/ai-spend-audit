import { describe, it, expect } from "vitest";
import { runAudit } from "../lib/auditEngine";

// Helper — builds a minimal form tools object with one tool enabled
function makeTool(
  toolId: string,
  plan: string,
  monthlySpend: string,
  seats: string
) {
  const tools: Record<
    string,
    { enabled: boolean; plan: string; monthlySpend: string; seats: string }
  > = {
    cursor: { enabled: false, plan: "Pro", monthlySpend: "", seats: "1" },
    github_copilot: { enabled: false, plan: "Individual", monthlySpend: "", seats: "1" },
    claude: { enabled: false, plan: "Pro", monthlySpend: "", seats: "1" },
    chatgpt: { enabled: false, plan: "Plus", monthlySpend: "", seats: "1" },
    anthropic_api: { enabled: false, plan: "Pay as you go", monthlySpend: "", seats: "1" },
    openai_api: { enabled: false, plan: "Pay as you go", monthlySpend: "", seats: "1" },
    gemini: { enabled: false, plan: "Pro", monthlySpend: "", seats: "1" },
    windsurf: { enabled: false, plan: "Pro", monthlySpend: "", seats: "1" },
  };
  tools[toolId] = { enabled: true, plan, monthlySpend, seats };
  return tools;
}

// ─── Test 1 ──────────────────────────────────────────────────────────────────
describe("Test 1 — Solo user on a Team plan gets a downgrade recommendation", () => {
  it("recommends downgrading Cursor Business to Pro for a single user", () => {
    const tools = makeTool("cursor", "Business", "40", "1");
    const result = runAudit(tools, "1", "Coding");

    const cursorResult = result.results.find((r) => r.tool === "Cursor");

    expect(cursorResult).toBeDefined();
    expect(cursorResult!.savings).toBeGreaterThan(0);
    expect(cursorResult!.isOptimal).toBe(false);
    expect(cursorResult!.recommendedAction).toContain("Pro");
  });
});

// ─── Test 2 ──────────────────────────────────────────────────────────────────
describe("Test 2 — User already on optimal plan gets no manufactured savings", () => {
  it("marks GitHub Copilot Individual for a solo coder as optimal", () => {
    const tools = makeTool("github_copilot", "Individual", "10", "1");
    const result = runAudit(tools, "1", "Coding");

    const copilotResult = result.results.find(
      (r) => r.tool === "GitHub Copilot"
    );

    expect(copilotResult).toBeDefined();
    expect(copilotResult!.savings).toBe(0);
    expect(copilotResult!.isOptimal).toBe(true);
  });
});

// ─── Test 3 ──────────────────────────────────────────────────────────────────
describe("Test 3 — High spend triggers Credex CTA flag", () => {
  it("sets showCredex=true when total monthly savings exceed $500", () => {
    // OpenAI API at $2000/mo → audit engine flags 30% savings = $600
    // This alone exceeds the $500 threshold for showCredex
    const tools: Record<
      string,
      { enabled: boolean; plan: string; monthlySpend: string; seats: string }
    > = {
      cursor: { enabled: false, plan: "Pro", monthlySpend: "", seats: "1" },
      github_copilot: { enabled: false, plan: "Individual", monthlySpend: "", seats: "1" },
      claude: { enabled: false, plan: "Pro", monthlySpend: "", seats: "1" },
      chatgpt: { enabled: false, plan: "Plus", monthlySpend: "", seats: "1" },
      anthropic_api: { enabled: false, plan: "Pay as you go", monthlySpend: "", seats: "1" },
      openai_api: { enabled: true, plan: "Pay as you go", monthlySpend: "2000", seats: "1" },
      gemini: { enabled: false, plan: "Pro", monthlySpend: "", seats: "1" },
      windsurf: { enabled: false, plan: "Pro", monthlySpend: "", seats: "1" },
    };

    const result = runAudit(tools, "3", "Mixed");

    expect(result.showCredex).toBe(true);
    expect(result.totalMonthlySavings).toBeGreaterThan(500);
  });
});

// ─── Test 4 ──────────────────────────────────────────────────────────────────
describe("Test 4 — High API usage triggers model optimisation suggestion", () => {
  it("recommends cheaper model for Anthropic API spend over $200/mo", () => {
    const tools = makeTool("anthropic_api", "Pay as you go", "300", "1");
    const result = runAudit(tools, "2", "Coding");

    const apiResult = result.results.find((r) => r.tool === "Anthropic API");

    expect(apiResult).toBeDefined();
    expect(apiResult!.savings).toBeGreaterThan(0);
    expect(apiResult!.isOptimal).toBe(false);
    expect(apiResult!.recommendedAction.toLowerCase()).toContain("haiku");
  });
});

// ─── Test 5 ──────────────────────────────────────────────────────────────────
describe("Test 5 — Edge case: zero spend and zero seats does not crash", () => {
  it("handles 0 monthly spend and 0 seats without throwing", () => {
    const tools = makeTool("cursor", "Pro", "0", "0");

    expect(() => runAudit(tools, "0", "Mixed")).not.toThrow();

    const result = runAudit(tools, "0", "Mixed");
    expect(result.results).toBeDefined();
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(0);
    expect(result.totalAnnualSavings).toBeGreaterThanOrEqual(0);
  });
});

// ─── Test 6 (bonus) ──────────────────────────────────────────────────────────
describe("Test 6 — Wrong tool for use case gets flagged", () => {
  it("flags Windsurf as wrong tool for a writing use case", () => {
    const tools = makeTool("windsurf", "Pro", "15", "1");
    const result = runAudit(tools, "1", "Writing");

    const windsurfResult = result.results.find((r) => r.tool === "Windsurf");

    expect(windsurfResult).toBeDefined();
    expect(windsurfResult!.isOptimal).toBe(false);
    expect(windsurfResult!.savings).toBeGreaterThan(0);
  });
});