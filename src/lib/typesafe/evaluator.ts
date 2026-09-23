import { TypeSafeClient } from '@typesafe-ai/sdk';
import {
  DimensionMeta,
  DimensionScoreBreakdown,
  EvaluatedQuestionResult,
  EvaluationResult,
  HiddenGem,
  MissingRequirement,
  QuestionDefinition,
  QuotedEvidence,
} from '@/types/evaluation';
import { DimensionWeights, DEFAULT_WEIGHTS } from '@/types/scoring';
import { QUESTION_DEFINITIONS, buildTypeSafeQuestions } from './definitions';
import {
  buildDimensionBreakdowns,
  normalizeQuestionAnswer,
  recomputeCompositeScore,
} from '../scoring/calculator';

export interface EvaluatorOptions {
  resumeText: string;
  jobDescriptionText: string;
  customWeights?: DimensionWeights;
  customQuestions?: QuestionDefinition[];
  customDimensions?: Record<string, DimensionMeta>;
  apiKey?: string;
  model?: string;
}

/**
 * Extracts candidate name and job title from raw text for clear dashboard display.
 */
function extractMetaFromText(resumeText: string, jdText: string) {
  const jdFirstLines = jdText.split('\n').filter((l) => l.trim().length > 0);
  let jobTitle = 'Target Role';
  for (const line of jdFirstLines.slice(0, 5)) {
    if (/position:|role:|title:|hiring for/i.test(line)) {
      jobTitle = line.replace(/^(position|role|title|hiring for)\s*:?\s*/i, '').trim();
      break;
    } else if (line.length < 50 && /engineer|developer|architect|manager|lead|scientist/i.test(line)) {
      jobTitle = line.trim();
      break;
    }
  }

  const resumeFirstLines = resumeText.split('\n').filter((l) => l.trim().length > 0);
  let candidateName = 'Candidate';
  for (const line of resumeFirstLines.slice(0, 4)) {
    const cleaned = line.trim();
    if (cleaned.length > 2 && cleaned.length < 35 && !/@|http|resume|curriculum|phone|summary/i.test(cleaned)) {
      candidateName = cleaned.replace(/[^a-zA-Z\s.-]/g, '');
      break;
    }
  }

  return { jobTitle, candidateName };
}

/**
 * Extracts authentic candidate resume sentences/bullets to serve as direct quoted evidence.
 */
function deriveQuotedEvidence(
  resumeText: string,
  questionResults: EvaluatedQuestionResult[]
): QuotedEvidence[] {
  const lines = resumeText
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 30 && l.length < 280 && !/^header|^contact|^page/i.test(l));

  const evidence: QuotedEvidence[] = [];
  const usedLines = new Set<string>();

  for (const q of questionResults) {
    if (evidence.length >= 6) break;

    // Look for matching resume line based on keywords in question
    const keywords = q.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const matchedLine = lines.find(
      (line) => !usedLines.has(line) && keywords.some((kw) => line.toLowerCase().includes(kw))
    );

    if (matchedLine) {
      usedLines.add(matchedLine);
      evidence.push({
        id: `ev-${q.id}-${evidence.length + 1}`,
        quote: matchedLine.replace(/^[-•*]\s*/, ''),
        context: `Evaluated under ${q.title} (${Math.round(q.normalizedScore)}/100)`,
        dimensionId: q.dimension,
        dimensionName: q.title,
        sentiment: q.normalizedScore >= 70 ? 'positive' : q.normalizedScore < 50 ? 'gap' : 'highlight',
        impact: q.normalizedScore >= 85 ? 'critical' : 'high',
      });
    }
  }

  // Fallback: If fewer than 2 matched, pick the top impactful bullet points
  if (evidence.length < 2) {
    for (const line of lines) {
      if (evidence.length >= 4) break;
      if (!usedLines.has(line) && /built|designed|architected|led|managed|scaled|developed|reduced|increased|\d+%/i.test(line)) {
        usedLines.add(line);
        evidence.push({
          id: `ev-auto-${evidence.length + 1}`,
          quote: line.replace(/^[-•*]\s*/, ''),
          context: 'Key Career Accomplishment',
          dimensionId: 'technical',
          dimensionName: 'Technical Skills & Tools',
          sentiment: 'positive',
          impact: 'high',
        });
      }
    }
  }

  return evidence;
}

/**
 * Identifies requirements in the JD that are missing or weak based on TypeSafe question scores.
 */
function deriveMissingRequirements(
  questionResults: EvaluatedQuestionResult[]
): MissingRequirement[] {
  const gaps: MissingRequirement[] = [];

  for (const q of questionResults) {
    if (q.normalizedScore < 55) {
      gaps.push({
        id: `gap-${q.id}`,
        title: `Requirement Shortfall: ${q.title}`,
        dimension: q.dimension,
        severity: q.normalizedScore < 30 ? 'critical' : 'moderate',
        description: `TypeSafe evaluated this competency at ${Math.round(q.normalizedScore)}/100 based on the role instructions: "${q.instructions}"`,
        recommendation: `Provide verifiable accomplishments, technical deliverables, or credentials demonstrating proficiency in ${q.title}.`,
        confidence: q.confidence,
      });
    }
  }

  return gaps;
}

/**
 * Identifies standout strengths based on TypeSafe questions that scored exceptionally high.
 */
function deriveStandoutStrengths(questionResults: EvaluatedQuestionResult[]): HiddenGem[] {
  return questionResults
    .filter((q) => q.normalizedScore >= 85)
    .map((q) => ({
      id: `gem-${q.id}`,
      title: `Top-Tier Competency: ${q.title}`,
      category: 'architecture_leadership',
      description: `TypeSafe awarded a high-alignment score (${Math.round(q.normalizedScore)}/100) with strong confidence (${Math.round((q.confidence || 0.9) * 100)}%).`,
      highlightSnippet: q.instructions,
      valueProposition: `Demonstrates exceptional qualification exceeding standard expectations for the ${q.dimension} evaluation pillar.`,
      impactScore: Math.min(10, Math.max(7, Math.round(q.normalizedScore / 10))),
    }));
}

