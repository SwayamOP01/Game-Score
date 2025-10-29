"use client";
import { useState } from "react";

const slides = [
  {
    title: "Upload",
    body: "Add a 1–5 min gameplay clip (mp4/mov) and select game/region.",
  },
  {
    title: "Analyze",
    body: "Our AI benchmarks against top YouTube plays and scores your performance.",
  },
  {
    title: "Improve",
    body: "Get tips, highlight moments, and links to tutorials (EN/HI).",
  },
];

export default function Home() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("onboarded");
  });
  const [idx, setIdx] = useState(0);

  function close() {
    localStorage.setItem("onboarded", "true");
    setShow(false);
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur p-8">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-br from-cyan-500/30 to-transparent blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-violet-600/25 to-transparent blur-3xl" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-500 neon">
          Welcome to Game Score
        </h1>
        <p className="mt-3 text-zinc-300 max-w-2xl">Upload a clip to get AI-powered analysis, benchmarking against top plays, and tips to improve.</p>
        <div className="mt-6 flex gap-4">
          <a href="/upload" className="btn-primary">Upload Clip</a>
          <a href="/dashboard" className="btn-secondary">View Dashboard</a>
        </div>
      </section>

      {show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-cyan-300">How it Works</h2>
            <div className="rounded p-4 border border-white/10 bg-black/30">
              <h3 className="font-medium text-violet-300">{slides[idx].title}</h3>
              <p className="text-zinc-300 text-sm">{slides[idx].body}</p>
            </div>
            <div className="flex items-center justify-between">
              <button
                className="btn-secondary"
                onClick={() => setIdx((i) => (i > 0 ? i - 1 : i))}
                disabled={idx === 0}
              >
                Back
              </button>
              {idx < slides.length - 1 ? (
                <button className="btn-primary" onClick={() => setIdx((i) => i + 1)}>
                  Next
                </button>
              ) : (
                <button className="btn-primary" onClick={close}>
                  Got it
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
