import { useTranslation } from 'react-i18next';
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
      <div className="px-2 pb-1">
        <span className="text-caption text-muted-foreground">{t('assistant.budget.noLimit')}</span>
      </div>
    );
  }

  const used = Math.max(0, monthToDateUsed);
  const fraction = tokensPerMonth > 0 ? Math.min(1, used / tokensPerMonth) : 0;
  const percent = Math.round(fraction * 100);

  return (
    <div className="flex flex-col gap-1 px-2 pb-1">
      <span className="text-caption text-muted-foreground">
        {t('assistant.budget.usage', {
          used: used.toLocaleString(),
          limit: tokensPerMonth.toLocaleString(),
        })}
      </span>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('assistant.budget.a11y', {
          used: used.toLocaleString(),
          limit: tokensPerMonth.toLocaleString(),
        })}
        className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20"
      >
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export default AssistantBudgetMeter;
