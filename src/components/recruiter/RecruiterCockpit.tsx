'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WeightingSliders } from '@/components/dashboard/WeightingSliders';
import { BulkUploadZone } from './BulkUploadZone';
import { CandidateLeaderboard } from './CandidateLeaderboard';
import { CandidateDossierModal } from './CandidateDossierModal';
import { CriteriaCustomizerModal } from './CriteriaCustomizerModal';
import { ClassifiedCandidate, DimensionMeta, QuestionDefinition } from '@/types/evaluation';
import { DimensionWeights, DEFAULT_WEIGHTS } from '@/types/scoring';
import { DIMENSIONS, QUESTION_DEFINITIONS } from '@/lib/typesafe/definitions';
import { SAMPLE_PRESETS, SAMPLE_CANDIDATE_POOL, SamplePreset } from '@/lib/presets/sample-data';
import { recomputeCompositeScore } from '@/lib/scoring/calculator';
import { Briefcase, AlertCircle, X } from 'lucide-react';

interface RecruiterCockpitProps {
  isConfigured?: boolean;
  onOpenKeyModal?: () => void;
}

export function RecruiterCockpit({ isConfigured, onOpenKeyModal }: RecruiterCockpitProps) {
  // Target Job Description State
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SAMPLE_PRESETS[0].id);
  const [jobDescriptionText, setJobDescriptionText] = useState<string>(SAMPLE_PRESETS[0].jobDescription);
  const [isEditingJD, setIsEditingJD] = useState(false);

  // Criteria & Questions state (customizable)
  const [categories, setCategories] = useState<Record<string, DimensionMeta>>({ ...DIMENSIONS });
  const [questions, setQuestions] = useState<QuestionDefinition[]>([...QUESTION_DEFINITIONS]);
  const [weights, setWeights] = useState<DimensionWeights>({ ...DEFAULT_WEIGHTS });
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);

  // Candidate Data State
  const [candidates, setCandidates] = useState<ClassifiedCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<ClassifiedCandidate | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Preset selection
  const handleSelectPreset = (preset: SamplePreset) => {
    setSelectedPresetId(preset.id);
    setJobDescriptionText(preset.jobDescription);
  };

  // Evaluate batch of resumes against the current JD and schema
  const handleClassifyBatch = async (
    resumesToScore: Array<{ id: string; name?: string; text: string }>
  ) => {
    if (!isConfigured) {
      setErrorMsg('TypeSafe API key is required to evaluate profiles. Please configure your API key in the settings modal.');
      if (onOpenKeyModal) onOpenKeyModal();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/evaluate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescriptionText,
          resumes: resumesToScore,
          customWeights: weights,
          customQuestions: questions,
          customDimensions: categories,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to classify resumes.');
      }

      setCandidates(data.candidates);

      // Trigger celebratory confetti if any candidate hit >= 85
      if (data.candidates.some((c: ClassifiedCandidate) => c.compositeScore >= 85)) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0284c7', '#6366f1', '#10b981', '#f59e0b'],
        });
      }
    } catch (err: unknown) {
      console.error('Classification error:', err);
      const message = err instanceof Error ? err.message : 'Something went wrong during batch evaluation.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Load Sample Applicant Pool
  const handleLoadSamplePool = () => {
    const formatted = SAMPLE_CANDIDATE_POOL.map((c) => ({
      id: c.id,
      name: c.name,
      text: c.resume,
    }));
    handleClassifyBatch(formatted);
  };

  // Real-time client-side reweighting across all classified candidates!
  const handleWeightsChange = (newWeights: DimensionWeights) => {
    setWeights(newWeights);

    if (candidates.length === 0) return;

    // Recalculate scores client-side instantly
    const updated = candidates.map((cand) => {
      if (!cand.dimensions) return cand;

      const recalculated = recomputeCompositeScore(cand.dimensions, newWeights);

      return {
        ...cand,
        compositeScore: recalculated.compositeScore,
        grade: recalculated.grade,
        tier: recalculated.tier,
        tierLabel: recalculated.tierLabel,
        recruiterVerdict: recalculated.recruiterVerdict,
        dimensions: recalculated.updatedDimensions,
      };
    });

    // Sort descending by new composite score
    updated.sort((a, b) => b.compositeScore - a.compositeScore);
    setCandidates(updated);
  };

  // Save updated categories, questions, and weights from the manager modal
  const handleSaveCriteria = (
    newCategories: Record<string, DimensionMeta>,
    newQuestions: QuestionDefinition[],
    newWeights: DimensionWeights
  ) => {
    setCategories(newCategories);
    setQuestions(newQuestions);
    handleWeightsChange(newWeights);
  };

  // Toggle candidate shortlist
  const handleToggleShortlist = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, shortlisted: !c.shortlisted } : c))
    );

    if (selectedCandidate && selectedCandidate.id === id) {
      setSelectedCandidate((prev) => (prev ? { ...prev, shortlisted: !prev.shortlisted } : null));
    }
  };

  // View candidate dossier
  const handleSelectCandidate = (candidate: ClassifiedCandidate) => {
    setSelectedCandidate(candidate);
    setIsDossierOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Criteria & Questions Customizer Modal */}
      <CriteriaCustomizerModal
        isOpen={isCriteriaModalOpen}
        onClose={() => setIsCriteriaModalOpen(false)}
        categories={categories}
        questions={questions}
        weights={weights}
        onSaveCriteria={handleSaveCriteria}
      />

      {/* Candidate Dossier Deep-Dive Modal */}
      <CandidateDossierModal
        candidate={selectedCandidate}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onToggleShortlist={handleToggleShortlist}
      />

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-600 hover:text-rose-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section 1: Target Role & Job Description Workbench */}
      <Card className="p-5 bg-white border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Briefcase className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Target Role &amp; Evaluation Benchmark
              </h3>
              <p className="text-xs text-slate-500">
                Job requirements benchmark against which candidate resumes will be classified.
              </p>
            </div>
          </div>

          {/* Quick preset selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-mono">Role Preset:</span>
            {SAMPLE_PRESETS.map((p) => (
              <Button
                key={p.id}
                variant={selectedPresetId === p.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSelectPreset(p)}
                className="text-xs h-7 px-2.5"
              >
                {p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}
              </Button>
            ))}
          </div>
        </div>

        {/* JD Text Display / Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Target Job Description</span>
            <button
              onClick={() => setIsEditingJD(!isEditingJD)}
              className="text-sky-600 hover:text-sky-800 text-[11px] font-medium cursor-pointer"
            >
              {isEditingJD ? 'Done Editing' : 'Edit Job Description Text'}
            </button>
          </div>

          {isEditingJD ? (
            <Textarea
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
              className="text-xs min-h-[120px] font-mono leading-relaxed"
            />
          ) : (
            <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-lg text-xs font-mono text-slate-700 line-clamp-3 leading-relaxed">
              {jobDescriptionText}
            </div>
          )}
        </div>
      </Card>

      {/* Section 2: Weighting Sliders & Criteria Customization */}
      <WeightingSliders
        weights={weights}
        categories={categories}
        onWeightsChange={handleWeightsChange}
        onOpenCriteriaManager={() => setIsCriteriaModalOpen(true)}
      />

      {/* Section 3: Bulk Resume Upload Zone */}
      <BulkUploadZone
        onClassifyBatch={handleClassifyBatch}
        onLoadSamplePool={handleLoadSamplePool}
        isLoading={isLoading}
      />

      {/* Section 4: Classified Candidate Leaderboard */}
      <CandidateLeaderboard
        candidates={candidates}
        onSelectCandidate={handleSelectCandidate}
        onToggleShortlist={handleToggleShortlist}
        onLoadSamplePool={handleLoadSamplePool}
        isLoading={isLoading}
      />
    </div>
  );
}
