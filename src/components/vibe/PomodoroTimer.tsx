'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface PomodoroTimerProps {
  onComplete?: () => void;
}

export default function PomodoroTimer({ onComplete }: PomodoroTimerProps) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  const totalSeconds = mode === 'work' ? 25 * 60 : 5 * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            if (mode === 'work') {
              setMode('break');
              setMinutes(5);
            } else {
              setMode('work');
              setMinutes(25);
            }
            onComplete?.();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode, onComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'work') {
      setMinutes(25);
    } else {
      setMinutes(5);
    }
    setSeconds(0);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-6xl font-bold font-mono text-white">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <p className="text-white/70 mt-2 capitalize">{mode} Time</p>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="flex gap-2 justify-center">
        <Button size="lg" onClick={toggleTimer} className="bg-white text-black hover:bg-white/90">
          {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <Button size="lg" variant="outline" onClick={resetTimer} className="border-white/20 text-white hover:bg-white/10">
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
