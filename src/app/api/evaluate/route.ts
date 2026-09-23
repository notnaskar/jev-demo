import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { evaluateFit } from '@/lib/typesafe/evaluator';
import { DimensionWeights } from '@/types/scoring';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText, jobDescriptionText, customWeights, model } = body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Resume text is required.' },
        { status: 400 }
      );
    }

    if (!jobDescriptionText || typeof jobDescriptionText !== 'string' || jobDescriptionText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Job description text is required.' },
        { status: 400 }
      );
    }

    // Secure resolution: Cookie -> Client body fallback -> Server env
    const cookieStore = await cookies();
    const sessionKey = cookieStore.get('fitlens_session_key')?.value;
    const bodyKey = typeof body.apiKey === 'string' && body.apiKey.trim() ? body.apiKey.trim() : undefined;
    const effectiveKey = sessionKey || bodyKey || process.env.TYPESAFE_API_KEY;

    if (!effectiveKey || effectiveKey.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'TypeSafe API key is required. Please configure your key in the settings modal or set TYPESAFE_API_KEY in server environment.',
        },
        { status: 401 }
      );
    }

    const evaluation = await evaluateFit({
      resumeText,
      jobDescriptionText,
      customWeights: customWeights as DimensionWeights | undefined,
      apiKey: effectiveKey.trim(),
      model: typeof model === 'string' ? model : undefined,
    });

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error: unknown) {
    console.error('API /api/evaluate error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during evaluation.';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
