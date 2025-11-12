'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import JournalEntry from '@/components/journal/JournalEntry';
import JournalTimeline from '@/components/journal/JournalTimeline';
import { CalendarIcon, BookOpen } from 'lucide-react';
import { formatDate } from '@/lib/utils';

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
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="space-y-4 border-b border-white/10 p-6">
          <div className="flex items-center gap-2 text-white">
            <BookOpen className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Code Journal</h2>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDate(selectedDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button className="w-full" onClick={() => setSelectedDate(new Date())}>
            Jump to today
          </Button>
        </div>

        <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
          <JournalTimeline entries={entries} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>
      </div>

      <JournalEntry date={selectedDate} entry={currentEntry} onSave={handleSave} />
    </div>
  );
}
