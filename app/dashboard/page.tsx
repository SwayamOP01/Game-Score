import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import path from "node:path";
import fs from "node:fs/promises";
import { revalidatePath } from "next/cache";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <p className="text-gray-600">Please sign in to view your analyses.</p>;
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return <p className="text-gray-600">No user found.</p>;
  const items = await prisma.analysis.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  type AnalysisItem = Awaited<ReturnType<typeof prisma.analysis.findMany>>[number];

  async function remove(id: string) {
    "use server";
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        throw new Error("Not authenticated");
      }
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (!user) throw new Error("User not found");

      const a = await prisma.analysis.findUnique({ where: { id } });
      if (!a) {
        // Nothing to delete
        revalidatePath("/dashboard");
        return;
      }
      if (a.userId !== user.id) {
        throw new Error("Forbidden: cannot delete other user's analysis");
      }

      // Attempt to remove the uploaded clip from disk to avoid orphan files
      if (a.clipPath) {
        const rel = a.clipPath.replace(/^\/+/, "");
        const abs = path.join(process.cwd(), "public", rel);
        try {
          await fs.unlink(abs);
        } catch {}
      }

      await prisma.analysis.delete({ where: { id } });
      revalidatePath("/dashboard");
    } catch (e) {
      console.error("[dashboard] delete failed", { id, error: (e as Error)?.message });
      // Always revalidate to refresh UI even on errors
      revalidatePath("/dashboard");
    }
  }

  // Calculate hack detection statistics
  const totalAnalyses = items.length;
  const flaggedAnalyses = items.filter((i: AnalysisItem) => i.cheatFlag).length;
  const avgHeadshotRate = totalAnalyses > 0 
    ? items.reduce((sum: number, i: AnalysisItem) => sum + (i.cheatScore || 0), 0) / totalAnalyses 
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">Analysis History</h1>
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">Plan: <span className="text-zinc-200 font-medium">{user.subscriptionPlan}</span>{user.subscriptionExpiresAt ? ` • Expires ${new Date(user.subscriptionExpiresAt).toLocaleDateString()}` : ""}</div>
        <Link href="/subscribe" className="btn-secondary">Subscribe</Link>
      </div>
      
      {totalAnalyses > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-4">
            <div className="text-sm text-zinc-400">Total Analyses</div>
            <div className="text-2xl font-bold text-zinc-200">{totalAnalyses}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-zinc-400">Flagged for Hacking</div>
            <div className="text-2xl font-bold text-red-400">{flaggedAnalyses}</div>
            <div className="text-xs text-zinc-500">{totalAnalyses > 0 ? ((flaggedAnalyses / totalAnalyses) * 100).toFixed(1) : 0}% of total</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-zinc-400">Avg Risk Score</div>
            <div className="text-2xl font-bold text-yellow-400">{(avgHeadshotRate * 100).toFixed(1)}%</div>
          </div>
        </div>
      )}
      
      {items.length === 0 ? (
        <p className="text-zinc-400">No analyses yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((i: typeof items[number]) => {
            const stats = JSON.parse(i.statsJson || "{}");
            const accuracyPct = typeof stats.accuracy === "number" ? stats.accuracy : Number(stats.accuracy ?? 0);
            const movementPct = typeof stats.movement === "number" ? stats.movement : Number(stats.movement ?? 0);
            const kills = typeof stats.kills === "number" ? stats.kills : Number(stats.kills ?? 0);
            const headshotRate = typeof stats.headshotRate === "number" ? stats.headshotRate : Number(stats.headshotRate ?? 0);
            const isHackFlagged = i.cheatFlag;
            const riskScore = (i.cheatScore || 0) * 100;

            return (
              <li key={i.id} className={`card p-4 flex items-center justify-between ${isHackFlagged ? 'border-red-500/30 bg-red-950/20' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-zinc-200">{i.game} • {i.region}</div>
                    {isHackFlagged && (
                      <span className="px-2 py-1 text-xs bg-red-600 text-white rounded-full">🚨 FLAGGED</span>
                    )}
                    {headshotRate > 25 && (
                      <span className="px-2 py-1 text-xs bg-orange-600 text-white rounded-full">⚠️ HIGH HS%</span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400">{new Date(i.createdAt).toLocaleString()}</div>
                  <div className="text-sm text-zinc-300">{i.summary}</div>
                  <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                    <span>Accuracy: <span className="text-zinc-300">{isFinite(accuracyPct) ? accuracyPct.toFixed(1) : '—'}%</span></span>
                    <span>Movement: <span className="text-zinc-300">{isFinite(movementPct) ? movementPct.toFixed(1) : '—'}%</span></span>
                    <span>Kills: <span className="text-zinc-300">{isFinite(kills) ? kills : '—'}</span></span>
                    <span>Headshot Rate: <span className={`${headshotRate > 25 ? 'text-red-400' : 'text-zinc-300'}`}>{isFinite(headshotRate) ? headshotRate.toFixed(1) : '—'}%</span></span>
                    <span>Risk: <span className={`${riskScore > 70 ? 'text-red-400' : riskScore > 40 ? 'text-yellow-400' : 'text-green-400'}`}>{riskScore.toFixed(1)}%</span></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/analysis/${i.id}`} className="btn-primary">View</Link>
                  <form action={remove.bind(null, i.id)}>
                    <button className="btn-secondary">Delete</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}