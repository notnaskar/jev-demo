export interface DimensionWeights {
  technical?: number;
  experience?: number;
  education?: number;
  soft_skills?: number;
  [dimensionId: string]: number | undefined;
}

export interface WeightPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  weights: DimensionWeights;
}

export const DEFAULT_WEIGHTS: DimensionWeights = {
  technical: 40,
  experience: 30,
  education: 15,
  soft_skills: 15,
};

export const WEIGHT_PRESETS: WeightPreset[] = [
  {
    id: 'balanced',
    name: 'Balanced Standard',
    badge: 'Recommended',
    description: 'Even distribution across technical, experience, education, and team impact.',
    weights: {
      technical: 35,
      experience: 35,
      education: 15,
      soft_skills: 15,
    },
  },
  {
    id: 'tech_heavy',
    name: 'Tech & Architecture First',
    badge: 'Senior IC',
    description: 'Prioritizes hard tech stack alignment and deep problem-solving over formal credentials.',
    weights: {
      technical: 50,
      experience: 25,
      education: 10,
      soft_skills: 15,
    },
  },
  {
    id: 'leadership',
    name: 'Staff & Lead Emphasis',
    badge: 'Engineering Lead',
    description: 'Heavy emphasis on mentorship, business impact, and demonstrable system ownership.',
    weights: {
      technical: 25,
      experience: 35,
      education: 10,
      soft_skills: 30,
    },
  },
  {
    id: 'domain_credentialed',
    name: 'Enterprise & Regulated',
    badge: 'Strict Roles',
    description: 'Emphasizes formal certifications, compliance background, and validated credentials.',
    weights: {
      technical: 30,
      experience: 30,
      education: 25,
      soft_skills: 15,
    },
  },
];
