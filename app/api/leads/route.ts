import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.re_XB6LbSKE_Mt6htQ4cm9fx6qNYWPfxib7V);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      auditId,
      email,
      companyName,
      role,
      teamSize,
      totalMonthly,
      honeypot, // spam trap
    } = body;

    // Honeypot check — bots fill hidden fields, humans don't
    if (honeypot) {
      // Silently succeed so bots don't know they were caught
      return NextResponse.json({ success: true });
    }

    // Basic email validation
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Save lead to Supabase
    const { error: dbError } = await supabase.from("leads").insert({
      audit_id: auditId,
      email,
      company_name: companyName || null,
      role: role || null,
      team_size: parseInt(teamSize) || null,
    });

    if (dbError) throw dbError;

    // Send confirmation email
    const isHighSavings = totalMonthly > 500;

    await resend.emails.send({
      from: "AI Spend Audit <onboarding@resend.dev>",
      to: email,
      subject: `Your AI Spend Audit — $${totalMonthly}/mo savings identified`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="color: #2563eb;">Your AI Spend Audit is ready</h2>
          <p>Hi${companyName ? ` from ${companyName}` : ""},</p>
          <p>Your audit identified <strong>$${totalMonthly}/month ($${totalMonthly * 12}/year)</strong> in potential savings across your AI tools.</p>
          <p>Review the full breakdown here:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/audit/${auditId}"
             style="display:inline-block; background:#2563eb; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; margin: 12px 0;">
            View My Audit →
          </a>
          ${
            isHighSavings
              ? `<p style="margin-top:24px; padding:16px; background:#eff6ff; border-radius:8px; border-left:4px solid #2563eb;">
              <strong>You're a great fit for Credex.</strong> With $${totalMonthly}/mo in identified savings, you could capture even more through discounted AI credits. A member of our team will reach out within 2 business days.
            </p>`
              : `<p style="color:#6b7280; font-size:14px; margin-top:24px;">We'll notify you when new optimisations apply to your stack.</p>`
          }
          <p style="color:#6b7280; font-size:12px; margin-top:32px;">Sent by AI Spend Audit · Powered by Credex</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Lead capture error:", err);
    return NextResponse.json(
      { error: "Failed to save lead" },
      { status: 500 }
    );
  }
}