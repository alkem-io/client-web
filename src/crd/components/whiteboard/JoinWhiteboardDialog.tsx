import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogOverlay, DialogPortal } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';

type JoinWhiteboardDialogProps = {
  open: boolean;
  onSubmit: (guestName: string) => void;
  onSignIn: () => void;
  submitting?: boolean;
  validate?: (name: string) => string | undefined;
};

export function JoinWhiteboardDialog({ open, onSubmit, onSignIn, submitting, validate }: JoinWhiteboardDialogProps) {
  const { t } = useTranslation('crd-whiteboard');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const trimmed = name.trim();
  const isEmpty = trimmed.length === 0;

  const handleChange = (value: string) => {
    setName(value);
    if (touched && validate) {
      setError(validate(value.trim()));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (validate) {
      setError(validate(trimmed));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (validate) {
      const validationError = validate(trimmed);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    if (!isEmpty) {
      onSubmit(trimmed);
    }
  };

  const isDisabled = submitting || isEmpty || !!error;

  return (
    <Dialog open={open}>
      <DialogPortal>
        <DialogOverlay />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="bg-background rounded-xl shadow-lg p-10 max-w-[480px] w-full mx-4"
            role="dialog"
            aria-labelledby="join-dialog-title"
          >
            <form onSubmit={handleSubmit} noValidate={true} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">{t('join.welcome')}</p>
                <h1 id="join-dialog-title" className="text-3xl font-medium text-primary">
                  {t('join.title')}
                </h1>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">{t('join.description')}</p>

                <div className="flex flex-col gap-1">
                  <Input
                    value={name}
                    onChange={e => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder={t('join.placeholder')}
                    aria-label={t('join.guestNameLabel')}
                    aria-invalid={touched && !!error}
                    autoComplete="off"
                  />
                  {touched && error && <p className="text-sm text-destructive">{error}</p>}
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
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
