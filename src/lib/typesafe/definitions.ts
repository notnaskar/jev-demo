import { DimensionId, DimensionMeta, QuestionDefinition } from '@/types/evaluation';
import { score, noul } from '@typesafe-ai/sdk';

export const DIMENSIONS: Record<DimensionId, DimensionMeta> = {
  technical: {
    id: 'technical',
    name: 'Technical Skills & Tools',
    shortName: 'Tech Stack',
    description: 'Core languages, modern frameworks, tooling, and transferable adjacent technologies.',
    color: 'from-blue-500 to-cyan-500',
    accentColor: '#38bdf8',
    iconName: 'Code2',
  },
  experience: {
    id: 'experience',
    name: 'Professional Experience & Domain',
    shortName: 'Experience',
    description: 'Seniority level, career progression, domain knowledge, and title relevance.',
    color: 'from-purple-500 to-indigo-500',
    accentColor: '#818cf8',
    iconName: 'Briefcase',
  },
  education: {
    id: 'education',
    name: 'Education & Certifications',
    shortName: 'Credentials',
    description: 'Degree requirements, formal certifications, and accredited technical training.',
    color: 'from-amber-500 to-orange-500',
    accentColor: '#fbbf24',
    iconName: 'GraduationCap',
  },
  soft_skills: {
    id: 'soft_skills',
    name: 'Leadership & Measurable Impact',
    shortName: 'Leadership & Impact',
    description: 'Engineering mentorship, cross-team influence, and quantifiable business outcomes.',
    color: 'from-emerald-500 to-teal-500',
    accentColor: '#34d399',
    iconName: 'Sparkles',
  },
};

