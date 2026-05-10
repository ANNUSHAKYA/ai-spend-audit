import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { runAudit } from "@/lib/auditEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tools, teamSize, useCase } = body;

    // Run the audit engine
    const auditResult = runAudit(tools, teamSize, useCase);

    // Save to Supabase
    const { data, error } = await supabase
      .from("audits")
      .insert({
        tools_data: tools,
        results_data: auditResult.results,
        total_monthly_savings: auditResult.totalMonthlySavings,
        total_annual_savings: auditResult.totalAnnualSavings,
        team_size: parseInt(teamSize) || 1,
        use_case: useCase,
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ auditId: data.id });
  } catch (err) {
    console.error("Audit save error:", err);
    return NextResponse.json(
      { error: "Failed to save audit" },
      { status: 500 }
    );
  }
}