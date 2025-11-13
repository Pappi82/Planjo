import { ReactNode, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  trigger?: (open: () => void) => ReactNode;
  tone?: 'danger' | 'accent';
  onConfirm: () => Promise<void> | void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  trigger,
  tone = 'accent',
  onConfirm,
  open: controlledOpen,
  onOpenChange,
}: ConfirmDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setUncontrolledOpen(value);
    }
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {trigger ? trigger(() => setOpen(true)) : null}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              {cancelLabel}
            </Button>
            <Button
              variant={tone === 'danger' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Working...' : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

