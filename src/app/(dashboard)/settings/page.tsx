'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function SettingsPage() {
  const [ambientSound, setAmbientSound] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [focusLength, setFocusLength] = useState([25]);

  return (
    <div className="space-y-6">
      <div className="planjo-panel rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-semibold text-white">Settings</h1>
        <p className="text-white/60">Tune Planjo to match your flow preference.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <label className="flex items-center gap-3">
              <Checkbox checked={ambientSound} onCheckedChange={(checked) => setAmbientSound(!!checked)} />
              <span>Ambient sound cues</span>
            </label>
            <label className="flex items-center gap-3">
              <Checkbox checked={animations} onCheckedChange={(checked) => setAnimations(!!checked)} />
              <span>Advanced animations</span>
            </label>
            <div>
              <p className="mb-2 text-sm text-white/60">Focus interval (minutes)</p>
              <Slider value={focusLength} min={15} max={60} step={5} onValueChange={setFocusLength} />
              <p className="mt-2 text-xs text-white/60">{focusLength[0]} minute sprints</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <Button variant="outline" className="w-full">
              Update email
            </Button>
            <Button variant="outline" className="w-full">
              Change password
            </Button>
            <Button variant="ghost" className="text-destructive">
              Sign out everywhere
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
