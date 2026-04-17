import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContentRaw, DialogOverlay, DialogPortal } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';

type JoinWhiteboardDialogProps = {
  open: boolean;
  value: string;
  error?: string;
  touched?: boolean;
  submitting?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  onSubmit: () => void;
  onSignIn: () => void;
  className?: string;
};

export function JoinWhiteboardDialog({
  open,
  value,
  error,
  touched,
  submitting,
  onChange,
  onBlur,
  onSubmit,
  onSignIn,
  className,
}: JoinWhiteboardDialogProps) {
  const { t } = useTranslation('crd-whiteboard');
  const titleId = useId();
  const showError = !!touched && !!error;
  const isDisabled = submitting || value.trim().length === 0 || showError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContentRaw
          aria-labelledby={titleId}
          onInteractOutside={e => e.preventDefault()}
          onEscapeKeyDown={e => e.preventDefault()}
          className={cn(
            'fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
            'bg-background rounded-xl shadow-lg p-10 max-w-[480px] w-[calc(100%-2rem)]',
            className
          )}
        >
          <form onSubmit={handleSubmit} noValidate={true} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">{t('join.welcome')}</p>
              <h1 id={titleId} className="text-3xl font-medium text-primary">
                {t('join.title')}
              </h1>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">{t('join.description')}</p>

              <div className="flex flex-col gap-1">
                <Input
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  onBlur={onBlur}
                  placeholder={t('join.placeholder')}
                  aria-label={t('join.guestNameLabel')}
                  aria-invalid={showError}
                  autoComplete="off"
                />
                {showError && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <Button type="submit" className="w-full py-2.5" disabled={isDisabled} aria-busy={submitting}>
                {submitting ? t('join.joiningButton') : t('join.joinButton')}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full py-2.5"
                onClick={onSignIn}
                disabled={submitting}
              >
                {t('join.signInButton')}
              </Button>
            </div>
          </form>
        </DialogContentRaw>
      </DialogPortal>
    </Dialog>
  );
}
