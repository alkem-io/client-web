import { Box, LinearProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { gutters } from '@/core/ui/grid/utils';
import type { AssistantBudget } from './types';

/**
 * The unobtrusive read-only monthly usage meter (D1 — T049 /
 * assistant-access-and-budget.md §7): "X of Y monthly tokens · resets on the
 * 1st", rendered in the assistant-panel header. Source is the asvc budget
 * endpoint (useAssistantBudget); this component is purely presentational and
 * enforces nothing.
 *
 * D3 — when `tokensPerMonth` is null/absent there is no resolvable limit, so we
 * MUST NOT render a misleading "0 of 0" / 0-limit bar: show a plain "no limit
 * configured" caption with no progress bar instead.
 */
const AssistantBudgetMeter = ({ budget }: { budget: AssistantBudget | null }) => {
  const { t } = useTranslation();

  if (!budget) {
    return null;
  }

  const { tokensPerMonth, monthToDateUsed } = budget;

  // D3: no resolvable allowance → informational caption, never a 0-limit meter.
  if (tokensPerMonth === null || tokensPerMonth === undefined) {
    return (
      <Box paddingX={gutters(0.5)} paddingBottom={gutters(0.25)}>
        <Typography variant="caption" color="text.secondary">
          {t('assistant.budget.noLimit')}
        </Typography>
      </Box>
    );
  }

  const used = Math.max(0, monthToDateUsed);
  const fraction = tokensPerMonth > 0 ? Math.min(1, used / tokensPerMonth) : 0;
  const percent = Math.round(fraction * 100);

  return (
    <Box
      paddingX={gutters(0.5)}
      paddingBottom={gutters(0.25)}
      display="flex"
      flexDirection="column"
      gap={gutters(0.25)}
    >
      <Typography variant="caption" color="text.secondary">
        {t('assistant.budget.usage', {
          used: used.toLocaleString(),
          limit: tokensPerMonth.toLocaleString(),
        })}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={percent}
        aria-label={t('assistant.budget.a11y', {
          used: used.toLocaleString(),
          limit: tokensPerMonth.toLocaleString(),
        })}
      />
    </Box>
  );
};

export default AssistantBudgetMeter;
