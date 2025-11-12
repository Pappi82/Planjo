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
    <div className="space-y-4 md:space-y-6">
      <div className="text-center space-y-2 md:space-y-3">
        <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-white/50">{mode} Session</p>
        <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-mono text-white tracking-tight">
          {String(minutes).padStart(2, '0')}
          <span className="text-white/40">:</span>
          {String(seconds).padStart(2, '0')}
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2 md:h-3 bg-white/10" />
        <div className="flex justify-between text-xs text-white/40">
          <span>{mode === 'work' ? '25:00' : '05:00'}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="flex gap-2 md:gap-3 justify-center pt-2">
        <Button
          size="lg"
          onClick={toggleTimer}
          className="bg-gradient-to-r from-[#8B5CF6] to-[#38f8c7] hover:opacity-90 text-white font-semibold px-6 md:px-8 rounded-2xl h-12 md:h-14 text-sm md:text-base"
        >
          {isActive ? (
            <>
              <Pause className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Start
            </>
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={resetTimer}
          className="border-white/20 text-white hover:bg-white/10 rounded-2xl h-12 md:h-14 px-4 md:px-6"
        >
          <RotateCcw className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
    </div>
  );
}
