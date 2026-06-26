/**
 * @vitest-environment jsdom
 *
 * T049 — D1 read-only budget meter (assistant-access-and-budget.md §7).
 *
 * - A resolved budget renders "X of Y monthly tokens · resets on the 1st".
 * - D3: a null `tokensPerMonth` shows "no limit configured", never a 0-of-0 bar.
 * - A null budget (endpoint 404 / not yet deployed — asvc T056) renders nothing.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@/main/test/testUtils';
import AssistantBudgetMeter from '../AssistantBudgetMeter';

describe('AssistantBudgetMeter', () => {
  it('renders the used/limit usage line with a progress bar', () => {
    render(
      <AssistantBudgetMeter budget={{ tokensPerMonth: 100000, monthToDateUsed: 25000, resetsOn: '2026-07-01' }} />
    );

    expect(screen.getByText(/25,000 of 100,000 monthly tokens/)).toBeInTheDocument();
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '25');
  });

  it('D3: shows "no limit configured" when tokensPerMonth is null (no 0-of-0 bar)', () => {
    render(<AssistantBudgetMeter budget={{ tokensPerMonth: null, monthToDateUsed: 0 }} />);

    expect(screen.getByText(/No monthly token limit configured/)).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders nothing when the budget is unavailable (endpoint 404 / not deployed)', () => {
    const { container } = render(<AssistantBudgetMeter budget={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
