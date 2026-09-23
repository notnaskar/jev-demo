'use client';

import React from 'react';
import { DimensionId, DimensionScoreBreakdown } from '@/types/evaluation';

interface FitRadarChartProps {
  dimensions: Record<DimensionId, DimensionScoreBreakdown>;
}

export function FitRadarChart({ dimensions }: FitRadarChartProps) {
  // Chart dimensions & coordinates
  const size = 340;
  const center = size / 2;
  const radius = 96;

  const entries = Object.values(dimensions || {});
  const dimCount = Math.max(entries.length, 3);

  // Dynamically compute N-sided radar axes and coordinates
  const dimKeys = entries.map((dim, i) => ({
    id: dim.dimension,
    label: dim.name,
    score: dim.score || 0,
    angle: -Math.PI / 2 + (i * 2 * Math.PI) / dimCount,
  }));

  // Helper to calculate coordinates for an angle and value (0 - 100)
  const getCoordinates = (angle: number, value: number) => {
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Build grid rings (25%, 50%, 75%, 100%)
  const gridLevels = [25, 50, 75, 100];
  const gridPaths = gridLevels.map((lvl) => {
    const points = dimKeys.map((dim) => {
      const { x, y } = getCoordinates(dim.angle, lvl);
      return `${x},${y}`;
    });
    return points.join(' ');
  });

  // Candidate polygon points
  const candidatePoints = dimKeys
    .map((dim) => {
      const { x, y } = getCoordinates(dim.angle, dim.score);
      return `${x},${y}`;
    })
    .join(' ');

  // Target benchmark points (standard 75% baseline)
  const benchmarkPoints = dimKeys
    .map((dim) => {
      const { x, y } = getCoordinates(dim.angle, 75);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center p-3 relative select-none">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[290px] h-auto overflow-visible"
      >
        {/* Background Grid Concentric Polygons */}
        {gridPaths.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill={i === 3 ? '#f8fafc' : 'transparent'}
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray={i < 3 ? '2 2' : 'none'}
          />
        ))}

        {/* Axis Lines from center */}
        {dimKeys.map((dim) => {
          const { x, y } = getCoordinates(dim.angle, 100);
          return (
            <line
              key={dim.id}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          );
        })}

        {/* Target Benchmark Threshold Polygon (75%) */}
        <polygon
          points={benchmarkPoints}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="opacity-70"
        />

        {/* Candidate Alignment Area Polygon */}
        <polygon
          points={candidatePoints}
          fill="rgba(2, 132, 199, 0.18)"
          stroke="#0284c7"
          strokeWidth="2.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Vertex Points & Value Markers */}
        {dimKeys.map((dim) => {
          const { x, y } = getCoordinates(dim.angle, dim.score);
          return (
            <g key={dim.id} className="transition-all duration-500">
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="2"
                className="shadow-sm"
              />
            </g>
          );
        })}

        {/* Dimension Labels around perimeter */}
        {dimKeys.map((dim) => {
          const { x, y } = getCoordinates(dim.angle, 126);

          const cosVal = Math.cos(dim.angle);
          const sinVal = Math.sin(dim.angle);

          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          let dy = '0.35em';

          if (cosVal > 0.3) {
            textAnchor = 'start';
          } else if (cosVal < -0.3) {
            textAnchor = 'end';
          }

          if (sinVal < -0.7) {
            dy = '-0.6em';
          } else if (sinVal > 0.7) {
            dy = '1.2em';
          }

          return (
            <text
              key={dim.id}
              x={x}
              y={y}
              textAnchor={textAnchor}
              dy={dy}
              className="text-[10px] font-semibold fill-slate-700 font-sans tracking-tight"
            >
              {dim.label}{' '}
              <tspan className="font-mono font-bold fill-sky-600">
                {dim.score}%
              </tspan>
            </text>
          );
        })}
      </svg>

      {/* Legend Indicator */}
      <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-sky-500/20 border-2 border-sky-600 inline-block" />
          <span>Candidate Score</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-0 border-t-2 border-dashed border-slate-400 inline-block" />
          <span>Target (75%)</span>
        </div>
      </div>
    </div>
  );
}
