'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/common/Navbar';
import { ApiKeyModal } from '@/components/common/ApiKeyModal';
import { RecruiterCockpit } from '@/components/recruiter/RecruiterCockpit';
import { CandidateFitChecker } from '@/components/candidate/CandidateFitChecker';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  const [activePersona, setActivePersona] = useState<'recruiter' | 'candidate'>('recruiter');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [authSource, setAuthSource] = useState<'env' | 'session' | 'none'>('none');
  const [maskedKey, setMaskedKey] = useState<string | undefined>(undefined);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);

  // Safely check server/cookie credential status on mount and clear old plaintext localStorage keys
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('fitlens_typesafe_key')) {
        localStorage.removeItem('fitlens_typesafe_key');
      }
    } catch {
      // Ignore storage access restrictions
    }

    let isSubscribed = true;

    async function checkAuthStatus() {
      try {
        const res = await fetch('/api/auth/key');
        if (!res.ok) return;
        const data = await res.json();
        if (isSubscribed) {
          setIsConfigured(!!data.isConfigured);
          setAuthSource(data.source || 'none');
          setMaskedKey(data.maskedKey);
        }
      } catch (err: unknown) {
        console.error('Failed to query key status:', err);
      }
    }

    checkAuthStatus();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleKeyStatusChange = (status: {
    isConfigured: boolean;
    source: 'env' | 'session' | 'none';
    maskedKey?: string;
  }) => {
    setIsConfigured(status.isConfigured);
    setAuthSource(status.source);
    setMaskedKey(status.maskedKey);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        activePersona={activePersona}
        onPersonaChange={setActivePersona}
        isConfigured={isConfigured}
        authSource={authSource}
        maskedKey={maskedKey}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
      />

      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        isConfigured={isConfigured}
        authSource={authSource}
        maskedKey={maskedKey}
        onKeyStatusChange={handleKeyStatusChange}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Dynamic Hero Section */}
        <section className="text-center max-w-2xl mx-auto space-y-2 pt-2 pb-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-600 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-mono text-[11px] font-medium">TypeSafe Jev System One Fan-Out Engine</span>
          </div>

          {activePersona === 'recruiter' ? (
            <>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Bulk Resume Screener &amp; Criteria Cockpit
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Ingest applicant pools in bulk, customize qualification questions in real-time, and review ranked candidates with direct quoted resume evidence.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Candidate Resume Fit &amp; Gap Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Free diagnostic for job seekers: benchmark your resume against any job description, pinpoint missing keywords, and tailor bullet points.
              </p>
            </>
          )}
        </section>

        {/* View Switcher based on Active Persona */}
        {activePersona === 'recruiter' ? (
          <RecruiterCockpit
            isConfigured={isConfigured}
            onOpenKeyModal={() => setIsKeyModalOpen(true)}
          />
        ) : (
          <CandidateFitChecker
            isConfigured={isConfigured}
            onOpenKeyModal={() => setIsKeyModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 space-y-1 mt-6">
        <p>
          FitLens • Powered by <strong>TypeSafe AI Jev System One</strong> • Next.js App Router
        </p>
        <p className="text-[11px] text-slate-400 font-mono">
          Deterministic operational recruitment intelligence with dynamic schema compilation.
        </p>
      </footer>
    </div>
  );
}
