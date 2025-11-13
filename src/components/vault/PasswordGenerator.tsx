'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, RefreshCw } from 'lucide-react';

interface PasswordGeneratorProps {
  open: boolean;
  onClose: () => void;
  onUse: (password: string) => void;
}

export default function PasswordGenerator({ open, onClose, onUse }: PasswordGeneratorProps) {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      setPassword('');
      return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUse = () => {
    onUse(password);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-[26px] border-white/12 bg-slate-950/90">
        <DialogHeader>
          <DialogTitle>Password generator</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-white">
          {password ? (
            <div className="space-y-2">
              <Label>Generated password</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all rounded-[16px] border border-white/15 bg-white/5 px-4 py-2 text-sm font-mono text-white">
                  {password}
                </code>
                <Button size="icon" variant="ghost" className="rounded-full border border-white/15 bg-white/10" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied ? <p className="text-xs text-[#38f8c7]">Copied to clipboard!</p> : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-white/70">
              <Label>Length</Label>
              <span>{length}</span>
            </div>
            <Slider value={[length]} onValueChange={(value) => setLength(value[0])} min={8} max={64} step={1} className="planjo-slider" />
          </div>

          <div className="space-y-3">
            <Label>Character types</Label>
            <div className="space-y-2 text-sm text-white/75">
              <CharacterToggle label="Uppercase (A-Z)" id="uppercase" checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
              <CharacterToggle label="Lowercase (a-z)" id="lowercase" checked={includeLowercase} onCheckedChange={setIncludeLowercase} />
              <CharacterToggle label="Numbers (0-9)" id="numbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
              <CharacterToggle label="Symbols (!@#$%...)" id="symbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={generatePassword} className="flex-1 rounded-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate
            </Button>
            {password ? (
              <Button onClick={handleUse} variant="outline" className="rounded-full border-white/25 bg-white/5 text-white/80 hover:text-white">
                Use this password
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CharacterToggleProps {
  label: string;
  id: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

function CharacterToggle({ label, id, checked, onCheckedChange }: CharacterToggleProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 rounded-[14px] border border-white/10 bg-white/5 px-3 py-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(!!value)}
        className="border-white/30"
      />
      <span>{label}</span>
    </label>
  );
}
