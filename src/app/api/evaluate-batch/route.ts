import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { evaluateFit } from '@/lib/typesafe/evaluator';
import { DimensionWeights } from '@/types/scoring';
import { ClassifiedCandidate, DimensionMeta, QuestionDefinition } from '@/types/evaluation';

interface ResumeBatchItem {
  id?: string;
  name?: string;
  email?: string;
  text?: string;
  rawResumeText?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      jobDescriptionText,
      resumes,
      customWeights,
      customQuestions,
      customDimensions,
      model,
    } = body;

    if (!jobDescriptionText || typeof jobDescriptionText !== 'string' || jobDescriptionText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Job description text is required.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(resumes) || resumes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one resume is required for batch evaluation.' },
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
          error: 'TypeSafe API key is required to evaluate profiles. Please configure your key in the settings modal or set TYPESAFE_API_KEY in server environment.',
        },
        { status: 401 }
      );
    }

    const trimmedKey = effectiveKey.trim();
    const validResumes: Array<{ item: ResumeBatchItem; text: string; index: number }> = [];

    for (let i = 0; i < (resumes as ResumeBatchItem[]).length; i++) {
      const item = resumes[i];
      const resumeText = (item.text || item.rawResumeText || '').trim();
      if (resumeText) {
        validResumes.push({ item, text: resumeText, index: i });
      }
    }

    if (validResumes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'All provided resumes were empty.' },
        { status: 400 }
      );
    }

    // Process resumes in concurrent chunks of 3 to balance throughput and serverless latency
    const CONCURRENCY_LIMIT = 3;
    const classifiedCandidates: ClassifiedCandidate[] = [];

    for (let i = 0; i < validResumes.length; i += CONCURRENCY_LIMIT) {
      const chunk = validResumes.slice(i, i + CONCURRENCY_LIMIT);
      const chunkPromises = chunk.map(async ({ item, text: resumeText, index }) => {
        try {
          const evalResult = await evaluateFit({
            resumeText,
            jobDescriptionText,
            customWeights: customWeights as DimensionWeights | undefined,
            customQuestions: customQuestions as QuestionDefinition[] | undefined,
            customDimensions: customDimensions as Record<string, DimensionMeta> | undefined,
            apiKey: trimmedKey, // Fixed: Passes effectiveKey
            model: typeof model === 'string' ? model : undefined,
          });

          return {
            id: item.id || `candidate_${Date.now()}_${index}`,
            name: item.name || evalResult.candidateNameExtracted || `Candidate #${index + 1}`,
            email: item.email,
            targetRole: evalResult.jobTitleExtracted,
            rawResumeText: resumeText,
            status: 'completed' as const,
            compositeScore: evalResult.compositeScore,
            grade: evalResult.grade,
            tier: evalResult.tier,
            tierLabel: evalResult.tierLabel,
            recruiterVerdict: evalResult.recruiterVerdict,
            reasoningSummary: evalResult.reasoningSummary || '',
            quotedEvidence: evalResult.quotedEvidence || [],
            dimensions: evalResult.dimensions,
            evaluationResult: evalResult,
            shortlisted: false,
          };
        } catch (candidateErr: unknown) {
          console.error(`Failed to evaluate resume ${item.id || index}:`, candidateErr);
          const errMessage = candidateErr instanceof Error ? candidateErr.message : 'Unknown processing error';
          return {
            id: item.id || `candidate_${Date.now()}_${index}`,
            name: item.name || `Candidate #${index + 1}`,
            rawResumeText: resumeText,
            status: 'error' as const,
            compositeScore: 0,
            grade: 'D' as const,
            tier: 'gap_heavy' as const,
            tierLabel: 'Evaluation Failed',
            recruiterVerdict: 'Unlikely Fit' as const,
            reasoningSummary: 'Evaluation failed due to an error processing this resume.',
            quotedEvidence: [],
            dimensions: {} as unknown as ClassifiedCandidate['dimensions'],
            shortlisted: false,
            error: errMessage,
          } as ClassifiedCandidate;
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      classifiedCandidates.push(...chunkResults);
    }

    // Sort by composite score descending
    classifiedCandidates.sort((a, b) => b.compositeScore - a.compositeScore);

    return NextResponse.json({
      success: true,
      candidates: classifiedCandidates,
      totalEvaluated: classifiedCandidates.length,
    });
  } catch (error: unknown) {
    console.error('API /api/evaluate-batch error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during batch evaluation.';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
