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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Password Generator</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {password && (
            <div className="space-y-2">
              <Label>Generated Password</Label>
              <div className="flex gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono break-all">
                  {password}
                </code>
                <Button size="icon" variant="ghost" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600">Copied to clipboard!</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Length: {length}</Label>
            <Slider
              value={[length]}
              onValueChange={(value) => setLength(value[0])}
              min={8}
              max={64}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <Label>Character Types</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uppercase"
                  checked={includeUppercase}
                  onCheckedChange={(checked) => setIncludeUppercase(checked as boolean)}
                />
                <label htmlFor="uppercase" className="text-sm cursor-pointer">
                  Uppercase (A-Z)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lowercase"
                  checked={includeLowercase}
                  onCheckedChange={(checked) => setIncludeLowercase(checked as boolean)}
                />
                <label htmlFor="lowercase" className="text-sm cursor-pointer">
                  Lowercase (a-z)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="numbers"
                  checked={includeNumbers}
                  onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
                />
                <label htmlFor="numbers" className="text-sm cursor-pointer">
                  Numbers (0-9)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="symbols"
                  checked={includeSymbols}
                  onCheckedChange={(checked) => setIncludeSymbols(checked as boolean)}
                />
                <label htmlFor="symbols" className="text-sm cursor-pointer">
                  Symbols (!@#$%...)
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generatePassword} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate
            </Button>
            {password && (
              <Button onClick={handleUse} variant="secondary">
                Use This Password
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
