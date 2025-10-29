import { NextRequest, NextResponse } from 'next/server';
import { analyzeVideo } from '@/lib/analyzer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const qp = req.nextUrl.searchParams;
    const clipPath: string | undefined = body.clipPath || body.videoPath || body.path || qp.get('clipPath') || qp.get('videoPath') || qp.get('path') || undefined;
    const videoUrl: string | undefined = body.videoUrl;

    if (!clipPath && !videoUrl) {
      return NextResponse.json(
        { error: 'Missing clipPath or videoUrl in request body' },
        { status: 400 }
      );
    }

    const analysis = await analyzeVideo({ clipPath, videoUrl });
    // Shape the response with hack detection results
    const out = {
      content_type: analysis.content_type,
      content_summary: analysis.content_summary,
      analysis_confidence: analysis.analysis_confidence,
      timestamped_highlights: analysis.timestamped_highlights,
      'detected_objects/scenes': analysis['detected_objects/scenes'],
      potential_misclassifications: analysis.potential_misclassifications,
      metadata: analysis.metadata,
      recommendations: analysis.recommendations,
      cheat_flag: analysis.cheat_flag,
      cheat_score: analysis.cheat_score,
      headshot_rate: analysis.headshot_rate,
    };

    return NextResponse.json(out, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: 'Video analysis failed', details: (e as Error)?.message ?? String(e) },
      { status: 500 }
    );
  }
}