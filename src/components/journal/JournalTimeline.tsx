'use client';

import { IJournalEntry } from '@/types';
import { formatDate } from '@/lib/utils';
import { MOOD_OPTIONS_ARRAY } from '@/lib/constants';

interface JournalTimelineProps {
  entries: IJournalEntry[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function JournalTimeline({
  entries,
  selectedDate,
  onSelectDate,
}: JournalTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 px-6 text-center text-white/60">
        <span className="text-sm">Nothing captured yet. Log today’s momentum.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {entries.map((entry) => {
        const isSelected =
          new Date(entry.date).toDateString() === selectedDate.toDateString();
        const moodOption = MOOD_OPTIONS_ARRAY.find((m) => m.value === entry.mood);

        return (
          <button
            key={entry._id.toString()}
            type="button"
            onClick={() => onSelectDate(new Date(entry.date))}
            className={`group w-full rounded-[20px] border border-white/12 px-4 py-4 text-left transition hover:-translate-y-[1px] hover:border-white/35 hover:bg-white/[0.08] ${
              isSelected ? 'border-white/40 bg-white/[0.12]' : 'bg-white/[0.04]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">{formatDate(entry.date)}</p>
                {entry.mood ? (
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{moodOption?.label}</p>
                ) : null}
              </div>
              {entry.content ? (
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-white/60">
                  {entry.content.split(/\s+/).length} words
                </span>
              ) : null}
            </div>
            {entry.content ? (
              <p className="mt-3 line-clamp-2 text-sm text-white/60">
                {entry.content.substring(0, 140)}
                {entry.content.length > 140 ? '…' : ''}
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
