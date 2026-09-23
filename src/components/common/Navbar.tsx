'use client';

import React from 'react';
import { Sparkles, Key, Layers, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NavbarProps {
  activePersona: 'recruiter' | 'candidate';
  onPersonaChange: (persona: 'recruiter' | 'candidate') => void;
  isConfigured: boolean;
  authSource?: 'env' | 'session' | 'none';
  maskedKey?: string;
  onOpenKeyModal: () => void;
}

export function Navbar({
  activePersona,
  onPersonaChange,
  isConfigured,
  authSource,
  onOpenKeyModal,
}: NavbarProps) {
  const getBadgeText = () => {
    if (!isConfigured) return 'Configure API Key';
    if (authSource === 'env') return 'Live Jev (Server Env)';
    return 'Live Jev (Key Active)';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 font-heading">
              Fit<span className="text-sky-600">Lens</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              Jev AI
            </span>
          </div>
        </div>

        {/* Center: Persona Switcher */}
        <div>
          <Tabs
            value={activePersona}
            onValueChange={(val) => onPersonaChange(val as 'recruiter' | 'candidate')}
          >
            <TabsList className="bg-slate-100 border border-slate-200">
              <TabsTrigger
                value="recruiter"
                className="gap-2 text-xs"
              >
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                <span>Recruiter Cockpit</span>
              </TabsTrigger>
              <TabsTrigger
                value="candidate"
                className="gap-2 text-xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Candidate View</span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-semibold">
                  Free
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Right: API Mode Status & Settings Trigger */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenKeyModal}
            className="gap-2 font-mono text-xs rounded-lg h-8 border-slate-200 text-slate-700 hover:text-slate-900"
          >
            <Key className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden md:inline">{getBadgeText()}</span>
            <span className="md:hidden">{isConfigured ? 'Live' : 'Config'}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </Button>
        </div>
      </div>
    </header>
  );
}
