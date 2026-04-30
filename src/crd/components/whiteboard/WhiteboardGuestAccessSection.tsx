import { Copy, Loader2, X } from 'lucide-react';
import { useId } from 'react';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';

type WhiteboardGuestAccessSectionProps = {
  canToggle: boolean;
  enabled: boolean;
  guestLink?: string;
  isUpdating: boolean;
  hasError: boolean;
  /** Pre-translated copy supplied by the consumer — keeps the component free of the default i18n namespace. */
  label: string;
  toggleDescription: string;
  toggleAriaLabel: string;
  urlLabel: string;
  copyAriaLabel: string;
  errorMessage: string;
  errorDismissAriaLabel: string;
  onToggle: (next: boolean) => void;
  onResetError: () => void;
  onCopy: () => void;
  className?: string;
};

export function WhiteboardGuestAccessSection({
  canToggle,
  enabled,
  guestLink,
  isUpdating,
  hasError,
  label,
  toggleDescription,
  toggleAriaLabel,
  urlLabel,
  copyAriaLabel,
  errorMessage,
  errorDismissAriaLabel,
  onToggle,
  onResetError,
  onCopy,
  className,
}: WhiteboardGuestAccessSectionProps) {
  const labelId = useId();
  const urlId = useId();

  return (
    <div className={cn('flex w-full flex-col gap-3', className)} data-testid="guest-access-section">
      {canToggle && (
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span id={labelId} className="text-body-emphasis text-foreground">
              {label}
            </span>
            <span className="text-caption text-muted-foreground">{toggleDescription}</span>
          </div>
          {isUpdating ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
          ) : (
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              aria-label={toggleAriaLabel}
              aria-labelledby={labelId}
            />
          )}
        </div>
      )}

      {hasError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-caption text-destructive"
          data-testid="guest-access-error"
        >
          <span>{errorMessage}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onResetError}
            aria-label={errorDismissAriaLabel}
            className="-mt-0.5 -mr-1 size-5 shrink-0 text-destructive hover:bg-destructive/20"
          >
            <X className="size-3" aria-hidden="true" />
          </Button>
        </div>
      )}

      {enabled && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={urlId} className="text-caption text-muted-foreground">
            {urlLabel}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id={urlId}
              value={guestLink ?? ''}
              readOnly={true}
              onClick={e => e.currentTarget.select()}
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={onCopy} aria-label={copyAriaLabel} disabled={!guestLink}>
              <Copy className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
