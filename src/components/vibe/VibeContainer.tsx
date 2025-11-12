'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ITask } from '@/types';
import PomodoroTimer from './PomodoroTimer';
import VibeScratchpad from './VibeScratchpad';
import { X, CheckCircle2 } from 'lucide-react';

interface VibeContainerProps {
  task: ITask;
  onClose: () => void;
  onComplete: () => void;
}

export default function VibeContainer({ task, onClose, onComplete }: VibeContainerProps) {
  const [scratchpad, setScratchpad] = useState('');
  const [bgColor, setBgColor] = useState('#1E293B');

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  const backgrounds = [
    { name: 'Dark', color: '#1E293B' },
    { name: 'Purple', color: '#4C1D95' },
    { name: 'Blue', color: '#1E3A8A' },
    { name: 'Green', color: '#14532D' },
    { name: 'Gray', color: '#374151' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: bgColor }}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#120b35] via-[#05060f] to-[#021016] opacity-80" />
      <div className="absolute inset-0 animate-[planjoDrift_30s_linear_infinite] bg-[radial-gradient(circle_at_20%_20%,rgba(140,111,247,0.4),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(56,248,199,0.25),transparent_40%)] blur-3xl opacity-60" />
      <div className="relative z-10 w-full max-w-4xl space-y-8 rounded-[40px] border border-white/10 bg-gradient-to-br from-[rgba(12,15,38,0.95)] to-[rgba(4,7,20,0.95)] p-8 shadow-[0_50px_120px_rgba(0,0,0,0.75)]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 text-white">
            <Badge variant="secondary" className="text-xs uppercase tracking-[0.3em]">
              {task.priority}
            </Badge>
            <h1 className="text-4xl font-semibold">{task.title}</h1>
            {task.description && <p className="text-white/70">{task.description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <PomodoroTimer />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <VibeScratchpad value={scratchpad} onChange={setScratchpad} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-white">
          <div className="flex gap-3">
            {backgrounds.map((bg) => (
              <button
                key={bg.name}
                className="h-12 w-12 rounded-2xl border-2 border-white/10 transition hover:border-white/40"
                style={{ backgroundColor: bg.color }}
                onClick={() => setBgColor(bg.color)}
                title={bg.name}
              />
            ))}
          </div>
          <Button size="lg" onClick={onComplete}>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Mark complete
          </Button>
        </div>

        <p className="text-center text-white/50 text-sm">Press ESC to exit Vibe mode</p>
      </div>
    </div>
  );
}
