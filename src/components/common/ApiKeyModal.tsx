'use client';

import React, { useState } from 'react';
import { Key, CheckCircle2, ShieldCheck, ExternalLink, Sparkles, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConfigured: boolean;
  authSource?: 'env' | 'session' | 'none';
  maskedKey?: string;
  onKeyStatusChange: (status: { isConfigured: boolean; source: 'env' | 'session' | 'none'; maskedKey?: string }) => void;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  isConfigured,
  authSource,
  maskedKey,
  onKeyStatusChange,
}: ApiKeyModalProps) {
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    if (!inputVal.trim()) {
      setErrorMessage('Please enter an API key');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: inputVal.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save session key');
      }

      onKeyStatusChange({
        isConfigured: true,
        source: 'session',
        maskedKey: data.maskedKey,
      });

      setInputVal('');
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    } catch (err: unknown) {
      console.error('Save key error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/key', { method: 'DELETE' });
      const data = await res.json();

      onKeyStatusChange({
        isConfigured: !!data.isConfigured,
        source: data.source || 'none',
        maskedKey: data.maskedKey,
      });

      setInputVal('');
    } catch (err: unknown) {
      console.error('Clear key error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to clear key');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-slate-200 bg-white text-slate-900 shadow-xl">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-xl">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                TypeSafe AI Engine Configuration
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Configure your secure Jev System One API credentials
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status Badge */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider font-mono">Current Status</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={isConfigured ? 'default' : 'secondary'}
                  className={
                    isConfigured
                      ? 'bg-emerald-600 text-white font-mono text-[10px]'
                      : 'bg-amber-100 text-amber-800 font-mono text-[10px]'
                  }
                >
                  {isConfigured ? (authSource === 'env' ? 'Active (Server Env)' : 'Active (Session Cookie)') : 'Unconfigured'}
                </Badge>
                {maskedKey && (
                  <span className="font-mono text-xs text-slate-600 font-semibold">{maskedKey}</span>
                )}
              </div>
            </div>

            {authSource === 'session' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={isLoading}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Revoke Key
              </Button>
            )}
          </div>

          <div className="p-3 bg-sky-50/50 border border-sky-100 rounded-xl text-xs text-slate-600 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Zero-Exposure HttpOnly Security</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Your key is never stored in browser localStorage or exposed to JavaScript. It is stored exclusively in an encrypted, HttpOnly session cookie transmitted over HTTPS.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-medium text-slate-700 uppercase tracking-wider">
              {authSource === 'session' ? 'Update Session Key' : 'Enter TypeSafe API Key'}
            </label>
            <input
              type="password"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="ts_live_..."
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 font-mono shadow-xs transition-colors"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <a
              href="https://console.typesafe.ai"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium transition-colors"
            >
              <span>Get API token from TypeSafe Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isLoading || !inputVal.trim()}
            className="gap-1.5 min-w-[110px]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Save Key</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
