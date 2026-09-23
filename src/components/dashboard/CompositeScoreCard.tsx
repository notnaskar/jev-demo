'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  User,
  Briefcase,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EvaluationResult } from '@/types/evaluation';

interface CompositeScoreCardProps {
  evaluation: EvaluationResult;
}

export function CompositeScoreCard({ evaluation }: CompositeScoreCardProps) {
  const [copied, setCopied] = useState(false);

  const {
    compositeScore,
    grade,
    tierLabel,
    tierDescription,
    recruiterVerdict,
    candidateNameExtracted,
    jobTitleExtracted,
    model,
    isLiveApi,
    dimensions,
    missingRequirements,
    hiddenGems,
  } = evaluation;

  const handleCopySummary = () => {
    const summaryText = `FitLens AI Candidate Evaluation Summary:
• Candidate: ${candidateNameExtracted || 'Candidate'}
• Target Role: ${jobTitleExtracted || 'Role'}
• Composite Fit: ${compositeScore}% (Grade: ${grade})
• Classification: ${tierLabel}
• Recruiter Recommendation: ${recruiterVerdict}
• Technical Stack: ${dimensions?.technical?.score || 0}%
• Experience Fit: ${dimensions?.experience?.score || 0}%
• Identified Gaps: ${missingRequirements?.length || 0}
• Discovered Superpowers: ${hiddenGems?.length || 0}
• Engine: TypeSafe ${model} (${isLiveApi ? 'Live API' : 'Studio Engine'})`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Circular gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (compositeScore / 100) * circumference;

  const getScoreColor = () => {
    if (compositeScore >= 80) return '#059669'; // Emerald 600
    if (compositeScore >= 65) return '#0284c7'; // Sky 600
    if (compositeScore >= 50) return '#d97706'; // Amber 600
    return '#e11d48'; // Rose 600
  };

  const getVerdictStyle = () => {
    switch (recruiterVerdict) {
      case 'Fast-Track Interview':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Proceed to Screening':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Evaluate Gaps with Team':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  return (
    <Card className="p-6 bg-white border border-slate-200/90 shadow-sm rounded-xl space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="p-1.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
              <User className="w-4 h-4" />
            </span>
            <h2 className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
              {candidateNameExtracted || 'Evaluated Candidate'}
            </h2>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>{jobTitleExtracted || 'Target Role'}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Synthesized across 4 discrete pillars via TypeSafe Jev System One
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge
            variant={isLiveApi ? 'success' : 'secondary'}
            className="font-mono text-xs px-2.5 py-1"
          >
            {isLiveApi ? '● Live Jev API' : '● Interactive Studio'}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            className="gap-1.5 text-xs h-8"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Summary</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Metric Cockpit */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Clean SVG Radial Gauge (4 cols) */}
        <div className="md:col-span-4 flex items-center gap-5 p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl">
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke="#e2e8f0"
                strokeWidth="9"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke={getScoreColor()}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-mono text-slate-900 leading-none">
                {compositeScore}%
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mt-0.5">
                Fit Score
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-xs font-bold font-mono">
                Grade {grade}
              </span>
              <span className="text-xs font-semibold text-slate-700">{tierLabel}</span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
              {tierDescription}
            </p>
          </div>
        </div>

        {/* Center: Recruiter Recommendation Banner (4 cols) */}
        <div className="md:col-span-4 p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide font-mono">
              Recruiter Action
            </span>
            {recruiterVerdict === 'Fast-Track Interview' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : recruiterVerdict === 'Proceed to Screening' ? (
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
            ) : recruiterVerdict === 'Evaluate Gaps with Team' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600" />
            )}
          </div>

          <div className={`p-2.5 rounded-lg border text-xs font-bold text-center ${getVerdictStyle()}`}>
            {recruiterVerdict}
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            Weighted composite recommendation ready for hiring panel.
          </p>
        </div>

        {/* Right: Quick KPI Stat Strip (4 cols) */}
        <div className="md:col-span-4 grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">
              Tech Stack
            </span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {dimensions?.technical?.score || 0}%
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">
              Experience
            </span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {dimensions?.experience?.score || 0}%
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">
              Gaps Identified
            </span>
            <span className="text-lg font-bold text-amber-700 font-mono">
              {missingRequirements?.length || 0}
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">
              Superpowers
            </span>
            <span className="text-lg font-bold text-sky-700 font-mono">
              {hiddenGems?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