export const QUESTION_DEFINITIONS: QuestionDefinition[] = [
  // --- Dimension: Technical Skills & Tools ---
  {
    id: 'technical_stack_fit',
    dimension: 'technical',
    kind: 'score',
    title: 'Core Tech Stack Alignment',
    instructions:
      "Evaluate how thoroughly the candidate's hands-on technical skills match the required programming languages, frameworks, and system infrastructure described in the job description.",
    criteria: [
      'No relevant stack technologies or languages mentioned in resume.',
      'Surface-level or passing exposure; only 1 or 2 minor peripheral tools mentioned.',
      'Solid working proficiency with the core required tech stack, libraries, and frameworks.',
      'Deep architectural mastery, core stack proficiency, modern best practices, and high-performance engineering.',
    ],
    maxLevels: 4,
    weightInDimension: 0.65,
  },
  {
    id: 'adjacent_technologies',
    dimension: 'technical',
    kind: 'noul',
    title: 'Transferable / Adjacent Tech Proficiency',
    instructions:
      'Does the candidate demonstrate strong proficiency in equivalent, modern alternative technologies or frameworks that easily transfer to this role?',
    criteria: {
      true: 'Candidate has deep experience with equivalent modern technologies (e.g. Vue/Svelte for React, Go/Rust for C++, GCP/Azure for AWS) that make skill transfer rapid.',
      false: 'No notable transferable modern alternative tech stack demonstrated.',
    },
    weightInDimension: 0.35,
  },

  // --- Dimension: Professional Experience & Domain Knowledge ---
  {
    id: 'experience_years_match',
    dimension: 'experience',
    kind: 'score',
    title: 'Seniority & Experience Baseline',
    instructions:
      "Assess how closely the candidate's total professional experience and seniority match the role's required tenure.",
    criteria: [
      'Far below required seniority baseline (e.g., junior candidate applying for staff/principal role).',
      'Slightly below target tenure, but exhibits strong potential and relevant project participation.',
      'Directly matches the required years of experience and seniority baseline expected for the position.',
      'Exceeds stated seniority with distinguished tenure, high autonomy, and proven leadership history.',
    ],
    maxLevels: 4,
    weightInDimension: 0.4,
  },
  {
    id: 'domain_industry_experience',
    dimension: 'experience',
    kind: 'score',
    title: 'Industry & Problem Domain Relevance',
    instructions:
      'Does the candidate have prior professional experience operating within the specific business domain or industry context called for in the job description?',
    criteria: [
      'Completely unrelated domain with no shared regulatory, technical, or customer dynamics.',
      'Peripheral domain overlap or generic consumer web experience with minimal domain complexity.',
      'Direct hands-on experience in the specific industry or very closely aligned business problem space.',
      'Deep vertical expertise, extensive regulatory familiarity, and track record solving specialized domain problems.',
    ],
    maxLevels: 4,
    weightInDimension: 0.35,
  },
  {
    id: 'relevant_role_history',
    dimension: 'experience',
    kind: 'noul',
    title: 'Equivalent Role or Scope of Responsibility',
    instructions:
      'Has the candidate held a directly equivalent job title or exercised equivalent operational scope in previous roles?',
    criteria: {
      true: 'Candidate has held equivalent titles (e.g. Senior Backend Engineer, Lead DevOps) and carried equal responsibility.',
      false: 'Past titles and scope were substantially different from this position.',
    },
    weightInDimension: 0.25,
  },

  // --- Dimension: Education & Certifications ---
  {
    id: 'degree_prerequisite_met',
    dimension: 'education',
    kind: 'noul',
    title: 'Degree Prerequisite Met',
    instructions:
      'Does the candidate possess the stated educational degree (e.g., Bachelor’s or Master’s in Computer Science, STEM, or recognized equivalent)?',
    criteria: {
      true: 'Candidate has the required university degree or an accredited higher education equivalent.',
      false: 'Candidate does not list the specified degree level or academic credential.',
    },
    weightInDimension: 0.6,
  },
  {
    id: 'certifications_credentials',
    dimension: 'education',
    kind: 'noul',
    title: 'Specialized Credentials & Certifications',
    instructions:
      'Does the candidate hold verified professional credentials, cloud certifications (e.g. AWS, CKA, GCP), or role-specific licenses?',
    criteria: {
      true: 'Lists active, recognized technical certifications or accredited industry specializations.',
      false: 'No notable professional certifications or accredited specializations listed.',
    },
    weightInDimension: 0.4,
  },

  // --- Dimension: Soft Skills, Leadership & Impact ---
  {
    id: 'leadership_mentorship',
    dimension: 'soft_skills',
    kind: 'noul',
    title: 'Team Leadership & Mentorship Evidence',
    instructions:
      'Does the candidate demonstrate evidence of mentoring junior engineers, leading project initiatives, or driving technical team decisions?',
    criteria: {
      true: 'Shows clear examples of formal or informal mentorship, leading agile sprints, architecture reviews, or cross-functional alignment.',
      false: 'Resume focuses strictly on individual task execution without leadership or mentoring evidence.',
    },
    weightInDimension: 0.45,
  },
  {
    id: 'quantifiable_impact',
    dimension: 'soft_skills',
    kind: 'score',
    title: 'Measurable Business & Engineering Impact',
    instructions:
      'How effectively does the candidate demonstrate quantifiable metrics and measurable business outcomes for their achievements?',
    criteria: [
      'Only lists passive duties and generic job responsibilities with zero outcome metrics.',
      'Mentions some achievements but lacks concrete numbers, percentages, or measurable indicators.',
      'Presents solid quantitative data (e.g., 40% latency reduction, $250k cloud cost savings, 1M+ active users handled).',
      'Exceptional quantified impact with extraordinary company-level ROI, major patent/open-source adoption, or 10x architectural scaling.',
    ],
    maxLevels: 4,
    weightInDimension: 0.55,
  },
];

export type TypeSafeQuestion = ReturnType<typeof score> | ReturnType<typeof noul>;

/**
 * Builds the questions object for the TypeSafe SDK client.systemOne call.
 */
export function buildTypeSafeQuestions(
  questionDefs?: QuestionDefinition[]
): Record<string, TypeSafeQuestion> {
  const questions: Record<string, TypeSafeQuestion> = {};
  const defs = questionDefs || QUESTION_DEFINITIONS;

  for (const q of defs) {
    if (q.enabled === false) continue;
    if (q.kind === 'score' && Array.isArray(q.criteria) && q.criteria.length >= 2) {
      questions[q.id] = score(q.instructions, q.criteria as [string, string, ...string[]]);
    } else if (q.kind === 'noul') {
      const criteriaObj =
        typeof q.criteria === 'object' && q.criteria !== null && !Array.isArray(q.criteria)
          ? (q.criteria as { true?: string; false?: string })
          : undefined;
      questions[q.id] = noul(q.instructions, criteriaObj);
    }
  }

  return questions;
}

