import { Bell } from 'lucide-react';
import type { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/crd/primitives/dialog';

/** Consumer copy overrides. Every field defaults to the Space wording. */
export type ApplicationSubmittedDialogCopy = {
  title?: string;
  body?: string;
  /** The review paragraph; a consumer's own `<Trans>` can place `<ApplicationSubmittedBellIcon />` in it. */
  review?: ReactNode;
};

type ApplicationSubmittedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityName?: string;
  copy?: ApplicationSubmittedDialogCopy;
  className?: string;
};

/**
 * Mirrors the notifications button in the top bar, so the review copy points at
 * something the user can actually recognise there.
 */
export function ApplicationSubmittedBellIcon() {
  return <Bell aria-hidden="true" className="inline size-4 shrink-0 align-text-bottom text-foreground" />;
}

export function ApplicationSubmittedDialog({
  open,
  onOpenChange,
  communityName,
  copy,
  className,
}: ApplicationSubmittedDialogProps) {
  const { t } = useTranslation('crd-space');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden', className)}>
        <DialogTitle className="shrink-0">{copy?.title ?? t('apply.submitted.title')}</DialogTitle>
        <div className="flex-1 min-h-0 space-y-3 overflow-y-auto">
          <DialogDescription>
            {copy?.body ?? t('apply.submitted.body', { communityName: communityName ?? '' })}
          </DialogDescription>
          {/* Sibling of DialogDescription, not a child: Radix renders that as a
              <p>, and the inline bell would be illegal markup nested inside it. */}
          <p className="text-body text-muted-foreground">
            {copy?.review ?? (
              <Trans t={t} i18nKey="apply.submitted.review" components={{ bell: <ApplicationSubmittedBellIcon /> }} />
            )}
          </p>
        </div>
        <DialogFooter className="shrink-0">
          <Button type="button" variant="default" onClick={() => onOpenChange(false)}>
            {t('about.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
