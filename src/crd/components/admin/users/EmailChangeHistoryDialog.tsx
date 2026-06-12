import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';

export type EmailHistoryEntry = {
  id: string;
  /** Pre-formatted timestamp. */
  timestamp: string;
  /** Translated outcome label. */
  outcomeLabel: string;
  outcomeTone: 'success' | 'warning' | 'failure';
  initiatorName: string;
  oldEmail?: string;
  newEmail?: string;
  reason?: string;
  approver?: string;
  failureReason?: string;
};

export type EmailHistoryDriftOption = { email: string; label: string };

type EmailChangeHistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectName: string;
  entries: EmailHistoryEntry[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  /** Present only when the latest change is in a drift state. */
  drift?: {
    options: EmailHistoryDriftOption[];
    onResolve: (canonicalEmail: string) => void;
    resolving: boolean;
    errorMessage?: string;
  };
};

const TONE_VARIANT = {
  success: 'secondary',
  warning: 'outline',
  failure: 'destructive',
} as const;

/**
 * Read-only email-change audit history for a user, with optional drift
 * resolution (pick the canonical address when the stored and authenticated
 * emails diverge). Pure presentation; data + mutations live in the connector.
 */
export function EmailChangeHistoryDialog({
  open,
  onOpenChange,
  subjectName,
  entries,
  total,
  hasMore,
  loading,
  onLoadMore,
  drift,
}: EmailChangeHistoryDialogProps) {
  const { t } = useTranslation('crd-admin');
  const [pendingCanonical, setPendingCanonical] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl flex max-h-[90vh] flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t('users.history.title', { name: subjectName })}</DialogTitle>
          <DialogDescription>{t('users.history.showing', { count: entries.length, total })}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto">
          {drift && (
            <div className="flex flex-col gap-2 rounded-lg border-2 border-destructive p-3">
              <p className="text-body-emphasis text-destructive flex items-center gap-2">
                <AlertTriangle aria-hidden="true" className="size-4" />
                {t('users.history.drift.title')}
              </p>
              <p className="text-body text-muted-foreground">{t('users.history.drift.description')}</p>
              <div className="flex flex-wrap gap-2">
                {drift.options.map(option => (
                  <Button
                    key={option.email}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={drift.resolving}
                    onClick={() => setPendingCanonical(option.email)}
                  >
                    {t('users.history.drift.resolveAs', { email: option.label })}
                  </Button>
                ))}
              </div>
              {drift.errorMessage ? <p className="text-caption text-destructive">{drift.errorMessage}</p> : null}
            </div>
          )}

          {entries.length === 0 && !loading ? (
            <p className="text-body text-muted-foreground">{t('users.history.empty')}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {entries.map(entry => (
                <li key={entry.id} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={TONE_VARIANT[entry.outcomeTone]}>{entry.outcomeLabel}</Badge>
                    <span className="text-caption text-muted-foreground">{entry.timestamp}</span>
                  </div>
                  {(entry.oldEmail || entry.newEmail) && (
                    <p className="text-body flex items-center gap-2 break-all">
                      <span>{entry.oldEmail}</span>
                      <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                      <span>{entry.newEmail}</span>
                    </p>
                  )}
                  <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-caption">
                    <dt className="text-muted-foreground">{t('users.history.initiator')}</dt>
                    <dd>{entry.initiatorName}</dd>
                    {entry.reason ? (
                      <>
                        <dt className="text-muted-foreground">{t('users.history.reason')}</dt>
                        <dd className="break-words">{entry.reason}</dd>
                      </>
                    ) : null}
                    {entry.approver ? (
                      <>
                        <dt className="text-muted-foreground">{t('users.history.approver')}</dt>
                        <dd className="break-words">{entry.approver}</dd>
                      </>
                    ) : null}
                    {entry.failureReason ? (
                      <>
                        <dt className="text-muted-foreground">{t('users.history.failureReason')}</dt>
                        <dd className="text-destructive break-words">{entry.failureReason}</dd>
                      </>
                    ) : null}
                  </dl>
                </li>
              ))}
            </ul>
          )}

          {hasMore && (
            <div className="flex justify-center">
              <Button type="button" variant="outline" onClick={onLoadMore} disabled={loading} aria-busy={loading}>
                {t('users.history.loadMore')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      {drift && (
        <ConfirmationDialog
          open={Boolean(pendingCanonical)}
          onOpenChange={openState => {
            if (!openState) setPendingCanonical(null);
          }}
          variant="destructive"
          title={t('users.history.drift.confirmTitle')}
          description={t('users.history.drift.confirmDescription', { email: pendingCanonical ?? '' })}
          confirmLabel={t('users.history.drift.resolve')}
          loading={drift.resolving}
          onConfirm={() => {
            if (pendingCanonical) drift.onResolve(pendingCanonical);
            setPendingCanonical(null);
          }}
        />
      )}
    </Dialog>
  );
}
