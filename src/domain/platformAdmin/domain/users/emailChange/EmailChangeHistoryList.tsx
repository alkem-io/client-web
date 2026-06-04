import { Box, Button, Paper, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { gutters } from '@/core/ui/grid/utils';
import Loading from '@/core/ui/loading/Loading';
import { BlockSectionTitle, Caption, Text } from '@/core/ui/typography';
import { formatDateTime } from '@/core/utils/time/utils';
import EmailChangeOutcomeChip from './EmailChangeOutcomeChip';
import type { EmailChangeHistoryView } from './useUserEmailChangeHistory';

const HistoryField = ({ label, value }: { label: string; value: string }) => (
  <Box display="flex" gap={gutters(0.5)} flexWrap="wrap">
    <Caption color="neutral.light">{label}</Caption>
    <Text>{value}</Text>
  </Box>
);

const EmailChangeHistoryList = ({ entries, hasMore, loading, onLoadMore }: EmailChangeHistoryView) => {
  const { t } = useTranslation();

  if (loading && entries.length === 0) {
    return <Loading text={t('pages.admin.users.emailChange.history.title')} />;
  }

  if (entries.length === 0) {
    return <Caption>{t('pages.admin.users.emailChange.history.empty')}</Caption>;
  }

  return (
    <Stack gap={gutters()}>
      {entries.map(entry => (
        <Paper key={entry.id} variant="outlined" sx={{ padding: gutters() }}>
          <Stack gap={gutters(0.5)}>
            <Box display="flex" justifyContent="space-between" alignItems="center" gap={gutters(0.5)}>
              <BlockSectionTitle>{formatDateTime(entry.timestamp)}</BlockSectionTitle>
              <EmailChangeOutcomeChip outcome={entry.outcome} />
            </Box>
            <HistoryField
              label={t('pages.admin.users.emailChange.history.fields.initiator')}
              value={entry.initiatorName}
            />
            {entry.oldEmail && (
              <HistoryField label={t('pages.admin.users.emailChange.history.fields.oldEmail')} value={entry.oldEmail} />
            )}
            {entry.newEmail && (
              <HistoryField label={t('pages.admin.users.emailChange.history.fields.newEmail')} value={entry.newEmail} />
            )}
            {entry.reason && (
              <HistoryField label={t('pages.admin.users.emailChange.history.fields.reason')} value={entry.reason} />
            )}
            {entry.approver && (
              <HistoryField label={t('pages.admin.users.emailChange.history.fields.approver')} value={entry.approver} />
            )}
            {entry.failureReason && (
              <HistoryField
                label={t('pages.admin.users.emailChange.history.fields.failureReason')}
                value={entry.failureReason}
              />
            )}
          </Stack>
        </Paper>
      ))}
      {hasMore && (
        <Button variant="outlined" onClick={onLoadMore} loading={loading} sx={{ alignSelf: 'start' }}>
          {t('pages.admin.users.emailChange.history.loadMore')}
        </Button>
      )}
    </Stack>
  );
};

export default EmailChangeHistoryList;
