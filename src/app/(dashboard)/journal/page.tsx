'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import JournalEntry from '@/components/journal/JournalEntry';
import JournalTimeline from '@/components/journal/JournalTimeline';
import { CalendarIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { PageHero } from '@/components/layout/PageHero';
import { SectionSurface } from '@/components/layout/SectionSurface';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data, mutate } = useSWR('/api/journal', fetcher);
  const entries = data?.entries || [];

  const dateStr = selectedDate.toISOString().split('T')[0];
  const { data: entryData } = useSWR(`/api/journal/${dateStr}`, fetcher);
  const currentEntry = entryData?.entry;

  const handleSave = async (date: string, content: string, mood?: string) => {
    await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, content, mood }),
    });
    mutate();
  };

  return (
    <div className="space-y-10">
      <PageHero
        label="Journal"
        title="Momentum log"
        description="Capture what moved, what you felt, and what should happen next. The journal keeps your solo cadence honest."
        meta={
          <div className="space-y-1 text-right sm:text-left">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Entries logged</p>
            <p className="text-sm text-white">{entries.length} total</p>
          </div>
        }
        actions={
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-full border-white/25 bg-white/5 text-white/80 hover:text-white">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDate(selectedDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto rounded-[22px] border border-white/10 bg-slate-950/90 p-0 shadow-[0_24px_60px_rgba(2,4,12,0.55)] backdrop-blur-xl" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        }
      />

      <SectionSurface>
        <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
          <div className="relative flex max-h-[calc(100vh-340px)] flex-col overflow-hidden rounded-[26px] border border-white/12 bg-white/[0.06] shadow-[0_24px_48px_rgba(5,8,26,0.45)]">
            <div className="space-y-4 border-b border-white/12 p-6">
              <div className="space-y-2 text-white">
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Navigator</p>
                <h2 className="text-xl font-semibold">Entry timeline</h2>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-full border-white/25 bg-white/5 text-white/80 hover:text-white"
                onClick={() => setSelectedDate(new Date())}
              >
                Jump to today
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <JournalTimeline entries={entries} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            </div>
          </div>

          <JournalEntry date={selectedDate} entry={currentEntry} onSave={handleSave} />
        </div>
      </SectionSurface>
    </div>
  );
}