/**
 * Generates an executive synthesis reasoning paragraph for recruiters.
 */
function deriveExecutiveReasoning(
  candidateName: string,
  jobTitle: string,
  compositeScore: number,
  tierLabel: string,
  verdict: string,
  dimensions: Record<string, DimensionScoreBreakdown>
): string {
  const dimValues = Object.values(dimensions);
  const topDim = dimValues.slice().sort((a, b) => b.score - a.score)[0];
  const lowestDim = dimValues.slice().sort((a, b) => a.score - b.score)[0];

  const strongPart = topDim
    ? `Strongest pillar is ${topDim.name} (${topDim.score}/100)`
    : 'Evaluated across all role criteria';

  const gapPart =
    lowestDim && lowestDim.score < 60
      ? `, while ${lowestDim.name} (${lowestDim.score}/100) exhibits requirement shortfalls evaluated by TypeSafe`
      : ' with consistent execution across all dimensions';

  return `${candidateName} is evaluated as "${tierLabel}" (${compositeScore}/100) for the ${jobTitle} role via TypeSafe Jev System One. ${strongPart}${gapPart}. Recruiter recommendation: ${verdict}.`;
}

/**
 * Main evaluation orchestrator:
 * Executes TypeSafe System One Fan-Out, normalizes scores, computes composite score,
 * and generates dual persona breakdowns.
 */
export async function evaluateFit({
  resumeText,
  jobDescriptionText,
  customWeights,
  customQuestions,
  customDimensions,
  apiKey,
  model,
}: EvaluatorOptions): Promise<EvaluationResult> {
  const effectiveKey = apiKey || process.env.TYPESAFE_API_KEY;

  if (!effectiveKey || effectiveKey.trim() === '') {
    throw new Error(
      'TypeSafe API key is required to evaluate profiles. Please configure your API key in the settings modal or set the TYPESAFE_API_KEY environment variable.'
    );
  }

  const client = new TypeSafeClient({ apiKey: effectiveKey.trim() });
  const questionDefs = (customQuestions || QUESTION_DEFINITIONS).filter((q) => q.enabled !== false);
  const questionsPayload = buildTypeSafeQuestions(questionDefs);

  // Direct TypeSafe System One fan-out request
  type SystemOneParams = Parameters<typeof client.systemOne>[0];
  const response = await client.systemOne({
    state: {
      job_description: jobDescriptionText,
      candidate_resume: resumeText,
    },
    questions: questionsPayload as SystemOneParams['questions'],
    ...(model ? { model } : {}),
  });

  const rawAnswers = (response.answers || {}) as unknown as Record<string, Record<string, unknown>>;
  const resolvedModel = response.model || model || client.defaultModel;
  const tokenUsage = {
    input: response.usage?.input_tokens || 0,
    output: response.usage?.output_tokens || 0,
  };

  // Parse questions and normalize using TypeSafe answers
  const evaluatedQuestions: EvaluatedQuestionResult[] = [];
  for (const def of questionDefs) {
    const raw = rawAnswers[def.id] || {};
    let normalized = 50;
    const confidence = typeof raw.confidence === 'number' ? raw.confidence : 0.85;

    if (def.kind === 'score') {
      const rawScore = typeof raw.score === 'number' ? raw.score : 1.5;
      normalized = normalizeQuestionAnswer('score', rawScore, def.maxLevels || 4);
    } else {
      const rawNoul = typeof raw.noul === 'number' ? raw.noul : typeof raw.probability === 'number' ? raw.probability : 0.5;
      normalized = normalizeQuestionAnswer('noul', rawNoul);
    }

    evaluatedQuestions.push({
      id: def.id,
      dimension: def.dimension,
      kind: def.kind,
      title: def.title,
      instructions: def.instructions,
      normalizedScore: normalized,
      confidence,
      rawResult: raw,
    });
  }

  const weights = customWeights || DEFAULT_WEIGHTS;
  const initialDimensions = buildDimensionBreakdowns(
    evaluatedQuestions,
    weights,
    customDimensions,
    questionDefs
  );
  const composite = recomputeCompositeScore(initialDimensions, weights);

  const { jobTitle, candidateName } = extractMetaFromText(resumeText, jobDescriptionText);
  const hiddenGems = deriveStandoutStrengths(evaluatedQuestions);
  const missingRequirements = deriveMissingRequirements(evaluatedQuestions);
  const quotedEvidence = deriveQuotedEvidence(resumeText, evaluatedQuestions);
  const reasoningSummary = deriveExecutiveReasoning(
    candidateName,
    jobTitle,
    composite.compositeScore,
    composite.tierLabel,
    composite.recruiterVerdict,
    composite.updatedDimensions
  );

  return {
    id: `eval_${Date.now()}`,
    timestamp: new Date().toISOString(),
    model: resolvedModel,
    isLiveApi: true,
    tokensUsed: tokenUsage,
    jobTitleExtracted: jobTitle,
    candidateNameExtracted: candidateName,
    compositeScore: composite.compositeScore,
    grade: composite.grade,
    tier: composite.tier,
    tierLabel: composite.tierLabel,
    tierDescription: composite.tierDescription,
    recruiterVerdict: composite.recruiterVerdict,
    reasoningSummary,
    dimensions: composite.updatedDimensions,
    missingRequirements,
    hiddenGems,
    quotedEvidence,
    rawAnswers,
  };
}
