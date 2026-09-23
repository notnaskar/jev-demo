'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  Flame,
  Award,
  HelpCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { HiddenGem, MissingRequirement } from '@/types/evaluation';

interface GapAnalysisViewProps {
  hiddenGems: HiddenGem[];
  missingRequirements: MissingRequirement[];
  activePersona: 'recruiter' | 'candidate';
}

export function GapAnalysisView({
  hiddenGems,
  missingRequirements,
  activePersona,
}: GapAnalysisViewProps) {
  // Pure state derivation without useEffect setState violations
  const [tabOverride, setTabOverride] = useState<{ forPersona: string; tab: 'recruiter' | 'candidate' } | null>(null);
  const currentTab = tabOverride?.forPersona === activePersona ? tabOverride.tab : activePersona;

  return (
    <Card className="p-6 bg-white border-slate-200/90 shadow-sm space-y-6">
      <Tabs
        value={currentTab}
        onValueChange={(val) => setTabOverride({ forPersona: activePersona, tab: val as 'recruiter' | 'candidate' })}
        className="w-full space-y-5"
      >
        {/* Header and Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 text-slate-800 rounded-md border border-slate-200">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">
                Gap Analysis &amp; Candidate Superpowers
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Unrequested standout strengths alongside prioritized requirement gaps.
            </p>
          </div>

          <TabsList className="bg-slate-100 border border-slate-200 self-start sm:self-auto h-9">
            <TabsTrigger
              value="recruiter"
              className="gap-2 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Standout Superpowers</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                {hiddenGems.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="candidate"
              className="gap-2 text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Prioritized Gaps</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                {missingRequirements.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Recruiter Tab: Hidden Gems */}
        <TabsContent value="recruiter" className="space-y-4 m-0">
          <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-lg flex items-start gap-3">
            <Flame className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-sky-900 font-semibold">Recruiter Advantage:</strong> Achievements found in the candidate’s history that were <strong>not explicitly listed in the job description</strong>, but provide immediate engineering leverage.
            </div>
          </div>

          {hiddenGems.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
              No peripheral standout superpowers detected for this profile.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hiddenGems.map((gem) => (
                <div
                  key={gem.id}
                  className="p-4 bg-white border border-slate-200/90 rounded-xl space-y-3 hover:border-slate-300 transition-colors shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-md">
                        <Award className="w-4 h-4" />
                      </div>
                      <h4 className="font-semibold text-sm text-slate-900">{gem.title}</h4>
                    </div>

                    <Badge variant="warning" className="text-[10px] font-mono shrink-0">
                      Impact {gem.impactScore}/10
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{gem.description}</p>

                  {/* Highlight Quote */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-md text-xs text-slate-700 italic border-l-2 border-l-sky-500">
                    &ldquo;{gem.highlightSnippet}&rdquo;
                  </div>

                  {/* Value Proposition */}
                  <div className="flex items-start gap-2 text-xs text-slate-800 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span>Hiring Leverage: {gem.valueProposition}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Candidate Tab: Gaps & Upskilling */}
        <TabsContent value="candidate" className="space-y-4 m-0">
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-amber-900 font-semibold">Interview Verification &amp; Growth:</strong> Core requirements from the job description where candidate evidence was lower. Use the targeted probing questions during technical screens.
            </div>
          </div>

          {missingRequirements.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex flex-col items-center gap-2">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              <span className="font-semibold text-sm">Zero Critical Gaps Identified</span>
              <p className="text-slate-600 max-w-md">
                Candidate profile meets all critical requirements and core competencies outlined in the posting.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {missingRequirements.map((gap) => {
                const severityVariant =
                  gap.severity === 'critical'
                    ? 'destructive'
                    : gap.severity === 'moderate'
                    ? 'warning'
                    : 'default';

                return (
                  <div
                    key={gap.id}
                    className="p-4 bg-white border border-slate-200/90 rounded-xl space-y-3 hover:border-slate-300 transition-colors shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <h4 className="font-semibold text-sm text-slate-900">{gap.title}</h4>
                      </div>
                      <Badge variant={severityVariant} className="text-[10px] uppercase font-mono">
                        {gap.severity}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{gap.description}</p>

                    {/* Probing recommendation */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start gap-2.5">
                      <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-900 block mb-0.5 font-mono text-[11px]">
                          Interview Probing Strategy:
                        </span>
                        {gap.recommendation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
