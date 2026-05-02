'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJourney } from '@/context/journey-context';
import { ProgressBar } from '@/components/progress-bar';

export default function JourneyPage() {
  const router = useRouter();
  const { state } = useJourney();

  useEffect(() => {
    // Redirect to appropriate stage based on current state
    if (state.stage === 1) {
      router.replace('/journey/stage-1');
    } else if (state.stage === 2) {
      router.replace('/journey/stage-2');
    } else if (state.stage === 3) {
      router.replace('/journey/stage-3');
    } else if (state.stage === 4) {
      router.replace('/journey/stage-4');
    } else if (state.stage === 'report') {
      router.replace('/journey/report');
    } else if (state.stage === null) {
      // No journey started, redirect to home
      router.replace('/');
    }
  }, [state.stage, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary">正在加载...</p>
      </div>
    </div>
  );
}
