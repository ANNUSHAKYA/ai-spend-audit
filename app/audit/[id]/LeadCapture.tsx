"use client";

import { useState } from "react";

type Props = {
  auditId: string;
  totalMonthly: number;
};

export default function LeadCapture({ auditId, totalMonthly }: Props) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          email,
          companyName,
          role,
          totalMonthly,
          honeypot: "", // always empty for real users
        }),
      });

      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-6">
        <p className="text-green-800 font-bold text-lg">Report sent! ✓</p>
        <p className="text-green-700 text-sm mt-1">
          Check your inbox — we've sent your full audit report.
          {totalMonthly > 500 &&
            " Our team will reach out within 2 business days."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h3 className="font-bold text-gray-900 text-lg mb-1">
        Get this report by email
      </h3>
      <p className="text-gray-500 text-sm mb-4">
        We'll send you the full breakdown. No spam, ever.
      </p>

      <div className="space-y-3">
        {/* Honeypot — hidden from humans, bots fill it */}
        <input
          type="text"
          name="website"
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
          readOnly
          value=""
        />

        {/* Email — required */}
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Optional fields */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Company name (optional)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Your role (optional)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? "Sending..." : "Send me the report →"}
        </button>

        <p className="text-xs text-gray-400 text-center">
          {totalMonthly > 500
            ? "High-savings accounts will be contacted by Credex within 2 business days."
            : "We'll notify you when new optimisations apply to your stack."}
        </p>
      </div>
    </div>
  );
}