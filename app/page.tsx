"use client";

import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";

const TOOLS = [
  {
    id: "cursor",
    name: "Cursor",
    plans: ["Hobby", "Pro", "Business", "Enterprise"],
  },
  {
    id: "github_copilot",
    name: "GitHub Copilot",
    plans: ["Individual", "Business", "Enterprise"],
  },
  {
    id: "claude",
    name: "Claude",
    plans: ["Free", "Pro", "Max", "Team", "Enterprise", "API Direct"],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    plans: ["Plus", "Team", "Enterprise", "API Direct"],
  },
  {
    id: "anthropic_api",
    name: "Anthropic API Direct",
    plans: ["Pay as you go"],
  },
  {
    id: "openai_api",
    name: "OpenAI API Direct",
    plans: ["Pay as you go"],
  },
  {
    id: "gemini",
    name: "Gemini",
    plans: ["Pro", "Ultra", "API"],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    plans: ["Free", "Pro", "Team"],
  },
];

const USE_CASES = ["Coding", "Writing", "Data", "Research", "Mixed"];

type ToolEntry = {
  enabled: boolean;
  plan: string;
  monthlySpend: string;
  seats: string;
};

type FormState = {
  tools: Record<string, ToolEntry>;
  teamSize: string;
  useCase: string;
};

const defaultFormState = (): FormState => ({
  tools: Object.fromEntries(
    TOOLS.map((t) => [
      t.id,
      { enabled: false, plan: t.plans[0], monthlySpend: "", seats: "1" },
    ])
  ),
  teamSize: "",
  useCase: "Mixed",
});

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => {
    if (typeof window === "undefined") return defaultFormState();
    try {
      const saved = localStorage.getItem("auditForm");
      return saved ? JSON.parse(saved) : defaultFormState();
    } catch {
      return defaultFormState();
    }
  });

  // Save to localStorage whenever form changes
  useEffect(() => {
    localStorage.setItem("auditForm", JSON.stringify(form));
  }, [form]);

  const updateTool = (toolId: string, field: keyof ToolEntry, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      tools: {
        ...prev.tools,
        [toolId]: { ...prev.tools[toolId], [field]: value },
      },
    }));
  };

  const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  const enabledTools = Object.entries(form.tools).filter(
    ([, t]) => t.enabled
  );
  if (enabledTools.length === 0) {
    alert("Please select at least one AI tool you're paying for.");
    return;
  }

  setIsLoading(true);
  try {
    const res = await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const { auditId, error } = await res.json();
    if (error) throw new Error(error);

    // Clear localStorage audit cache (now stored in DB)
    localStorage.removeItem("auditForm");

    router.push(`/audit/${auditId}`);
  } catch (err) {
    alert("Something went wrong. Please try again.");
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Spend Audit
          </h1>
          <p className="mt-2 text-gray-700 font-medium">
            Find out where you&apos;re overspending on AI tools — free, instant, no login required.
          </p>
        </div>

        {/* Tool cards */}
        <div className="space-y-4">
          {TOOLS.map((tool) => {
            const entry = form.tools[tool.id];
            return (
              <div
                key={tool.id}
                className={`rounded-xl border bg-white p-4 transition-all ${
                  entry.enabled ? "border-blue-400 shadow-sm" : "border-gray-200"
                }`}
              >
                {/* Tool toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={entry.enabled}
                    onChange={(e) => updateTool(tool.id, "enabled", e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="font-semibold text-gray-800">{tool.name}</span>
                </label>

                {/* Expanded fields when enabled */}
                {entry.enabled && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Plan */}
                    <div>
                      <label htmlFor={`plan-${tool.id}`} className="block text-xs text-gray-700 font-medium mb-1">Plan</label>
                      <select
                        id={`plan-${tool.id}`}
                        value={entry.plan}
                        onChange={(e) => updateTool(tool.id, "plan", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        {tool.plans.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    {/* Monthly Spend */}
                    <div>
                      <label htmlFor={`spend-${tool.id}`} className="block text-xs text-gray-700 font-medium mb-1">Monthly spend ($)</label>
                      <input
                        id={`spend-${tool.id}`}
                        type="number"
                        min="0"
                        placeholder="e.g. 40"
                        value={entry.monthlySpend}
                        onChange={(e) => updateTool(tool.id, "monthlySpend", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>

                    {/* Seats */}
                    <div>
                      <label htmlFor={`seats-${tool.id}`} className="block text-xs text-gray-700 font-medium mb-1">Number of seats</label>
                      <input
                        id={`seats-${tool.id}`}
                        type="number"
                        min="1"
                        placeholder="e.g. 3"
                        value={entry.seats}
                        onChange={(e) => updateTool(tool.id, "seats", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Team info */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="teamSize" className="block text-xs text-gray-700 font-medium mb-1">Team size</label>
            <input
              id="teamSize"
              type="number"
              min="1"
              placeholder="e.g. 5"
              value={form.teamSize}
              onChange={(e) => setForm((p) => ({ ...p, teamSize: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="useCase" className="block text-xs text-gray-700 font-medium mb-1">Primary use case</label>
            <select
              id="useCase"
              value={form.useCase}
              onChange={(e) => setForm((p) => ({ ...p, useCase: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {USE_CASES.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
  onClick={handleSubmit}
  disabled={isLoading}
  className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-lg"
>
  {isLoading ? "Running audit..." : "Run My Free Audit →"}
</button>

        <p className="text-center text-xs text-gray-600 font-medium mt-3">
          No login required. Your data is not shared.
        </p>
      </div>
    </main>
  );
}