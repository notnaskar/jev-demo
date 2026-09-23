'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  UploadCloud,
  FileText,
  Trash2,
  Sparkles,
  ClipboardPaste,
  Loader2,
  FolderPlus,
} from 'lucide-react';
import type { ParsedDocumentResult } from '@/lib/document/parser';

export interface QueuedResume {
  id: string;
  name: string;
  text: string;
}

interface BulkUploadZoneProps {
  onClassifyBatch: (resumes: QueuedResume[]) => void;
  onLoadSamplePool: () => void;
  isLoading: boolean;
}

export function BulkUploadZone({
  onClassifyBatch,
  onLoadSamplePool,
  isLoading,
}: BulkUploadZoneProps) {
  const [activeMode, setActiveMode] = useState<'upload' | 'paste'>('upload');
  const [queuedResumes, setQueuedResumes] = useState<QueuedResume[]>([]);
  const [pasteContent, setPasteContent] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isParsingFiles, setIsParsingFiles] = useState<boolean>(false);
  const [parseNotice, setParseNotice] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Handle file uploads (PDF, TXT, MD) via secure in-memory parser API
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsParsingFiles(true);
    setParseNotice(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse uploaded documents.');
      }

      const newItems: QueuedResume[] = ((data.documents || []) as ParsedDocumentResult[]).map((doc, idx: number) => ({
        id: `file_${Date.now()}_${idx}`,
        name: doc.candidateName || doc.fileName.replace(/\.[^/.]+$/, ''),
        text: doc.text,
      }));

      setQueuedResumes((prev) => [...prev, ...newItems]);

      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const errorNames = (data.errors as Array<{ fileName: string; error: string }>)
          .map((err) => `${err.fileName} (${err.error})`)
          .join(', ');
        setParseNotice({
          type: 'warning',
          message: `Parsed ${newItems.length} resumes. Could not read: ${errorNames}`,
        });
      } else {
        setParseNotice({
          type: 'success',
          message: `Successfully extracted clean text from ${newItems.length} file${newItems.length === 1 ? '' : 's'}.`,
        });
      }
    } catch (err: unknown) {
      console.error('File parsing error:', err);
      const message = err instanceof Error ? err.message : 'Failed to process files. Please check file format.';
      setParseNotice({
        type: 'error',
        message,
      });
    } finally {
      setIsParsingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Parse pasted multi-resume text
  const handleAddPasted = () => {
    if (!pasteContent.trim()) return;

    // Split by common delimiters like --- or === or [RESUME]
    const chunks = pasteContent
      .split(/(?:^|\n)(?:-{3,}|={3,}|\[RESUME\])\s*(?:\n|$)/gi)
      .map((c) => c.trim())
      .filter((c) => c.length > 30);

    const newItems: QueuedResume[] = chunks.map((chunk, idx) => {
      // Guess name from first line
      const firstLine = chunk.split('\n')[0].replace(/[^a-zA-Z\s.-]/g, '').trim();
      const candidateName = firstLine.length > 2 && firstLine.length < 35 ? firstLine : `Candidate #${queuedResumes.length + idx + 1}`;
      return {
        id: `paste_${Date.now()}_${idx}`,
        name: candidateName,
        text: chunk,
      };
    });

    setQueuedResumes((prev) => [...prev, ...newItems]);
    setPasteContent('');
  };

  const handleRemoveResume = (id: string) => {
    setQueuedResumes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAll = () => {
    setQueuedResumes([]);
    setPasteContent('');
  };

  const handleRunClassification = () => {
    if (queuedResumes.length === 0) return;
    onClassifyBatch(queuedResumes);
  };

  return (
    <Card className="p-5 bg-white border-slate-200/90 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Bulk Resume Ingestion
              {queuedResumes.length > 0 && (
                <Badge variant="outline" className="font-mono text-[10px] py-0 text-sky-700 bg-sky-50 border-sky-200">
                  {queuedResumes.length} In Queue
                </Badge>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Drop multiple resume files or paste candidate profiles separated by &quot;---&quot;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadSamplePool}
            disabled={isLoading}
            className="text-xs gap-1.5 h-8 border-slate-200 text-slate-700 hover:text-slate-900"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            Load Sample Applicant Pool (5 Candidates)
          </Button>
        </div>
      </div>

      {/* Tabs: File Drop vs Batch Paste */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveMode('upload')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeMode === 'upload'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FolderPlus className="w-3.5 h-3.5" />
          Multi-File Upload
        </button>
        <button
          onClick={() => setActiveMode('paste')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeMode === 'paste'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
          Batch Paste Text
        </button>
      </div>

      {/* Notice Banner */}
      {parseNotice && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between gap-2 border ${
            parseNotice.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : parseNotice.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold capitalize">{parseNotice.type}:</span>
            <span>{parseNotice.message}</span>
          </div>
          <button
            onClick={() => setParseNotice(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
          >
            ×
          </button>
        </div>
      )}

      {/* Mode 1: Multi-File Upload Area */}
      {activeMode === 'upload' && (
        <div
          onClick={() => !isParsingFiles && fileInputRef.current?.click()}
          className={`p-8 border-2 border-dashed rounded-xl text-center space-y-2 transition-all ${
            isParsingFiles
              ? 'border-sky-300 bg-sky-50/30 cursor-wait'
              : 'border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/20 cursor-pointer group'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.md"
            onChange={handleFileSelect}
            disabled={isParsingFiles}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 group-hover:border-sky-300 text-slate-400 group-hover:text-sky-600 mx-auto flex items-center justify-center transition-colors shadow-2xs">
            {isParsingFiles ? (
              <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-800 group-hover:text-sky-700">
              {isParsingFiles
                ? 'Parsing PDF & Document text in-memory...'
                : 'Click to browse or drop candidate resumes here'}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports multiple <strong>.pdf</strong>, <strong>.txt</strong>, and <strong>.md</strong> files (up to 10MB each)
            </p>
          </div>
        </div>
      )}

      {/* Mode 2: Batch Paste Text */}
      {activeMode === 'paste' && (
        <div className="space-y-2.5">
          <Textarea
            placeholder="Paste multiple candidate resumes here. Separate each candidate with '---' on a new line.

Example:
ALEXA CHEN
Staff Full-Stack Engineer with 8+ years...
---
MARCUS BRODY
Senior Backend Engineer with 6 years..."
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            className="text-xs min-h-[140px] font-mono leading-relaxed bg-slate-50 border-slate-200"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleAddPasted}
              disabled={!pasteContent.trim()}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Queue Pasted Resumes
            </Button>
          </div>
        </div>
      )}

      {/* Ingestion Queue Preview */}
      {queuedResumes.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Pending Candidates ({queuedResumes.length})
            </span>
            <button
              onClick={handleClearAll}
              className="text-slate-400 hover:text-rose-600 cursor-pointer text-[11px]"
            >
              Clear Queue
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
            {queuedResumes.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs group"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">{item.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    ({item.text.length} chars)
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveResume(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 opacity-60 group-hover:opacity-100 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Classification Action Trigger */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">
              Ready to classify {queuedResumes.length} resumes against custom criteria schema
            </span>

            <Button
              onClick={handleRunClassification}
              disabled={isLoading || queuedResumes.length === 0}
              className="text-xs bg-sky-600 hover:bg-sky-700 text-white gap-2 font-medium px-4 h-9 shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Classifying Resumes ({queuedResumes.length})...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Classify All {queuedResumes.length} Resumes with TypeSafe
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
