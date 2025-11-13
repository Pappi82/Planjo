'use client';

import { ReactNode, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { PageHero } from '@/components/layout/PageHero';
import { SectionSurface } from '@/components/layout/SectionSurface';

export default function SettingsPage() {
  const [ambientSound, setAmbientSound] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [focusLength, setFocusLength] = useState([25]);

  return (
    <div className="space-y-10">
      <PageHero
        label="Settings"
        title="Tune the cockpit"
        description="Adjust the feedback loops, motion, and cadence so Planjo matches your personal beat."
        highlight={
          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
            Personalized flow
          </span>
        }
      />

      <SectionSurface>
        <div className="grid gap-6 lg:grid-cols-2">
          <PreferenceCard
            title="Experience"
            description="Dial in the sensory feedback during sprints."
          >
            <ToggleRow
              label="Ambient sound cues"
              description="Layer subtle audio when completing tasks or changing focus."
              checked={ambientSound}
              onChange={setAmbientSound}
            />
            <ToggleRow
              label="Advanced animations"
              description="Glide between boards with enhanced motion."
              checked={animations}
              onChange={setAnimations}
            />
            <div className="space-y-3 rounded-[20px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-white">Focus interval</p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Minutes per sprint</p>
              <Slider
                value={focusLength}
                min={15}
                max={60}
                step={5}
                onValueChange={setFocusLength}
                className="planjo-slider"
              />
              <p className="text-xs text-white/60">{focusLength[0]} minute sprints</p>
            </div>
          </PreferenceCard>

          <PreferenceCard
            title="Account"
            description="Manage credentials and session integrity."
          >
            <Button variant="outline" className="w-full rounded-full border-white/25 bg-white/5 text-white/80 hover:text-white">
              Update email
            </Button>
            <Button variant="outline" className="w-full rounded-full border-white/25 bg-white/5 text-white/80 hover:text-white">
              Change password
            </Button>
            <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 text-destructive hover:text-destructive">
              Sign out everywhere
            </Button>
          </PreferenceCard>
        </div>
      </SectionSurface>
    </div>
  );
}

interface PreferenceCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

function PreferenceCard({ title, description, children }: PreferenceCardProps) {
  return (
    <Card className="rounded-[28px] border-white/12 bg-white/[0.06] p-6 text-white shadow-[0_24px_48px_rgba(5,8,26,0.45)]">
      <CardHeader className="space-y-2 p-0">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <p className="text-sm text-white/60">{description}</p>
      </CardHeader>
      <CardContent className="mt-5 space-y-5 p-0 text-white">
        {children}
      </CardContent>
    </Card>
  );
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <label className="flex items-start gap-4 rounded-[20px] border border-white/10 bg-white/5 p-4">
      <Checkbox
        className="mt-1 border-white/30"
        checked={checked}
        onCheckedChange={(value) => onChange(!!value)}
      />
      <div className="space-y-1">
        <p className="font-medium text-white">{label}</p>
        <p className="text-xs text-white/60">{description}</p>
      </div>
    </label>
  );
}
