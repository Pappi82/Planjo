'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Flame, Trophy } from 'lucide-react';

interface StreakDisplayProps {
  current: number;
  max: number;
}

export default function StreakDisplay({ current, max }: StreakDisplayProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-white/10 bg-gradient-to-br from-[#291a52]/80 to-[#120b1e]/90">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-white">
          <CardTitle className="text-sm font-semibold">Current streak</CardTitle>
          <Flame className="h-5 w-5 text-[#ff5c87]" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-semibold text-white">{current}</div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Consecutive days</p>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-gradient-to-br from-[#163046]/80 to-[#0a121c]/90">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-white">
          <CardTitle className="text-sm font-semibold">Best streak</CardTitle>
          <Trophy className="h-5 w-5 text-[#ffd966]" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-semibold text-white">{max}</div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Personal record</p>
        </CardContent>
      </Card>
    </div>
  );
}
