export type DimensionId = 'technical' | 'experience' | 'education' | 'soft_skills' | (string & {});

export interface DimensionMeta {
  id: DimensionId;
  name: string;
  shortName: string;
  description: string;
  color: string; // Tailwind color token or hex
  accentColor: string;
  iconName: string;
  defaultWeight?: number;
  isCustom?: boolean;
}

export type QuestionKind = 'score' | 'noul';

export interface QuestionDefinition {
  id: string;
  dimension: DimensionId;
  kind: QuestionKind;
  title: string;
  instructions: string;
  criteria?: string[] | { true?: string; false?: string };
  maxLevels?: number; // for score
  weightInDimension: number; // relative weight within its dimension (0-1)
  enabled?: boolean;
  isCustom?: boolean;
}

export interface EvaluatedQuestionResult {
  id: string;
  dimension: DimensionId;
  kind: QuestionKind;
  title: string;
  instructions: string;
  normalizedScore: number; // 0 to 100
  confidence: number; // 0 to 1
  rawResult: {
    score?: number;
    noul?: number;
    probabilities?: Record<string, number>;
    legend?: Record<string, string>;
  };
  matchedCriteriaLabel?: string;
  signals?: string[];
}

export interface DimensionScoreBreakdown {
  dimension: DimensionId;
  name: string;
  score: number; // 0 to 100
  weight: number; // percentage (e.g. 40)
  weightedContribution: number; // score * (weight / 100)
  confidence: number; // average confidence 0 to 1
  questions: EvaluatedQuestionResult[];
  status: 'strong' | 'good' | 'average' | 'weak';
}

export interface MissingRequirement {
  id: string;
  title: string;
  dimension: DimensionId;
  severity: 'critical' | 'moderate' | 'minor';
  description: string;
  recommendation: string;
  confidence: number;
}

export interface HiddenGem {
  id: string;
  title: string;
  category: 'unrequested_tech' | 'architecture_leadership' | 'domain_velocity' | 'impact_metric';
  description: string;
  highlightSnippet: string;
  valueProposition: string;
  impactScore: number; // 1 to 10
}

export interface QuotedEvidence {
  id: string;
  quote: string;
  context: string;
  dimensionId: DimensionId;
  dimensionName: string;
  sentiment: 'positive' | 'gap' | 'highlight';
  impact: 'critical' | 'high' | 'medium';
}

export interface EvaluationResult {
  id: string;
  timestamp: string;
  model: string;
  tokensUsed?: { input: number; output: number };
  isLiveApi: boolean;
  jobTitleExtracted?: string;
  candidateNameExtracted?: string;
  compositeScore: number; // 0 to 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  tier: 'exceptional' | 'strong' | 'moderate' | 'gap_heavy';
  tierLabel: string;
  tierDescription: string;
  recruiterVerdict: 'Fast-Track Interview' | 'Proceed to Screening' | 'Evaluate Gaps with Team' | 'Unlikely Fit';
  reasoningSummary?: string;
  dimensions: Record<DimensionId, DimensionScoreBreakdown>;
  missingRequirements: MissingRequirement[];
  hiddenGems: HiddenGem[];
  quotedEvidence?: QuotedEvidence[];
  rawAnswers: Record<string, unknown>;
}

export interface ClassifiedCandidate {
  id: string;
  name: string;
  email?: string;
  targetRole?: string;
  rawResumeText: string;
  status: 'idle' | 'evaluating' | 'completed' | 'error';
  compositeScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  tier: 'exceptional' | 'strong' | 'moderate' | 'gap_heavy';
  tierLabel: string;
  recruiterVerdict: 'Fast-Track Interview' | 'Proceed to Screening' | 'Evaluate Gaps with Team' | 'Unlikely Fit';
  reasoningSummary: string;
  quotedEvidence: QuotedEvidence[];
  dimensions: Record<DimensionId, DimensionScoreBreakdown>;
  evaluationResult?: EvaluationResult;
  shortlisted?: boolean;
  error?: string;
}

export interface EvaluationRequest {
  resumeText: string;
  jobDescriptionText: string;
  model?: string;
}

