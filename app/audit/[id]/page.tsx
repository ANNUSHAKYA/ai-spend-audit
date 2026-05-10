"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { AuditSummary } from "@/lib/auditEngine";

export default function AuditPage() {
  const { id } = useParams();
  const [audit, setAudit] = useState<AuditSummary | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`audit_${id}`);
    if (stored) setAudit(JSON.parse(stored));
  }, [id]);

  if (!audit) return <div className="p-10 text-center">Loading audit...</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your AI Spend Audit</h1>

        {/* Hero savings number */}
        <div className="bg-blue-600 text-white rounded-xl p-6 mb-6 text-center">
          <p className="text-sm uppercase tracking-wide opacity-80">Potential monthly savings</p>
          <p className="text-5xl font-bold mt-1">${audit.totalMonthlySavings.toFixed(0)}</p>
          <p className="text-sm opacity-80 mt-1">${audit.totalAnnualSavings.toFixed(0)} per year</p>
        </div>

        {/* Per-tool results */}
        <div className="space-y-3">
          {audit.results.map((r) => (
            <div key={r.tool} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{r.tool}</p>
                  <p className="text-sm text-gray-500 mt-1">{r.reason}</p>
                  <p className="text-sm text-blue-700 mt-1 font-medium">{r.recommendedAction}</p>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <p className="text-xs text-gray-400">Current</p>
                  <p className="font-semibold">${r.currentSpend}/mo</p>
                  {r.savings > 0 && (
                    <p className="text-green-600 font-bold text-sm mt-1">
                      Save ${r.savings}/mo
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Already optimal message */}
        {audit.alreadyOptimal && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-800 font-semibold">You're spending well 👍</p>
            <p className="text-green-700 text-sm mt-1">
              Your current AI stack looks optimised. We'll notify you when better options apply.
            </p>
          </div>
        )}

        {/* Credex CTA for high savings */}
        {audit.showCredex && (
          <div className="mt-6 bg-blue-50 border border-blue-300 rounded-xl p-5 text-center">
            <p className="text-blue-900 font-bold text-lg">
              You could save ${audit.totalMonthlySavings.toFixed(0)}/mo
            </p>
            <p className="text-blue-800 text-sm mt-1">
              Credex sells discounted AI credits — Cursor, Claude, ChatGPT and more — at real savings.
            </p>
            <a
              href="https://credex.rocks"
              target="_blank"
              className="inline-block mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Book a Free Credex Consultation →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}