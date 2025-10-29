import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PLANS, upiDeepLink, cardCheckoutUrl } from "@/lib/subscription";

export default async function SubscribePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">Subscribe</h1>
        <p className="text-zinc-300">Please sign in to manage your subscription.</p>
        <Link href="/auth" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return <p className="text-zinc-300">No user found.</p>;
  }

  async function activate(plan: keyof typeof PLANS) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Not authenticated");
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("User not found");

    const durationDays = PLANS[plan].durationDays;
    const expires = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    await prisma.user.update({ where: { id: user.id }, data: { subscriptionPlan: plan, subscriptionExpiresAt: expires } });
  }

  const planCards = Object.entries(PLANS).filter(([id]) => id !== "free");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">Subscribe</h1>
        <Link href="/dashboard" className="text-sm text-zinc-300 hover:text-cyan-300">Back to Dashboard</Link>
      </div>
      <div className="text-sm text-zinc-400">Current Plan: <span className="text-zinc-200 font-medium">{user.subscriptionPlan}</span>{user.subscriptionExpiresAt ? ` • Expires ${new Date(user.subscriptionExpiresAt).toLocaleDateString()}` : ""}</div>

      <div className="grid md:grid-cols-3 gap-4">
        {planCards.map(([id, p]) => (
          <div key={id} className="card p-4 space-y-3">
            <div className="text-lg font-semibold text-zinc-200">{p.label}</div>
            <div className="text-2xl font-bold text-cyan-300">₹{p.price} <span className="text-sm text-zinc-400">/{id}</span></div>
            <div className="text-sm text-zinc-400">Unlimited analyses</div>
            <div className="flex gap-2">
              <a href={upiDeepLink(id as any)} className="btn-primary" target="_blank" rel="noreferrer">Pay via UPI</a>
              <a href={cardCheckoutUrl(id as any)} className="btn-secondary" target="_blank" rel="noreferrer">Pay by Card</a>
            </div>
            <form action={activate.bind(null, id as any)}>
              <button className="btn-secondary">Activate</button>
            </form>
            <div className="text-xs text-zinc-500">Note: In development, payments are external. Use Activate after completing payment.</div>
          </div>
        ))}
      </div>
      <div className="card p-4">
        <div className="font-medium text-zinc-200">Free Plan Limits</div>
        <div className="text-sm text-zinc-400">3 analyses per day, 15 per month. Upgrade for unlimited analyses.</div>
      </div>
    </div>
  );
}