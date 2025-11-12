'use client';

import { createContext, useCallback, useContext, useMemo, useRef } from 'react';

type SoundIntent = 'nav' | 'action' | 'success';

interface PlanjoSound {
  play: (intent?: SoundIntent) => void;
}

const PlanjoSoundContext = createContext<PlanjoSound>({ play: () => {} });

export function PlanjoExperienceProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<AudioContext | null>(null);

  const play = useCallback((intent: SoundIntent = 'action') => {
    if (typeof window === 'undefined') {
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new AudioContextClass();
    }

    const ctx = audioRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const baseFrequency = intent === 'nav' ? 260 : intent === 'success' ? 520 : 360;

    osc.type = 'sine';
    osc.frequency.value = baseFrequency + Math.random() * 40;
    gain.gain.value = 0.14;

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.35);

    osc.start(now);
    osc.stop(now + 0.35);
  }, []);

  const value = useMemo<PlanjoSound>(() => ({ play }), [play]);

  return (
    <PlanjoSoundContext.Provider value={value}>
      <div className="planjo-surface">
        <div className="planjo-orbit" aria-hidden />
        <div className="planjo-noise" aria-hidden />
        {children}
      </div>
    </PlanjoSoundContext.Provider>
  );
}

export function usePlanjoSound() {
  return useContext(PlanjoSoundContext);
}
