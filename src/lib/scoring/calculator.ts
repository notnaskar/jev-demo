import {
  DimensionId,
  DimensionMeta,
  DimensionScoreBreakdown,
  EvaluatedQuestionResult,
  QuestionDefinition,
} from '@/types/evaluation';
import { DimensionWeights, DEFAULT_WEIGHTS } from '@/types/scoring';
import { DIMENSIONS, QUESTION_DEFINITIONS } from '../typesafe/definitions';

/**
 * Normalizes user-specified weights so they sum to 100%.
 */
export function normalizeWeights(weights: DimensionWeights): DimensionWeights {
  const keys = Object.keys(weights);
  if (keys.length === 0) {
    return { ...DEFAULT_WEIGHTS };
  }

  let total = 0;
  for (const k of keys) {
    total += weights[k] || 0;
  }

  if (total <= 0) {
    return { ...DEFAULT_WEIGHTS };
  }

  const normalized: DimensionWeights = {};
  for (const k of keys) {
    normalized[k] = Math.round(((weights[k] || 0) / total) * 100);
  }
  return normalized;
}

/**
 * Normalizes a raw Score or Noul answer into a standard 0 to 100 score.
 */
export function normalizeQuestionAnswer(
  kind: 'score' | 'noul',
  rawValue: number,
  maxLevels: number = 4
): number {
  if (kind === 'score') {
    const denom = Math.max(1, maxLevels - 1);
    const clamped = Math.max(0, Math.min(denom, rawValue));
    return Math.round((clamped / denom) * 100);
  } else {
    // noul probability is 0 to 1
    const clamped = Math.max(0, Math.min(1, rawValue));
    return Math.round(clamped * 100);
  }
}

/**
 * Maps composite score to a letter grade.
 */
export function getGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' {
  if (score >= 92) return 'A+';
  if (score >= 82) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  return 'D';
}

/**
 * Derives tier and recruiter verdict from composite score.
 */
export function getTierInfo(score: number): {
  tier: 'exceptional' | 'strong' | 'moderate' | 'gap_heavy';
  tierLabel: string;
  tierDescription: string;
  recruiterVerdict: 'Fast-Track Interview' | 'Proceed to Screening' | 'Evaluate Gaps with Team' | 'Unlikely Fit';
} {
  if (score >= 88) {
    return {
      tier: 'exceptional',
      tierLabel: 'Top Tier Standout',
      tierDescription: 'Exceptional match with standout technical capability and validated career impact.',
      recruiterVerdict: 'Fast-Track Interview',
    };
  } else if (score >= 74) {
    return {
      tier: 'strong',
      tierLabel: 'Strong Contender',
      tierDescription: 'Solid alignment across primary requirements; strong candidate for standard pipeline.',
      recruiterVerdict: 'Proceed to Screening',
    };
  } else if (score >= 58) {
    return {
      tier: 'moderate',
      tierLabel: 'Moderate Fit / Transferable',
      tierDescription: 'Good baseline with a few notable requirement gaps or adjacent skill translations needed.',
      recruiterVerdict: 'Evaluate Gaps with Team',
    };
  } else {
    return {
      tier: 'gap_heavy',
      tierLabel: 'Substantial Gaps',
      tierDescription: 'Significant variance from core stack, experience requirements, or credentials.',
      recruiterVerdict: 'Unlikely Fit',
    };
  }
}

/**
 * Recalculates the composite score dynamically based on answers and adjustable weights.
 * This runs completely client-side in sub-millisecond time.
 */
export function recomputeCompositeScore(
  dimensions: Record<DimensionId, DimensionScoreBreakdown>,
  weights: DimensionWeights
): {
  compositeScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  tier: 'exceptional' | 'strong' | 'moderate' | 'gap_heavy';
  tierLabel: string;
  tierDescription: string;
  recruiterVerdict: 'Fast-Track Interview' | 'Proceed to Screening' | 'Evaluate Gaps with Team' | 'Unlikely Fit';
  updatedDimensions: Record<DimensionId, DimensionScoreBreakdown>;
} {
  const normWeights = normalizeWeights(weights);

  let totalWeightedScore = 0;
  const updatedDimensions = { ...dimensions };

  const dimKeys = Array.from(new Set([...Object.keys(dimensions), ...Object.keys(normWeights)]));

  for (const dim of dimKeys) {
    const dimBreakdown = dimensions[dim];
    const weight = normWeights[dim] || 0;
    const score = dimBreakdown ? dimBreakdown.score : 0;
    const weightedContribution = Math.round(score * (weight / 100));

    totalWeightedScore += weightedContribution;

    if (dimBreakdown) {
      updatedDimensions[dim] = {
        ...dimBreakdown,
        weight,
        weightedContribution,
      };
    }
  }

  const compositeScore = Math.max(0, Math.min(100, Math.round(totalWeightedScore)));
  const grade = getGrade(compositeScore);
  const tierInfo = getTierInfo(compositeScore);

  return {
    compositeScore,
    grade,
    ...tierInfo,
    updatedDimensions,
  };
}

/**
 * Builds the initial dimensions breakdown from raw question answers.
 */
export function buildDimensionBreakdowns(
  questionResults: EvaluatedQuestionResult[],
  weights: DimensionWeights,
  customDimensions?: Record<string, DimensionMeta>,
  customQuestionDefs?: QuestionDefinition[]
): Record<DimensionId, DimensionScoreBreakdown> {
  const normWeights = normalizeWeights(weights);
  const result: Record<string, DimensionScoreBreakdown> = {};

  const allMetas: Record<string, DimensionMeta> = { ...DIMENSIONS, ...(customDimensions || {}) };
  const allQuestionDefs = customQuestionDefs || QUESTION_DEFINITIONS;

  // Find all dimensions that appear in either question results, metas, or weights
  const presentDims = new Set<string>([
    ...questionResults.map((q) => q.dimension),
    ...Object.keys(allMetas),
    ...Object.keys(normWeights),
  ]);

  for (const dimId of presentDims) {
    const meta = allMetas[dimId] || {
      id: dimId,
      name: dimId.charAt(0).toUpperCase() + dimId.slice(1).replace(/_/g, ' '),
      shortName: dimId,
      description: 'Custom evaluation dimension',
    };

    const dimQuestions = questionResults.filter((q) => q.dimension === dimId);

    let dimScore = 0;
    let confidenceSum = 0;

    if (dimQuestions.length > 0) {
      let weightSum = 0;
      for (const q of dimQuestions) {
        const def = allQuestionDefs.find((d: QuestionDefinition) => d.id === q.id);
        const qWeight = def?.weightInDimension ?? (1 / dimQuestions.length);
        dimScore += q.normalizedScore * qWeight;
        confidenceSum += q.confidence;
        weightSum += qWeight;
      }
      dimScore = Math.round(dimScore / (weightSum || 1));
      confidenceSum = confidenceSum / dimQuestions.length;
    }

    const weight = normWeights[dimId] || 0;
    const weightedContribution = Math.round(dimScore * (weight / 100));

    let status: 'strong' | 'good' | 'average' | 'weak' = 'average';
    if (dimScore >= 80) status = 'strong';
    else if (dimScore >= 65) status = 'good';
    else if (dimScore >= 45) status = 'average';
    else status = 'weak';

    result[dimId] = {
      dimension: dimId,
      name: meta.name,
      score: dimScore,
      weight,
      weightedContribution,
      confidence: Math.round(confidenceSum * 100) / 100,
      questions: dimQuestions,
      status,
    };
  }

  return result as Record<DimensionId, DimensionScoreBreakdown>;
}
