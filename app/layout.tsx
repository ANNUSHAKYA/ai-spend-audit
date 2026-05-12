import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SpendLens — Free AI Tool Spend Audit",
  description: "Find out where you're overspending on Cursor, Claude, ChatGPT, and GitHub Copilot. Free, instant, no login required.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
          Built by{" "}
          <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Credex
          </a>{" "}
          · Free forever · No login required
        </footer>
      </body>
    </html>
  );
}
