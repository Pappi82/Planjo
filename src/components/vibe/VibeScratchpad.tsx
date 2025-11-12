'use client';

import { Textarea } from '@/components/ui/textarea';

interface VibeScratchpadProps {
  value: string;
  onChange: (value: string) => void;
}

export default function VibeScratchpad({ value, onChange }: VibeScratchpadProps) {
  return (
    <div className="space-y-2 md:space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-white/50">Quick Notes</h3>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Capture thoughts, ideas, or progress notes while in flow..."
        className="min-h-[120px] md:min-h-[150px] bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none rounded-xl md:rounded-2xl p-3 md:p-4 text-sm md:text-base leading-relaxed focus:border-white/40 focus:ring-2 focus:ring-white/10"
      />
    </div>
  );
}
