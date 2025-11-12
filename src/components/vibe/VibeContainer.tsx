'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ITask } from '@/types';
import PomodoroTimer from './PomodoroTimer';
import VibeScratchpad from './VibeScratchpad';
import AmbientSoundPlayer from './AmbientSoundPlayer';
import { X, CheckCircle2 } from 'lucide-react';

interface VibeContainerProps {
  task: ITask;
  onClose: () => void;
  onComplete: () => void;
}

export default function VibeContainer({ task, onClose, onComplete }: VibeContainerProps) {
  console.log('[VibeContainer] Rendering with task:', task?._id);

  const [scratchpad, setScratchpad] = useState('');
  const [bgColor, setBgColor] = useState('#02030a');

  // Load existing vibe notes when component mounts
  useEffect(() => {
    console.log('[VibeContainer] Loading vibe notes for task:', task._id);
    if (task.vibeNotes) {
      setScratchpad(task.vibeNotes);
    }
  }, [task._id]);

  // Auto-save scratchpad notes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (scratchpad !== (task.vibeNotes || '')) {
        try {
          await fetch(`/api/tasks/${task._id.toString()}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vibeNotes: scratchpad }),
          });
        } catch (error) {
          console.error('Error saving vibe notes:', error);
        }
      }
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [scratchpad, task._id, task.vibeNotes]);

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
    { name: 'Deep Space', color: '#02030a' },
    { name: 'Purple Haze', color: '#291a52' },
    { name: 'Ocean Deep', color: '#0a1628' },
    { name: 'Forest Night', color: '#0d1f1a' },
    { name: 'Midnight', color: '#0f0f1e' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6" style={{ backgroundColor: bgColor }}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#120b35] via-[#05060f] to-[#021016] opacity-90" />
      <div className="absolute inset-0 animate-[planjoDrift_30s_linear_infinite] bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.3),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(56,248,199,0.2),transparent_50%),radial-gradient(circle_at_50%_50%,rgba(255,92,135,0.15),transparent_60%)] blur-3xl opacity-70" />
      <div className="planjo-grid absolute inset-0 opacity-20" />
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-4 md:space-y-6 rounded-[32px] md:rounded-[40px] border border-white/10 bg-gradient-to-br from-[rgba(12,15,38,0.98)] to-[rgba(4,7,20,0.98)] p-6 md:p-10 shadow-[0_50px_120px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4 md:pb-6">
          <div className="space-y-2 md:space-y-3 text-white flex-1">
            <div className="flex items-center gap-2 md:gap-3">
              <Badge variant="secondary" className="planjo-pill text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.3em] bg-white/10 text-white/70 border-white/10">
                {task.priority}
              </Badge>
              <span className="text-xs text-white/40">•</span>
              <span className="text-xs text-white/40 uppercase tracking-wider">Focus Session</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">{task.title}</h1>
            {task.description && <p className="text-base md:text-lg text-white/60 leading-relaxed">{task.description}</p>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-2xl h-12 w-12"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Pomodoro Timer */}
        <div className="planjo-panel rounded-2xl md:rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 md:p-8 backdrop-blur-sm">
          <PomodoroTimer />
        </div>

        {/* Ambient Sounds */}
        <div className="planjo-panel rounded-2xl md:rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 md:p-6 backdrop-blur-sm">
          <AmbientSoundPlayer />
        </div>

        {/* Scratchpad */}
        <div className="planjo-panel rounded-2xl md:rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 md:p-6 backdrop-blur-sm">
          <VibeScratchpad value={scratchpad} onChange={setScratchpad} />
        </div>

        {/* Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 pt-3 md:pt-4 border-t border-white/5">
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wider">Ambience</p>
            <div className="flex gap-2">
              {backgrounds.map((bg) => (
                <button
                  key={bg.name}
                  className={`h-10 w-10 rounded-xl border-2 transition-all hover:scale-110 ${
                    bgColor === bg.color ? 'border-white/60 ring-2 ring-white/20' : 'border-white/10 hover:border-white/30'
                  }`}
                  style={{ backgroundColor: bg.color }}
                  onClick={() => setBgColor(bg.color)}
                  title={bg.name}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-white/40">Press <kbd className="px-2 py-1 rounded bg-white/10 text-white/60 text-xs font-mono">ESC</kbd> to exit</p>
            <Button
              size="lg"
              onClick={onComplete}
              className="bg-gradient-to-r from-[#8B5CF6] to-[#38f8c7] hover:opacity-90 text-white font-semibold px-8 rounded-2xl"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Mark Complete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
