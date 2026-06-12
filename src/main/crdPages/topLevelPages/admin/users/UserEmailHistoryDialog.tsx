import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  EmailChangeHistoryDialog,
  type EmailHistoryEntry,
} from '@/crd/components/admin/users/EmailChangeHistoryDialog';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import type { EmailChangeOutcomeClass } from '@/domain/platformAdmin/domain/users/emailChange/emailChangeOutcome';
import useResolveUserEmailDrift from '@/domain/platformAdmin/domain/users/emailChange/useResolveUserEmailDrift';
import useUserEmailChangeHistory from '@/domain/platformAdmin/domain/users/emailChange/useUserEmailChangeHistory';

type UserEmailHistoryDialogProps = {
  userId: string;
  subjectName: string;
  onClose: () => void;
};

const TONE: Record<EmailChangeOutcomeClass, EmailHistoryEntry['outcomeTone']> = {
  success: 'success',
  'success-with-warning': 'warning',
  failure: 'failure',
};

const DRIFT_OUTCOMES = new Set(['DRIFT_DETECTED', 'DRIFT_RESOLUTION_FAILED']);

/**
 * Integration connector for the email-change history dialog. Reuses the
 * MUI-free `useUserEmailChangeHistory` + `useResolveUserEmailDrift` hooks; maps
 * audit entries to plain-TS view props (translating the outcome label and
 * formatting the timestamp with date-fns), and surfaces drift resolution when
 * the latest change is in a drift state.
 */
export function UserEmailHistoryDialog({ userId, subjectName, onClose }: UserEmailHistoryDialogProps) {
  const { t, i18n } = useTranslation();
  const history = useUserEmailChangeHistory(userId);
  const drift = useResolveUserEmailDrift(userId);
  const locale = resolveDateFnsLocale(i18n.language);

  const entries: EmailHistoryEntry[] = history.entries.map(entry => ({
    id: entry.id,
    timestamp: format(new Date(entry.timestamp), 'PPpp', { locale }),
    outcomeLabel: t(entry.outcome.labelKey),
    outcomeTone: TONE[entry.outcome.class],
    initiatorName: entry.initiatorName,
    oldEmail: entry.oldEmail,
    newEmail: entry.newEmail,
    reason: entry.reason,
    approver: entry.approver,
    failureReason: entry.failureReason,
  }));

  const latest = history.entries[0];
  const isDrift = latest ? DRIFT_OUTCOMES.has(latest.outcome.raw) : false;
  const driftOptions = isDrift
    ? [latest?.oldEmail, latest?.newEmail]
        .filter((email): email is string => Boolean(email))
        .map(email => ({ email, label: email }))
    : [];

  return (
    <EmailChangeHistoryDialog
      open={true}
      onOpenChange={open => {
        if (!open) onClose();
      }}
      subjectName={subjectName}
      entries={entries}
      total={history.total}
      hasMore={history.hasMore}
      loading={history.loading}
      onLoadMore={history.onLoadMore}
      drift={
        isDrift
          ? {
              options: driftOptions,
              onResolve: email => {
                void drift.resolveDrift(email);
              },
              resolving: drift.loading,
              errorMessage: drift.errorMessage,
            }
          : undefined
      }
    />
  );
}
