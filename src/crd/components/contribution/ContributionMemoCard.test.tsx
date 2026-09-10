import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ContributionMemoCard } from './ContributionMemoCard';

describe('ContributionMemoCard signed copies', () => {
  it('keeps Open memo and Signed copies as visible semantic siblings', async () => {
    const onClick = vi.fn();
    const onOpenSignedCopies = vi.fn();
    const user = userEvent.setup();

    render(
      <ContributionMemoCard
        title="Pilot memo"
        markdownContent="Fixed proposal"
        onClick={onClick}
        {...({ signedCopiesCount: 1, onOpenSignedCopies } as Record<string, unknown>)}
      />
    );

    const openMemo = screen.getByRole('button', { name: 'Open Memo' });
    const history = screen.getByRole('button', { name: 'Signed copies (1)' });
    expect(openMemo.contains(history)).toBe(false);
    expect(history).toBeVisible();

    history.focus();
    await user.keyboard('{Enter}');

    expect(onOpenSignedCopies).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });
});
