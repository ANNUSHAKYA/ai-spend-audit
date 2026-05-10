import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { AuditResult } from "@/lib/auditEngine";

const client = new Anthropic();

// Fallback template if API fails — never let the page break
function generateFallback(
  totalMonthly: number,
  totalAnnual: number,
  results: AuditResult[]
): string {
  const topSaving = results
    .filter((r) => r.savings > 0)
    .sort((a, b) => b.savings - a.savings)[0];

  if (totalMonthly < 100) {
    return `Your AI tool stack is well-optimised. Based on your current plans and team size, you're already making smart choices about where to spend on AI infrastructure. Keep an eye on usage as your team grows — plan thresholds can creep up quickly.`;
  }

  return `Your audit identified $${totalMonthly.toFixed(0)}/month ($${totalAnnual.toFixed(0)}/year) in potential savings across your AI tools. ${
    topSaving
      ? `The biggest opportunity is ${topSaving.tool} — ${topSaving.reason}`
      : "Review each tool's plan against your actual usage."
  } Acting on these recommendations now compounds over time — small monthly savings add up to significant budget freed for growth.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { results, totalMonthly, totalAnnual, useCase, teamSize } = body;

    // Build a clear, specific prompt
    const toolSummary = results
      .map(
        (r: AuditResult) =>
          `- ${r.tool}: currently $${r.currentSpend}/mo, savings opportunity $${r.savings}/mo. Action: ${r.recommendedAction}`
      )
      .join("\n");

    const prompt = `You are a concise financial advisor specialising in AI infrastructure costs for startups.

A startup has completed an AI spend audit. Here are the results:

Team size: ${teamSize}
Primary use case: ${useCase}
Total monthly savings identified: $${totalMonthly}
Total annual savings identified: $${totalAnnual}

Per-tool breakdown:
${toolSummary}

Write a personalised 80-100 word summary paragraph for this startup. Be specific, use their actual numbers, and give one concrete next step. Do not use bullet points. Write in second person ("You are...", "Your biggest..."). Tone: direct, knowledgeable, slightly urgent but not salesy.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const summary =
      message.content[0].type === "text"
        ? message.content[0].text
        : generateFallback(totalMonthly, totalAnnual, results);

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Summary API error:", err);
    // Always return a fallback — never a 500 to the client
    const { results, totalMonthly, totalAnnual } = await req
      .json()
      .catch(() => ({ results: [], totalMonthly: 0, totalAnnual: 0 }));
    return NextResponse.json({
      summary: generateFallback(totalMonthly, totalAnnual, results),
    });
  }
}