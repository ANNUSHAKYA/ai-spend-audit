"use client";

export default function ShareButton() {
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied!");
      }}
      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      Copy shareable link
    </button>
  );
}
