'use client';

import React, { useRef, useState } from 'react';
import {
  FileText,
  Briefcase,
  Upload,
  Trash2,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { SAMPLE_PRESETS, SamplePreset } from '@/lib/presets/sample-data';

interface DocumentInputProps {
  jobDescriptionText: string;
  setJobDescriptionText: (val: string) => void;
  resumeText: string;
  setResumeText: (val: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onSelectPreset: (preset: SamplePreset) => void;
  selectedPresetId?: string;
}

export function DocumentInput({
  jobDescriptionText,
  setJobDescriptionText,
  resumeText,
  setResumeText,
  onAnalyze,
  isLoading,
  onSelectPreset,
  selectedPresetId,
}: DocumentInputProps) {
  const jdFileRef = useRef<HTMLInputElement>(null);
  const resumeFileRef = useRef<HTMLInputElement>(null);
  const [parsingTarget, setParsingTarget] = useState<'jd' | 'resume' | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    target: 'jd' | 'resume'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingTarget(target);
    setFileError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse file.');
      }

      if (data.documents && data.documents.length > 0) {
        setter(data.documents[0].text);
      } else if (data.errors && data.errors.length > 0) {
        throw new Error(data.errors[0].error);
      }
    } catch (err: unknown) {
      console.error('File extraction error:', err);
      const message = err instanceof Error ? err.message : 'Error extracting text from file.';
      setFileError(message);
    } finally {
      setParsingTarget(null);
      e.target.value = '';
    }
  };

  const jdWordCount = jobDescriptionText.trim()
    ? jobDescriptionText.trim().split(/\s+/).length
    : 0;
  const resumeWordCount = resumeText.trim()
    ? resumeText.trim().split(/\s+/).length
    : 0;

  const canAnalyze =
    jobDescriptionText.trim().length > 20 &&
    resumeText.trim().length > 20 &&
    !isLoading;

  return (
    <div className="space-y-4">
      {/* Sample Presets Header Bar */}
      <Card className="border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-sky-50 text-sky-700 rounded-md border border-sky-200">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-900 tracking-wide uppercase font-mono">
                Sample Profiles &amp; Benchmarks
              </h3>
              <p className="text-xs text-slate-500">
                Quick-load pre-calibrated candidate resumes and matching job descriptions:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {SAMPLE_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              const badgeVariant =
                preset.expectedTier === 'exceptional'
                  ? 'success'
                  : preset.expectedTier === 'moderate'
                  ? 'warning'
                  : 'destructive';

              return (
                <Button
                  key={preset.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSelectPreset(preset)}
                  className={`h-8 gap-2 rounded-lg text-xs font-medium transition-all ${
                    isSelected ? 'ring-2 ring-slate-900/10' : ''
                  }`}
                  title={preset.description}
                >
                  <span>{preset.name}</span>
                  <Badge variant={badgeVariant} className="px-1.5 py-0 text-[10px]">
                    {preset.badge}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Two Columns: Job Description & Resume */}
      {/* File Parsing Error Alert */}
      {fileError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center justify-between">
          <span>{fileError}</span>
          <button
            onClick={() => setFileError(null)}
            className="text-rose-500 hover:text-rose-700 cursor-pointer font-bold px-1"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Job Description */}
        <Card className="flex flex-col border-slate-200/90 bg-white overflow-hidden focus-within:border-sky-500 transition-colors shadow-xs">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-800">
              <Briefcase className="w-4 h-4 text-sky-600" />
              <span>Job Description Requirements</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {jdWordCount} words
              </span>
              <input
                ref={jdFileRef}
                type="file"
                accept=".pdf,.txt,.md"
                className="hidden"
                disabled={parsingTarget !== null}
                onChange={(e) => handleFileUpload(e, setJobDescriptionText, 'jd')}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => jdFileRef.current?.click()}
                disabled={parsingTarget !== null}
                className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900"
                title="Upload document (.pdf, .txt, .md)"
              >
                {parsingTarget === 'jd' ? (
                  <Loader2 className="w-3 h-3 mr-1 text-sky-600 animate-spin" />
                ) : (
                  <Upload className="w-3 h-3 mr-1 text-slate-500" />
                )}
                {parsingTarget === 'jd' ? 'Extracting...' : 'Upload'}
              </Button>
              {jobDescriptionText && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setJobDescriptionText('')}
                  className="h-7 w-7 text-slate-400 hover:text-rose-600"
                  title="Clear text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-0">
            <Textarea
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
              placeholder="Paste job description requirements, core competencies, stack requirements..."
              rows={9}
              className="border-0 bg-transparent rounded-none focus-visible:ring-0 p-4 text-sm leading-relaxed"
            />
          </CardContent>
        </Card>

        {/* Right: Candidate Resume */}
        <Card className="flex flex-col border-slate-200/90 bg-white overflow-hidden focus-within:border-sky-500 transition-colors shadow-xs">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-800">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Candidate Resume / Dossier</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {resumeWordCount} words
              </span>
              <input
                ref={resumeFileRef}
                type="file"
                accept=".pdf,.txt,.md"
                className="hidden"
                disabled={parsingTarget !== null}
                onChange={(e) => handleFileUpload(e, setResumeText, 'resume')}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resumeFileRef.current?.click()}
                disabled={parsingTarget !== null}
                className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900"
                title="Upload resume (.pdf, .txt, .md)"
              >
                {parsingTarget === 'resume' ? (
                  <Loader2 className="w-3 h-3 mr-1 text-indigo-600 animate-spin" />
                ) : (
                  <Upload className="w-3 h-3 mr-1 text-slate-500" />
                )}
                {parsingTarget === 'resume' ? 'Extracting...' : 'Upload'}
              </Button>
              {resumeText && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setResumeText('')}
                  className="h-7 w-7 text-slate-400 hover:text-rose-600"
                  title="Clear text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-0">
            <Textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste candidate resume history, technical proficiencies, impact bullet points..."
              rows={9}
              className="border-0 bg-transparent rounded-none focus-visible:ring-0 p-4 text-sm leading-relaxed"
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Action Bar */}
      <Card className="p-3.5 bg-white border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              TypeSafe Jev System One evaluates across <strong>4 dimensions &amp; 9 typed criteria</strong>.
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setJobDescriptionText('');
                setResumeText('');
              }}
              disabled={isLoading || (!jobDescriptionText && !resumeText)}
              className="gap-1.5 text-slate-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>

            <Button
              variant="default"
              size="default"
              onClick={onAnalyze}
              disabled={!canAnalyze}
              className="gap-2 font-semibold min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing via Jev AI...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Evaluate Fit &amp; Gaps</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
