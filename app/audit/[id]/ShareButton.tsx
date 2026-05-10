"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        aria-label="Copy audit link to clipboard"
      >
        {copied ? "Copied! ✓" : "Copy shareable link"}
      </button>
      {copied && (
        <span className="sr-only" role="status">
          Link copied to clipboard
        </span>
      )}
    </div>
  );
}
