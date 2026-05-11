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
      url: `https://ai-spend-audit-sigma.vercel.app/audit/${id}`,
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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold mb-1">
            AI Spend Audit
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900">Your results are ready</h1>
          <p className="text-gray-600 text-sm mt-1 font-medium">
            Based on your current tools and plans
          </p>
        </div>

        {/* Hero savings block — bigger numbers, pulse animation on load */}
        <div
          className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-3xl p-10 mb-8 text-center shadow-2xl"
          style={{ boxShadow: "0 20px 60px rgba(37,99,235,0.35)" }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white opacity-5 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full bg-white opacity-5 pointer-events-none" />

          <p className="text-xs uppercase tracking-[0.2em] opacity-70 mb-3 font-semibold">
            Potential monthly savings
          </p>
          {/* Big animated savings number */}
          <p
            className="text-8xl font-black leading-none tabular-nums"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.2)", animation: "pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}
          >
            ${totalMonthly.toFixed(0)}
          </p>
          <p className="opacity-80 mt-4 text-xl font-semibold">
            ${totalAnnual.toFixed(0)}{" "}
            <span className="opacity-70 font-normal">saved per year</span>
          </p>

          {/* Divider */}
          <div className="mt-6 border-t border-white/20 pt-4 flex justify-center gap-8 text-sm">
            <span className="opacity-70">
              <span className="font-bold text-white opacity-100">{results.length}</span> tools audited
            </span>
            <span className="opacity-70">
              <span className="font-bold text-white opacity-100">
                {results.filter((r) => !r.isOptimal).length}
              </span>{" "}
              changes recommended
            </span>
          </div>
        </div>

        {/* Pop animation keyframe — injected once */}
        <style>{`
          @keyframes pop {
            from { transform: scale(0.8); opacity: 0; }
            to   { transform: scale(1);   opacity: 1; }
          }
          @keyframes fadeUp {
            from { transform: translateY(16px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
          .tool-card { animation: fadeUp 0.4s ease both; }
        `}</style>

        {/* AI Summary */}
        <AuditSummary
          results={results}
          totalMonthly={totalMonthly}
          totalAnnual={totalAnnual}
          useCase={data.use_case}
          teamSize={data.team_size}
        />

        {/* Per-tool breakdown */}
        <h2 className="text-base font-bold text-gray-500 uppercase tracking-widest mb-4 mt-2">
          Tool-by-tool breakdown
        </h2>
        <div className="space-y-3 mb-8">
          {results.map((r, i) => (
            <div
              key={r.tool}
              className="tool-card bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-start gap-4 shadow-sm hover:shadow-md transition-shadow"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-bold text-gray-900 text-base">{r.tool}</span>
                  {r.isOptimal ? (
                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                      ✓ Optimal
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                      Review
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.reason}</p>
                {!r.isOptimal && (
                  <p className="text-sm text-blue-700 font-semibold mt-2 flex items-start gap-1">
                    <span className="mt-px">→</span>
                    <span>{r.recommendedAction}</span>
                  </p>
                )}
              </div>
              <div className="text-right shrink-0 pl-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Current</p>
                <p className="font-bold text-gray-900 text-base">${r.currentSpend}/mo</p>
                {r.savings > 0 && (
                  <p className="text-emerald-600 font-bold text-sm mt-1 whitespace-nowrap">
                    Save ${r.savings}/mo
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Already optimal */}
        {alreadyOptimal && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center mb-6">
            <p className="text-emerald-800 font-bold text-xl">
              You&apos;re spending well 👍
            </p>
            <p className="text-emerald-700 text-sm mt-2 leading-relaxed">
              Your current AI stack looks well optimised. We&apos;ll notify you when
              better options apply to your stack.
            </p>
          </div>
        )}

        {/* Credex CTA — only for high savings */}
        {showCredex && (
          <div className="rounded-3xl p-8 text-center mb-8 shadow-lg text-white" style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 60%,#6366f1 100%)" }}>
            <p className="text-3xl font-black">
              ${totalMonthly.toFixed(0)}/mo is real money.
            </p>
            <p className="text-blue-100 text-sm mt-3 max-w-md mx-auto leading-relaxed">
              Credex sells discounted AI credits — Cursor, Claude, ChatGPT
              Enterprise and more — from companies that overforecast. The
              discount is real and substantial.
            </p>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-3.5 rounded-2xl transition-colors text-base shadow-md"
            >
              Book a Free Credex Consultation →
            </a>
          </div>
        )}

        {/* Lead capture — shown after value, never before */}
        <LeadCapture auditId={(await params).id} totalMonthly={totalMonthly} />

        {/* Share section */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm mt-6">
          <p className="text-gray-800 font-bold text-base mb-1">
            Share this audit
          </p>
          <p className="text-gray-500 text-xs mb-4">
            Your email and company name are never included in the public link.
          </p>
          <ShareButton />
        </div>

        {/* Back link */}
        <div className="text-center mt-6 mb-4">
          <Link href="/" className="text-blue-500 text-sm hover:text-blue-700 transition-colors hover:underline">
            ← Run a new audit
          </Link>
        </div>
      </div>
    </main>
  );
}