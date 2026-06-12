import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { gutters } from '@/core/ui/grid/utils';
import { type ConfirmationPart, ProposedWriteKind } from './types';

/**
 * The consolidated, itemized write proposal (US2 / FR-015): each
 * `{ toolName, kind, summary, targetRef? }` item is listed and a **single**
 * Approve / Decline control covers the whole set. Nothing changes until the user
 * approves; declining ends the turn with no change (SC-002). Destructive items
 * are flagged so the user sees what may be overwritten.
 *
 * The decision is posted by the consumer (`useAssistantConversation`
 * .submitConfirmationDecision), which resumes the same SSE protocol; on
 * approve the results stream in, a stale destructive target yields a fresh
 * `confirmation-request` (which replaces this part), and an expired/invalid set
 * surfaces the "please re-ask" message (handled by the error UI).
 */
export const AssistantConfirmation = ({
  part,
  disabled,
  onApprove,
  onDecline,
}: {
  part: ConfirmationPart;
  /** True while a decision is in flight (avoids double-submit). */
  disabled: boolean;
  onApprove: () => void;
  onDecline: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <Paper
      variant="outlined"
      sx={{ padding: gutters(0.75), borderColor: 'warning.main' }}
      role="group"
      aria-label={t('assistant.confirmation.title')}
    >
      <Box display="flex" flexDirection="column" gap={gutters(0.5)}>
        <Typography variant="subtitle2">{t('assistant.confirmation.title')}</Typography>
        <Typography variant="caption" color="text.secondary">
          {t('assistant.confirmation.description')}
        </Typography>

        <Box
          component="ul"
          sx={{ listStyle: 'none', margin: 0, padding: 0 }}
          display="flex"
          flexDirection="column"
          gap={gutters(0.5)}
        >
          {part.items.map((item, index) => {
            const isDestructive = item.kind === ProposedWriteKind.WriteDestructive;
            return (
              <Box
                component="li"
                key={`${item.toolName}-${index}`}
                display="flex"
                alignItems="flex-start"
                gap={gutters(0.5)}
              >
                {isDestructive ? (
                  <WarningAmberIcon fontSize="small" color="warning" aria-hidden={true} />
                ) : (
                  <AddCircleOutlineIcon fontSize="small" color="action" aria-hidden={true} />
                )}
                <Box display="flex" flexDirection="column">
                  <Typography variant="body2">{item.summary}</Typography>
                  {isDestructive && (
                    <Typography variant="caption" color="warning.main">
                      {t('assistant.confirmation.destructiveItem')}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box display="flex" gap={gutters(0.5)} justifyContent="flex-end" marginTop={gutters(0.25)}>
          <Button onClick={onDecline} disabled={disabled} color="inherit" size="small">
            {t('assistant.confirmation.decline')}
          </Button>
          <Button onClick={onApprove} disabled={disabled} variant="contained" size="small">
            {t('assistant.confirmation.approve')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
