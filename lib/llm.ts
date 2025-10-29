// Use global fetch and RequestInit typings from Next.js/Node 18 environment

type LLMInput = {
  classification: { type: string; confidence: number; reasons: string[] };
  metadata: { duration: number | null; width: number | null; height: number | null; fps: number | null };
  highlights: Array<{ t: number; label: string; confidence: number }>;
  headshotRate: number;
  baseSummary: string;
};

type LLMOutput = { summary?: string; tips?: string[] };

function getOpenRouterConfig() {
  const key = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'openrouter/auto';
  return { key, model };
}

export async function callLLMForSummary(input: LLMInput): Promise<LLMOutput | null> {
  const { key, model } = getOpenRouterConfig();
  if (!key) return null; // No key configured, skip LLM

  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const system = `You are a gameplay analysis assistant. Respond concisely in JSON: {"summary": string, "tips": string[]}.
- Write a one-paragraph narrative summary of the clip: what it shows and key moments.
- Provide 3-5 coaching tips tailored to FPS fundamentals (aim, movement, positioning, decision-making).
- If headshot rate seems high for a human (>=25%), avoid accusations; use neutral language and suggest verifying settings and practicing consistency.`;

  const user = {
    classification: input.classification,
    metadata: input.metadata,
    highlights: input.highlights,
    headshotRate: input.headshotRate,
    baseSummary: input.baseSummary,
  };

  const body = {
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: `DATA:\n${JSON.stringify(user)}` },
    ],
    temperature: 0.2,
  };

  const init: RequestInit = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  try {
    const res = await fetch(url, init as any);
    if (!res.ok) return null;
    const json = await res.json();
    const content: string | undefined = json?.choices?.[0]?.message?.content;
    if (!content) return null;
    // Try to parse JSON from the model
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    const parsed = JSON.parse(content.slice(start, end + 1));
    const out: LLMOutput = {
      summary: typeof parsed.summary === 'string' ? parsed.summary : undefined,
      tips: Array.isArray(parsed.tips) ? parsed.tips.filter((t: any) => typeof t === 'string') : undefined,
    };
    return out;
  } catch {
    return null;
  }
}

// LLM-based classification (preferred when OPENROUTER_API_KEY is set)
type LLMClassifyInput = {
  detections: Array<{ t: number; objects: Array<{ name: string; score: number }> }>;
  framesCount: number;
  metadata: { duration: number | null; width: number | null; height: number | null; fps: number | null };
};

export async function callLLMForClassification(input: LLMClassifyInput): Promise<{ type: string; confidence: number; reasons: string[]; platform?: 'mobile' | 'pc' | 'console' | 'unknown' } | null> {
  const { key, model } = getOpenRouterConfig();
  if (!key) return null;

  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const system = `You are a gameplay content classifier. Return JSON strictly in this shape:
{"type": "gameplay|tutorial|vlog|non-game|unknown", "confidence": number, "reasons": string[], "platform": "mobile|pc|console|unknown"}
- Use detections (object names) and metadata to infer if the clip shows gameplay.
- Platform heuristic: keyboard/mouse/laptop => pc; cell phone => mobile; tv/console UI => console.
- Be conservative: if unclear, choose "unknown" with lower confidence.`;

  // Reduce detections to compact signal the LLM can reason on
  const objectCounts: Record<string, number> = {};
  for (const d of input.detections || []) {
    for (const o of d.objects || []) {
      const name = String(o.name || '').toLowerCase();
      objectCounts[name] = (objectCounts[name] || 0) + 1;
    }
  }

  const user = {
    framesCount: input.framesCount,
    metadata: input.metadata,
    objectCounts,
    sampleObjects: Object.keys(objectCounts).slice(0, 12),
  };

  const body = {
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: `DATA:\n${JSON.stringify(user)}` },
    ],
    temperature: 0.1,
  };

  const init: RequestInit = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  try {
    const res = await fetch(url, init as any);
    if (!res.ok) return null;
    const json = await res.json();
    const content: string | undefined = json?.choices?.[0]?.message?.content;
    if (!content) return null;
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    const parsed = JSON.parse(content.slice(start, end + 1));
    const out = {
      type: typeof parsed.type === 'string' ? parsed.type : 'unknown',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.filter((t: any) => typeof t === 'string') : [],
      platform: parsed.platform === 'mobile' || parsed.platform === 'pc' || parsed.platform === 'console' ? parsed.platform : 'unknown',
    } as { type: string; confidence: number; reasons: string[]; platform?: 'mobile' | 'pc' | 'console' | 'unknown' };
    return out;
  } catch {
    return null;
  }
}