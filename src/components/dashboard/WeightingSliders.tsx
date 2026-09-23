'use client';

import React from 'react';
import { Sliders, Zap } from 'lucide-react';
import { DimensionWeights, WEIGHT_PRESETS } from '@/types/scoring';
import { DIMENSIONS } from '@/lib/typesafe/definitions';
import { DimensionMeta } from '@/types/evaluation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface WeightingSlidersProps {
  weights: DimensionWeights;
  onWeightsChange: (weights: DimensionWeights) => void;
  categories?: Record<string, DimensionMeta>;
  onOpenCriteriaManager?: () => void;
}

export function WeightingSliders({
  weights,
  onWeightsChange,
  categories,
  onOpenCriteriaManager,
}: WeightingSlidersProps) {
  const handleSliderChange = (dim: string, value: number[]) => {
    onWeightsChange({
      ...weights,
      [dim]: value[0],
    });
  };

  const handleSelectPreset = (presetWeights: DimensionWeights) => {
    onWeightsChange({ ...presetWeights });
  };

  const activeCategories: Record<string, DimensionMeta> = categories || DIMENSIONS;
  const catEntries = Object.entries(activeCategories);

  const total = Object.keys(weights).reduce((acc, k) => acc + (weights[k] || 0), 0);

  return (
    <Card className="p-5 bg-white border-slate-200/90 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
              Recruiter Priority Weighting &amp; Criteria
            </h4>
            <p className="text-xs text-slate-500">
              Adjust dimension importance. Candidate scores recalculate dynamically in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Total:</span>
            <Badge
              variant={total === 100 ? 'default' : 'secondary'}
              className={`font-mono text-xs px-2.5 ${
                total === 100 ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {total}%
            </Badge>
          </div>

          {onOpenCriteriaManager && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenCriteriaManager}
              className="text-xs gap-1.5 h-8 border-sky-200 text-sky-700 bg-sky-50/50 hover:bg-sky-100"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-600" />
              Customize Criteria &amp; Questions
            </Button>
          )}
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 mr-1 flex items-center gap-1 font-medium">
          <Zap className="w-3 h-3 text-sky-600" /> Presets:
        </span>
        {WEIGHT_PRESETS.map((p) => {
          const isSelected =
            weights.technical === p.weights.technical &&
            weights.experience === p.weights.experience &&
            weights.education === p.weights.education &&
            weights.soft_skills === p.weights.soft_skills;

          return (
            <Button
              key={p.id}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSelectPreset(p.weights)}
              className="h-7 text-xs rounded-md px-2.5"
              title={p.description}
            >
              {p.name}
            </Button>
          );
        })}
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {catEntries.map(([catId, cat]) => {
          const currentVal = weights[catId] ?? 0;
          return (
            <div
              key={catId}
              className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 truncate mr-2" title={cat.name}>
                  {cat.shortName || cat.name}
                </span>
                <Badge variant="secondary" className="font-mono text-[11px] px-2 py-0 shrink-0">
                  {currentVal}%
                </Badge>
              </div>

              <Slider
                value={[currentVal]}
                min={0}
                max={80}
                step={5}
                onValueChange={(val) => handleSliderChange(catId, val)}
                className="py-1"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0%</span>
                <span>40%</span>
                <span>80%</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
