'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CompositeScoreCard } from '@/components/dashboard/CompositeScoreCard';
import { DimensionBreakdown } from '@/components/dashboard/DimensionBreakdown';
import { GapAnalysisView } from '@/components/dashboard/GapAnalysisView';
import { FitRadarChart } from '@/components/dashboard/FitRadarChart';
import { DocumentInput } from '@/components/input/DocumentInput';
import { EvaluationResult } from '@/types/evaluation';
import { DEFAULT_WEIGHTS } from '@/types/scoring';
import { SAMPLE_PRESETS, SamplePreset } from '@/lib/presets/sample-data';
import {
  UserCheck,
  AlertCircle,
  Lightbulb,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface CandidateFitCheckerProps {
  isConfigured?: boolean;
  onOpenKeyModal?: () => void;
}

export function CandidateFitChecker({ isConfigured, onOpenKeyModal }: CandidateFitCheckerProps) {
  // Input states initialized with sample preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SAMPLE_PRESETS[0].id);
  const [jobDescriptionText, setJobDescriptionText] = useState<string>(SAMPLE_PRESETS[0].jobDescription);
  const [resumeText, setResumeText] = useState<string>(SAMPLE_PRESETS[0].resume);

  // Evaluation states
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPreset = (preset: SamplePreset) => {
    setSelectedPresetId(preset.id);
    setJobDescriptionText(preset.jobDescription);
    setResumeText(preset.resume);
  };

  const handleAnalyze = async () => {
    if (!isConfigured) {
      setErrorMsg('TypeSafe API key is required to evaluate profiles. Please configure your key in the settings modal.');
      if (onOpenKeyModal) onOpenKeyModal();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescriptionText,
          resumeText,
          customWeights: DEFAULT_WEIGHTS,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete evaluation');
      }

      setEvaluation(data.evaluation);

      if (data.evaluation.compositeScore >= 80) {
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.6 },
          colors: ['#0284c7', '#6366f1', '#10b981', '#f59e0b'],
        });
      }
    } catch (err: unknown) {
      console.error('Candidate analysis failed:', err);
      const message = err instanceof Error ? err.message : 'Something went wrong during evaluation.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Free Candidate Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 border border-indigo-100/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Candidate Resume Fit &amp; Tailoring Diagnostic
              </h2>
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] py-0">
                100% Free for Applicants
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Check how your resume scores against any job description, pinpoint missing criteria, and unlock interview talking points.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Private &amp; Anonymous Evaluation</span>
        </div>
      </div>

      {/* Input Workbench (Single Resume vs Target JD) */}
      <section>
        <DocumentInput
          jobDescriptionText={jobDescriptionText}
          setJobDescriptionText={setJobDescriptionText}
          resumeText={resumeText}
          setResumeText={setResumeText}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          onSelectPreset={handleSelectPreset}
          selectedPresetId={selectedPresetId}
        />
      </section>

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
            ✕
          </button>
        </div>
      )}

      {/* Evaluation Results Section */}
      {evaluation && (
        <section className="space-y-6 pt-1 animate-in fade-in duration-300">
          {/* Executive Summary Card */}
          <CompositeScoreCard evaluation={evaluation} />

          {/* Actionable Tailoring Recommendations Banner */}
          <Card className="p-5 bg-amber-50/70 border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wider font-mono">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              Candidate Optimization Tip: Google XYZ Formula
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Recruiters and automated screeners reward quantified achievements over passive task descriptions. Rewrite bullet points using:
              <span className="font-mono font-bold text-amber-950 ml-1">
                &quot;Accomplished [X], as measured by [Y], by doing [Z]&quot;
              </span>
              . Focus on latency, revenue, cost savings, or user adoption.
            </p>
          </Card>

          {/* Visual Alignment & Pillars */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Radar Alignment Chart (5 cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-20">
              <Card className="p-5 bg-white border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="p-1.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                      Your Dimensional Alignment Radar
                    </h4>
                    <p className="text-xs text-slate-500">
                      How your skills align against target role requirements
                    </p>
                  </div>
                </div>

                <FitRadarChart dimensions={evaluation.dimensions} />
              </Card>
            </div>

            {/* Dimensional Pillars Breakdown (7 cols) */}
            <div className="lg:col-span-7">
              <DimensionBreakdown dimensions={evaluation.dimensions} />
            </div>
          </div>

          {/* Gap Analysis & Standout Highlights */}
          <GapAnalysisView
            hiddenGems={evaluation.hiddenGems}
            missingRequirements={evaluation.missingRequirements}
            activePersona="candidate"
          />
        </section>
      )}
    </div>
  );
}
