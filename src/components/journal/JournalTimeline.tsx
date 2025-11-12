'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IJournalEntry } from '@/types';
import { Calendar } from 'lucide-react';
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
      <div className="p-6 text-center text-white/60">
        Nothing captured yet. Log today&rsquo;s momentum.
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
          <Card
            key={entry._id.toString()}
            className={`cursor-pointer border-white/10 bg-white/0 transition ${
              isSelected ? 'border-white/30 bg-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.4)]' : 'hover:border-white/20 hover:bg-white/5'
            }`}
            onClick={() => onSelectDate(new Date(entry.date))}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm text-white">{formatDate(entry.date)}</CardTitle>
                  {entry.mood && (
                    <CardDescription className="text-xs text-white/60">
                      {moodOption?.label}
                    </CardDescription>
                  )}
                </div>
                {entry.content && (
                  <Badge variant="outline" className="text-xs text-white/70">
                    {entry.content.split(/\s+/).length} words
                  </Badge>
                )}
              </div>
            </CardHeader>
            {entry.content && (
              <CardContent>
                <p className="text-sm text-white/60 line-clamp-2">
                  {entry.content.substring(0, 100)}...
                </p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
