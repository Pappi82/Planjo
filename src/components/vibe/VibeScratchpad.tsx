'use client';

import { Textarea } from '@/components/ui/textarea';

interface VibeScratchpadProps {
  value: string;
  onChange: (value: string) => void;
}

export default function VibeScratchpad({ value, onChange }: VibeScratchpadProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-white/70">Quick Notes</h3>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Jot down quick thoughts while you work..."
        className="min-h-[150px] bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
      />
    </div>
  );
}
