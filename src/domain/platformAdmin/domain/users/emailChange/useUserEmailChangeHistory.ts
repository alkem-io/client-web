import { useTranslation } from 'react-i18next';
import { useUserEmailChangeAuditEntriesQuery } from '@/core/apollo/generated/apollo-hooks';
import { type EmailChangeOutcomeView, getEmailChangeOutcomeView } from './emailChangeOutcome';

const PAGE_SIZE = 10;

export type EmailChangeHistoryEntryView = {
  id: string;
  timestamp: Date;
  outcome: EmailChangeOutcomeView;
  initiatorName: string;
  subjectName: string;
  oldEmail: string | undefined;
  newEmail: string | undefined;
  failureReason: string | undefined;
  reason: string | undefined;
  approver: string | undefined;
};

export type EmailChangeHistoryView = {
  entries: EmailChangeHistoryEntryView[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
};

const formatApprover = (
  approver: { name: string; role: string; organization?: string } | null | undefined
): string | undefined => {
  if (!approver) {
    return undefined;
  }
  const base = `${approver.name} (${approver.role})`;
  return approver.organization ? `${base} — ${approver.organization}` : base;
};

const useUserEmailChangeHistory = (userId: string | undefined): EmailChangeHistoryView => {
  const { t } = useTranslation();

  const { data, loading, fetchMore } = useUserEmailChangeAuditEntriesQuery({
    variables: { userID: userId ?? '', first: PAGE_SIZE },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  const connection = data?.platformAdmin.userEmailChangeAuditEntries;
  const pageInfo = connection?.pageInfo;

  const entries = (connection?.auditEntries ?? []).map<EmailChangeHistoryEntryView>(entry => ({
    id: entry.id,
    timestamp: entry.timestamp,
    outcome: getEmailChangeOutcomeView(entry.outcome),
    initiatorName: entry.initiator?.displayName ?? t('pages.admin.users.emailChange.history.unknownInitiator'),
    subjectName: entry.subject.displayName,
    oldEmail: entry.oldEmail,
    newEmail: entry.newEmail,
    failureReason: entry.failureReason,
    reason: entry.reason,
    approver: formatApprover(entry.approver),
  }));

  const onLoadMore = () => {
    if (!userId || !pageInfo?.hasNextPage || !pageInfo.endCursor) {
      return;
    }
    fetchMore({
      variables: { userID: userId, first: PAGE_SIZE, after: pageInfo.endCursor },
      updateQuery: (previous, { fetchMoreResult }) => {
        const incoming = fetchMoreResult.platformAdmin.userEmailChangeAuditEntries;
        return {
          ...fetchMoreResult,
          platformAdmin: {
            ...fetchMoreResult.platformAdmin,
            userEmailChangeAuditEntries: {
              ...incoming,
              auditEntries: [
                ...previous.platformAdmin.userEmailChangeAuditEntries.auditEntries,
                ...incoming.auditEntries,
              ],
            },
          },
        };
      },
    });
  };

  return {
    entries,
    total: connection?.total ?? 0,
    hasMore: pageInfo?.hasNextPage ?? false,
    loading,
    onLoadMore,
  };
};

export default useUserEmailChangeHistory;
