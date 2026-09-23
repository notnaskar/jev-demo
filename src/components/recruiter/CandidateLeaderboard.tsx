'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClassifiedCandidate } from '@/types/evaluation';
import {
  Trophy,
  Star,
  Search,
  Download,
  Eye,
  Quote,
  Users,
  Sparkles,
} from 'lucide-react';

interface CandidateLeaderboardProps {
  candidates: ClassifiedCandidate[];
  onSelectCandidate: (candidate: ClassifiedCandidate) => void;
  onToggleShortlist: (id: string) => void;
  onLoadSamplePool: () => void;
  isLoading?: boolean;
}

export function CandidateLeaderboard({
  candidates,
  onSelectCandidate,
  onToggleShortlist,
  onLoadSamplePool,
  isLoading,
}: CandidateLeaderboardProps) {
  const [filterVerdict, setFilterVerdict] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-600 text-white';
      case 'B':
        return 'bg-sky-600 text-white';
      case 'C':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-rose-600 text-white';
    }
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    if (filterVerdict === 'shortlisted' && !c.shortlisted) return false;
    if (filterVerdict !== 'all' && filterVerdict !== 'shortlisted' && c.recruiterVerdict !== filterVerdict) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchRole = c.targetRole?.toLowerCase().includes(q);
      const matchSummary = c.reasoningSummary.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchSummary) return false;
    }
    return true;
  });

  // Export shortlist as CSV
  const handleExportCSV = () => {
    const itemsToExport = candidates.filter((c) => (filterVerdict === 'shortlisted' ? c.shortlisted : true));
    if (itemsToExport.length === 0) return;

    const headers = ['Rank', 'Candidate Name', 'Target Role', 'Fit Score', 'Grade', 'Verdict', 'Shortlisted', 'Key Reasoning'];
    const rows = itemsToExport.map((c, idx) => [
      idx + 1,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${(c.targetRole || '').replace(/"/g, '""')}"`,
      c.compositeScore,
      c.grade,
      `"${c.recruiterVerdict}"`,
      c.shortlisted ? 'Yes' : 'No',
      `"${c.reasoningSummary.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fitlens_candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shortlistedCount = candidates.filter((c) => c.shortlisted).length;
  const avgScore =
    candidates.length > 0
      ? Math.round(candidates.reduce((sum, c) => sum + c.compositeScore, 0) / candidates.length)
      : 0;

  return (
    <Card className="p-5 bg-white border-slate-200/90 shadow-xs space-y-4">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Candidate Classification Leaderboard
              <Badge variant="secondary" className="font-mono text-[10px] py-0">
                {candidates.length} Applicants
              </Badge>
            </h3>
            <p className="text-xs text-slate-500">
              Ranked in real-time by weighted dimensional alignment and qualification rubric
            </p>
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {candidates.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mr-2">
              <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-200">
                Avg: <strong className="text-slate-900">{avgScore}%</strong>
              </span>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200">
                ★ Starred: <strong>{shortlistedCount}</strong>
              </span>
            </div>
          )}

          {candidates.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs gap-1.5 h-8 border-slate-200 text-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onLoadSamplePool}
              disabled={isLoading}
              className="text-xs gap-1.5 h-8 bg-sky-600 hover:bg-sky-700 text-white"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample Pool (5 Candidates)
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      {candidates.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setFilterVerdict('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filterVerdict === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({candidates.length})
            </button>
            <button
              onClick={() => setFilterVerdict('Fast-Track Interview')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filterVerdict === 'Fast-Track Interview'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Fast-Track
            </button>
            <button
              onClick={() => setFilterVerdict('Proceed to Screening')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filterVerdict === 'Proceed to Screening'
                  ? 'bg-sky-600 text-white'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
              }`}
            >
              Screening
            </button>
            <button
              onClick={() => setFilterVerdict('Evaluate Gaps with Team')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filterVerdict === 'Evaluate Gaps with Team'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Review Gaps
            </button>
            <button
              onClick={() => setFilterVerdict('shortlisted')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filterVerdict === 'shortlisted'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Star className="w-3 h-3" />
              Starred ({shortlistedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {candidates.length === 0 && (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">No Resumes Classified Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Upload multiple resumes using the bulk upload box above, or click below to load a diverse 5-candidate sample pool.
            </p>
          </div>
          <Button
            size="sm"
            onClick={onLoadSamplePool}
            disabled={isLoading}
            className="text-xs bg-sky-600 hover:bg-sky-700 text-white gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample Candidate Pool
          </Button>
        </div>
      )}

      {/* Leaderboard Table */}
      {candidates.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">Rank</th>
                  <th className="py-2.5 px-4">Candidate &amp; Role</th>
                  <th className="py-2.5 px-3 text-center">Fit Score</th>
                  <th className="py-2.5 px-3">Verdict</th>
                  <th className="py-2.5 px-4">Executive Reasoning &amp; Evidence</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredCandidates.map((candidate, idx) => {
                  const rank = idx + 1;

                  return (
                    <tr
                      key={candidate.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-mono text-xs font-bold ${
                            rank === 1
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : rank === 2
                              ? 'bg-slate-200 text-slate-700'
                              : rank === 3
                              ? 'bg-orange-100 text-orange-800'
                              : 'text-slate-400'
                          }`}
                        >
                          #{rank}
                        </span>
                      </td>

                      {/* Candidate Name & Role */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors flex items-center gap-1.5">
                          {candidate.name}
                          {candidate.shortlisted && (
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {candidate.targetRole || 'Candidate'}
                        </div>
                      </td>

                      {/* Fit Score & Grade */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="font-mono font-bold text-sm text-slate-900">
                            {candidate.compositeScore}%
                          </span>
                          <span
                            className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${getGradeBadge(
                              candidate.grade
                            )}`}
                          >
                            {candidate.grade}
                          </span>
                        </div>
                      </td>

                      {/* Recruiter Verdict */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-semibold border ${getVerdictStyle(
                            candidate.recruiterVerdict
                          )}`}
                        >
                          {candidate.recruiterVerdict}
                        </Badge>
                      </td>

                      {/* Executive Reasoning & Quote count */}
                      <td className="py-3 px-4">
                        <div className="space-y-1 max-w-md">
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {candidate.reasoningSummary}
                          </p>

                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              <Quote className="w-2.5 h-2.5 text-sky-600" />
                              {candidate.quotedEvidence.length} quoted proofs
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleShortlist(candidate.id)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-amber-500"
                            title={candidate.shortlisted ? 'Remove star' : 'Star candidate'}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                candidate.shortlisted ? 'fill-amber-400 text-amber-500' : ''
                              }`}
                            />
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => onSelectCandidate(candidate)}
                            className="h-8 text-xs gap-1 bg-slate-900 hover:bg-slate-800 text-white"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Dossier
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
