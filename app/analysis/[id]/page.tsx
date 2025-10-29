import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (typeof id !== "string" || !id) return notFound();
  const analysis = await prisma.analysis.findUnique({ where: { id } });
  if (!analysis) return notFound();
  const stats = JSON.parse(analysis.statsJson || "{}");
  const accuracyPct = typeof stats.accuracy === "number" ? stats.accuracy : Number(stats.accuracy ?? 0);
  const headshotRate = typeof stats.headshotRate === "number" ? stats.headshotRate : Number(stats.headshotRate ?? 0);
  const isHackFlagged = analysis.cheatFlag;
  const riskScore = (analysis.cheatScore || 0) * 100;

  const tutorialLinks = [
    "https://www.youtube.com/watch?v=TSUWluvmu9Q&list=PLQOM9_Ne6uuV8RUDxTqu9Qfjf_hL1JVRu",
    "https://www.youtube.com/watch?v=_Gp8mj-B5Go&list=PLQOM9_Ne6uuV8RUDxTqu9Qfjf_hL1JVRu&index=2",
    "https://www.youtube.com/watch?v=zCCuIxOOEMs",
    "https://www.youtube.com/watch?v=x9lYksDek5g",
    "https://www.youtube.com/watch?v=rBIL6_8BsqA",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">Analysis</h1>
        <Link href="/dashboard" className="text-sm text-zinc-300 hover:text-cyan-300">Back to Dashboard</Link>
      </div>
      <div className="text-sm text-zinc-400">{analysis.game} • {analysis.region} • {new Date(analysis.createdAt).toLocaleString()}</div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-2">
          <video src={analysis.clipPath} controls className="w-full rounded" />
        </div>
        <div className="space-y-4">
          <div className="card p-4 space-y-2">
            <h2 className="font-medium text-cyan-300">Summary</h2>
            <p className="text-zinc-200">{analysis.summary}</p>
          </div>
          <div className="card p-4">
            <h2 className="font-medium text-violet-300 mb-2">Stats</h2>
            <ul className="text-sm grid grid-cols-2 gap-2">
              {Object.entries(stats).map(([k, v]) => (
                <li key={k} className="rounded p-2 border border-white/10 bg-black/30 text-zinc-200">{k}: {String(v)}</li>
              ))}
            </ul>
          </div>
          <div className={`card p-4 space-y-3 ${isHackFlagged ? 'border-red-500/50 bg-red-950/30' : 'border-yellow-500/30'}`}>
            <h2 className="font-medium text-red-300 flex items-center gap-2">
              🛡️ Hack Detection Analysis
              {isHackFlagged && <span className="px-2 py-1 text-xs bg-red-600 text-white rounded-full">FLAGGED</span>}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-zinc-400">Headshot Rate</div>
                <div className={`text-lg font-bold ${headshotRate > 25 ? 'text-red-400' : 'text-green-400'}`}>
                  {headshotRate.toFixed(1)}%
                </div>
                {headshotRate > 25 && (
                  <div className="text-xs text-red-300">⚠️ Above 25% threshold</div>
                )}
              </div>
              <div>
                <div className="text-zinc-400">Risk Score</div>
                <div className={`text-lg font-bold ${riskScore > 70 ? 'text-red-400' : riskScore > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {riskScore.toFixed(1)}%
                </div>
              </div>
            </div>
            {isHackFlagged && (
              <div className="bg-red-900/50 border border-red-500/50 rounded p-3 text-sm">
                <div className="font-medium text-red-300 mb-1">⚠️ Suspicious Activity Detected</div>
                <div className="text-red-200">
                  This gameplay shows patterns consistent with potential cheating software. 
                  Headshot rate above 25% is highly unusual for legitimate gameplay.
                </div>
              </div>
            )}
            {!isHackFlagged && headshotRate > 20 && (
              <div className="bg-yellow-900/50 border border-yellow-500/50 rounded p-3 text-sm">
                <div className="font-medium text-yellow-300 mb-1">⚠️ High Performance Alert</div>
                <div className="text-yellow-200">
                  Excellent headshot rate! While within normal range, this level of precision is impressive.
                </div>
              </div>
            )}
          </div>
          <div className="card p-4 space-y-2">
            <h2 className="font-medium text-cyan-300">Recommendations</h2>
            <ul className="text-sm list-disc list-inside text-zinc-200">
              {(() => {
                const tips: string[] = [];
                if (Number(accuracyPct) < 40) tips.push("Focus on aim training: start with static targets, then move to tracking.");
                if (Number(accuracyPct) >= 40 && Number(accuracyPct) < 60) tips.push("Good accuracy—work on recoil control and crosshair placement for consistency.");
                if (Number(accuracyPct) >= 60) tips.push("Strong accuracy—prioritize positioning and pre-aim to win more duels.");

                const movement = Number(stats.movement ?? 0);
                if (movement < 40) tips.push("Practice strafing and counter-strafing to reduce exposure during fights.");
                if (movement >= 40 && movement < 60) tips.push("Solid movement—work on peek timing and shoulder peeks.");
                if (movement >= 60) tips.push("Great movement—optimize pathing to avoid choke points and utility.");

                const kills = Number(stats.kills ?? 0);
                if (kills < 5) tips.push("Look for higher-impact plays: take space early and trade teammates effectively.");
                if (kills >= 5 && kills < 10) tips.push("Nice impact—review death locations to improve mid-round decisions.");
                if (kills >= 10) tips.push("High impact—consider utility usage and cooldown tracking to maintain momentum.");

                return tips.map((t, idx) => (<li key={idx}>{t}</li>));
              })()}
            </ul>
          </div>
          <div className="card p-4 space-y-2">
            <h2 className="font-medium text-cyan-300">Tutorials</h2>
            <ul className="text-sm list-disc list-inside text-zinc-200">
              {tutorialLinks.map((url, idx) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">Watch Tutorial {idx + 1}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}