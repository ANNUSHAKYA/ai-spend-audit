"use client";

import { useEffect, useState } from "react";
import type { AuditResult } from "@/lib/auditEngine";

type Props = {
  results: AuditResult[];
  totalMonthly: number;
  totalAnnual: number;
  useCase: string;
  teamSize: number;
};

export default function AuditSummary({
  results,
  totalMonthly,
  totalAnnual,
  useCase,
  teamSize,
}: Props) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results, totalMonthly, totalAnnual, useCase, teamSize }),
    })
      .then((r) => r.json())
      .then((data) => setSummary(data.summary))
      .catch(() =>
        setSummary(
          `Your audit identified $${totalMonthly.toFixed(0)}/month in potential savings. Review the recommendations below and act on the highest-impact items first.`
        )
      )
      .finally(() => setLoading(false));
  }, [results, totalMonthly, totalAnnual, useCase, teamSize]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
        AI-Generated Summary
      </p>
      {loading ? (
        <div className="space-y-2 animate-pulse" role="status" aria-label="Generating AI summary...">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      ) : (
        <p className="text-gray-700 leading-relaxed text-sm">{summary}</p>
      )}
    </div>
  );
}