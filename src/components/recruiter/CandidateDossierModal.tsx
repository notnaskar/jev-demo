'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ClassifiedCandidate } from '@/types/evaluation';
import {
  Sparkles,
  Quote,
  CheckCircle2,
  AlertTriangle,
  Star,
  FileText,
  TrendingUp,
} from 'lucide-react';

interface CandidateDossierModalProps {
  candidate: ClassifiedCandidate | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleShortlist: (id: string) => void;
}

export function CandidateDossierModal({
  candidate,
  isOpen,
  onClose,
  onToggleShortlist,
}: CandidateDossierModalProps) {
  const [showFullResume, setShowFullResume] = useState(false);

  if (!candidate) return null;

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
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

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-500 text-white';
      case 'B':
        return 'bg-sky-500 text-white';
      case 'C':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-rose-500 text-white';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <DialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {candidate.name}
                </DialogTitle>
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${getGradeColor(
                    candidate.grade
                  )}`}
                >
                  {candidate.grade}
                </div>
                <Badge
                  variant="outline"
                  className={`font-semibold text-xs px-2.5 py-0.5 border ${getVerdictStyle(
                    candidate.recruiterVerdict
                  )}`}
                >
                  {candidate.recruiterVerdict}
                </Badge>
              </div>

              <DialogDescription className="text-xs text-slate-500 flex items-center gap-3">
                <span>{candidate.targetRole || 'Applicant'}</span>
                {candidate.email && <span>• {candidate.email}</span>}
                <span>• Candidate ID: {candidate.id.slice(0, 14)}</span>
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant={candidate.shortlisted ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToggleShortlist(candidate.id)}
                className={`text-xs gap-1.5 ${
                  candidate.shortlisted
                    ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                    : 'text-slate-700'
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    candidate.shortlisted ? 'fill-white text-white' : 'text-slate-400'
                  }`}
                />
                {candidate.shortlisted ? 'Shortlisted' : 'Shortlist Candidate'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Dossier Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Executive Recruiter Summary */}
          <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-950 uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Executive Recruiter Assessment
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              {candidate.reasoningSummary}
            </p>
          </div>

          {/* Direct Quoted Evidence from Resume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Direct Quoted Evidence from Resume ({candidate.quotedEvidence.length})
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Exact text matches from candidate application
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {candidate.quotedEvidence.map((quoteItem) => {
                const isGap = quoteItem.sentiment === 'gap';

                return (
                  <Card
                    key={quoteItem.id}
                    className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                      isGap
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-slate-50/70 border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono py-0 px-1.5 ${
                          isGap
                            ? 'text-rose-700 border-rose-300 bg-rose-50'
                            : 'text-slate-600 border-slate-300 bg-white'
                        }`}
                      >
                        {quoteItem.dimensionName}
                      </Badge>

                      <div className="flex items-center gap-1">
                        {isGap ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider ${
                            isGap ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {quoteItem.impact}
                        </span>
                      </div>
                    </div>

                    <blockquote
                      className={`text-xs font-mono p-2.5 rounded-lg border leading-relaxed ${
                        isGap
                          ? 'bg-white border-rose-200 text-rose-900 italic'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      &quot;{quoteItem.quote}&quot;
                    </blockquote>

                    <p className="text-[11px] text-slate-500 leading-snug">
                      {quoteItem.context}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Dimension Scores Grid */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Category Score Breakdown
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(candidate.dimensions).map(([dimKey, dim]) => (
                <div
                  key={dimKey}
                  className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs"
                >
                  <div className="text-[11px] font-medium text-slate-500 truncate">
                    {dim.name}
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold font-mono text-slate-900">
                      {dim.score}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      wt: {dim.weight}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dim.score >= 80
                          ? 'bg-emerald-500'
                          : dim.score >= 60
                          ? 'bg-sky-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Resume Toggle */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullResume(!showFullResume)}
              className="text-xs gap-1.5 text-slate-600 border-slate-200 w-full"
            >
              <FileText className="w-3.5 h-3.5" />
              {showFullResume ? 'Hide Raw Resume Text' : 'View Full Candidate Resume Text'}
            </Button>

            {showFullResume && (
              <pre className="mt-3 p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed border border-slate-800">
                {candidate.rawResumeText}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Overall Composite Fit:{' '}
            <span className="font-bold font-mono text-slate-900">
              {candidate.compositeScore}/100
            </span>
          </div>

          <Button
            size="sm"
            onClick={onClose}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
