export type PlanId = "free" | "weekly" | "monthly" | "yearly";

export const PLANS: Record<PlanId, { label: string; price: number; currency: string; durationDays: number; dailyLimit: number | null; monthlyLimit: number | null }> = {
  free: { label: "Free", price: 0, currency: process.env.PAYMENT_CURRENCY || "INR", durationDays: 36500, dailyLimit: 3, monthlyLimit: 15 },
  weekly: { label: "Weekly", price: 299, currency: process.env.PAYMENT_CURRENCY || "INR", durationDays: 7, dailyLimit: null, monthlyLimit: null },
  monthly: { label: "Monthly", price: 999, currency: process.env.PAYMENT_CURRENCY || "INR", durationDays: 30, dailyLimit: null, monthlyLimit: null },
  yearly: { label: "Yearly", price: 9999, currency: process.env.PAYMENT_CURRENCY || "INR", durationDays: 365, dailyLimit: null, monthlyLimit: null },
};

export function isActive(plan: PlanId, expiresAt: Date | null | undefined): boolean {
  if (plan === "free") return true; // free is always active as a base plan
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() > Date.now();
}

export function getLimits(plan: PlanId): { daily: number | null; monthly: number | null } {
  const p = PLANS[plan];
  return { daily: p.dailyLimit, monthly: p.monthlyLimit };
}

export function startOfDayUTC(d: Date): Date {
  const dt = new Date(d);
  dt.setUTCHours(0, 0, 0, 0);
  return dt;
}

export function daysFromNow(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function upiDeepLink(plan: PlanId): string {
  const { price, currency } = PLANS[plan];
  const vpa = process.env.PAYMENT_UPI_VPA || "your-vpa@bank";
  const pn = encodeURIComponent(process.env.PAYMENT_RECEIVER_NAME || "GameScore");
  const tn = encodeURIComponent(`${PLANS[plan].label} subscription`);
  return `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${pn}&am=${price}&cu=${encodeURIComponent(currency)}&tn=${tn}`;
}

export function cardCheckoutUrl(plan: PlanId): string {
  const base = process.env.PAYMENT_CARD_CHECKOUT_BASE || "https://example.com/checkout";
  const { price, currency } = PLANS[plan];
  const qp = new URLSearchParams({ plan, amount: String(price), currency });
  return `${base}?${qp.toString()}`;
}