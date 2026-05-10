import LeadCapture from "./LeadCapture";
import AuditSummary from "./AuditSummary";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { AuditResult } from "@/lib/auditEngine";
import ShareButton from "./ShareButton";
import Link from "next/link";

// OG tags for shareable previews
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabase
    .from("audits")
    .select("total_monthly_savings")
    .eq("id", id)
    .single();

  const savings = data?.total_monthly_savings ?? 0;

  return {
    title: `AI Spend Audit — Save $${savings}/mo`,
    description: `This startup could save $${savings}/mo on AI tools. Get your free audit.`,
    openGraph: {
      title: `AI Spend Audit — Save $${savings}/mo`,
      description: `This startup could save $${savings}/mo on AI tools. Get your free audit.`,
      url: `https://ai-spend-audit-irw9lmqnl-annushakya94526-7755s-projects.vercel.app//audit/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `AI Spend Audit — Save $${savings}/mo`,
      description: `This startup could save $${savings}/mo on AI tools. Get your free audit.`,
    },
  };
}

export default async function AuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch audit from Supabase
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return notFound();

  const results: AuditResult[] = data.results_data;
  const totalMonthly: number = data.total_monthly_savings;
  const totalAnnual: number = data.total_annual_savings;
  const showCredex = totalMonthly > 500;
  const alreadyOptimal = totalMonthly < 100;

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your AI Spend Audit</h1>
          <p className="text-gray-500 text-sm mt-1">
            Based on your current tools and plans
          </p>
        </div>

        {/* Hero savings block */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-8 mb-6 text-center shadow-lg">
          <p className="text-sm uppercase tracking-widest opacity-75 mb-1">
            Potential monthly savings
          </p>
          <p className="text-6xl font-extrabold">
            ${totalMonthly.toFixed(0)}
          </p>
          <p className="opacity-75 mt-2 text-lg">
            ${totalAnnual.toFixed(0)} saved per year
          </p>
        </div>

        {/* AI Summary */}
<AuditSummary
  results={results}
  totalMonthly={totalMonthly}
  totalAnnual={totalAnnual}
  useCase={data.use_case}
  teamSize={data.team_size}
/>

        {/* Per-tool breakdown */}
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Tool-by-tool breakdown
        </h2>
        <div className="space-y-3 mb-6">
          {results.map((r) => (
            <div
              key={r.tool}
              className="bg-white rounded-xl border border-gray-200 p-5 flex justify-between items-start gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{r.tool}</span>
                  {r.isOptimal && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Optimal
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{r.reason}</p>
                {!r.isOptimal && (
                  <p className="text-sm text-blue-700 font-medium mt-1">
                    → {r.recommendedAction}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">Current</p>
                <p className="font-bold text-gray-800">${r.currentSpend}/mo</p>
                {r.savings > 0 && (
                  <p className="text-green-600 font-bold text-sm mt-1">
                    Save ${r.savings}/mo
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Already optimal */}
        {alreadyOptimal && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center mb-6">
            <p className="text-green-800 font-bold text-lg">
              You&apos;re spending well 👍
            </p>
            <p className="text-green-700 text-sm mt-1">
              Your current AI stack looks well optimised. we&apos;ll notify you when
              better options apply to your stack.
            </p>
          </div>
        )}

        {/* Credex CTA — only for high savings */}
        {showCredex && (
          <div className="bg-blue-50 border border-blue-300 rounded-2xl p-6 text-center mb-6 shadow-sm">
            <p className="text-blue-900 font-extrabold text-2xl">
              ${totalMonthly.toFixed(0)}/mo is real money.
            </p>
            <p className="text-blue-800 text-sm mt-2 max-w-md mx-auto">
              Credex sells discounted AI credits — Cursor, Claude, ChatGPT
              Enterprise and more — from companies that overforecast. The
              discount is real and substantial.
            </p>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-colors text-lg"
            >
              Book a Free Credex Consultation →
            </a>
          </div>
        )}

        {/* Lead capture — shown after value, never before */}
        <LeadCapture auditId={(await params).id} totalMonthly={totalMonthly} />

        {/* Share section */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <p className="text-gray-700 font-semibold mb-2">
            Share this audit
          </p>
          <p className="text-gray-400 text-xs mb-3">
            Your email and company name are never included in the public link.
          </p>
          <ShareButton />
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-blue-600 text-sm hover:underline">
            ← Run a new audit
          </Link>
        </div>
      </div>
    </main>
  );
}