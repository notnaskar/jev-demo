'use client';

import React, { useState } from 'react';
import {
  Code2,
  Briefcase,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DimensionId, DimensionScoreBreakdown } from '@/types/evaluation';
import { DIMENSIONS } from '@/lib/typesafe/definitions';

interface DimensionBreakdownProps {
  dimensions: Record<DimensionId, DimensionScoreBreakdown>;
}

export function DimensionBreakdown({ dimensions }: DimensionBreakdownProps) {
  const [expandedDim, setExpandedDim] = useState<DimensionId | null>('technical');

  const getDimensionIcon = (dimId: DimensionId) => {
    switch (dimId) {
      case 'technical':
        return <Code2 className="w-4 h-4 text-sky-600" />;
      case 'experience':
        return <Briefcase className="w-4 h-4 text-indigo-600" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-amber-600" />;
      case 'soft_skills':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getDimensionProgressColor = (dimId: DimensionId) => {
    switch (dimId) {
      case 'technical':
        return 'bg-sky-600';
      case 'experience':
        return 'bg-indigo-600';
      case 'education':
        return 'bg-amber-600';
      case 'soft_skills':
        return 'bg-emerald-600';
    }
  };

  const dimKeys: DimensionId[] = ['technical', 'experience', 'education', 'soft_skills'];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-900 tracking-tight">
            Evaluation Pillars Breakdown
          </h3>
          <p className="text-xs text-slate-500">
            Independent criteria scores and active weighted contributions:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dimKeys.map((dimId) => {
          const breakdown = dimensions[dimId];
          const meta = DIMENSIONS[dimId];
          if (!breakdown) return null;

          const isExpanded = expandedDim === dimId;

          const statusBadgeVariant =
            breakdown.status === 'strong'
              ? 'success'
              : breakdown.status === 'good'
              ? 'default'
              : breakdown.status === 'average'
              ? 'warning'
              : 'destructive';

          return (
            <Card
              key={dimId}
              className="border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    {getDimensionIcon(dimId)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">{meta.name}</h4>
                    <span className="text-[11px] text-slate-500 block line-clamp-1">
                      {meta.description}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xl font-bold text-slate-900 font-mono">
                    {breakdown.score}%
                  </span>
                  <Badge variant={statusBadgeVariant} className="text-[10px] px-2 py-0 uppercase">
                    {breakdown.status}
                  </Badge>
                </div>
              </div>

              {/* Progress Bar & Contribution */}
              <div className="space-y-1.5">
                <Progress
                  value={breakdown.score}
                  indicatorClassName={getDimensionProgressColor(dimId)}
                  className="h-2 bg-slate-100"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
                  <span>Weight: {breakdown.weight}%</span>
                  <span className="text-slate-900 font-semibold">
                    +{breakdown.weightedContribution.toFixed(1)} pts
                  </span>
                </div>
              </div>

              {/* Expand Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedDim(isExpanded ? null : dimId)}
                className="w-full justify-between text-xs text-slate-600 hover:text-slate-900 border-t border-slate-100 rounded-none pt-3 mt-1 h-auto"
              >
                <span>
                  {isExpanded ? 'Hide' : 'Inspect'} {breakdown.questions.length} Criteria Details
                </span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </Button>

              {/* Sub-Questions Inspection */}
              {isExpanded && (
                <div className="pt-2 space-y-2.5 animate-in fade-in duration-200">
                  {breakdown.questions.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-lg space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900">{q.title}</span>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {q.instructions}
                          </p>
                        </div>
                        <div className="flex flex-col items-end shrink-0 gap-1">
                          <span className="font-bold text-slate-900 font-mono text-sm">
                            {q.normalizedScore}%
                          </span>
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 uppercase">
                            {q.kind === 'score' ? 'Score' : 'Probability'}
                          </Badge>
                        </div>
                      </div>

                      {/* Mini Bar & Confidence */}
                      <div className="flex items-center gap-3 pt-1">
                        <Progress
                          value={q.normalizedScore}
                          className="h-1.5 flex-1 bg-slate-200"
                          indicatorClassName="bg-slate-700"
                        />
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 shrink-0">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Conf: {Math.round(q.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
