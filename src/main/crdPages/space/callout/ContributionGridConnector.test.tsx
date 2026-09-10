import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ContributionGridConnector } from './ContributionGridConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, variables?: { count?: number }) =>
      key === 'memo.signing.signedCopiesCount' ? `Signed copies (${variables?.count})` : key,
  }),
}));

describe('ContributionGridConnector signed copies', () => {
  it('routes history from the full contribution grid without opening the memo', async () => {
    const user = userEvent.setup();
    const onContributionClick = vi.fn();
    const onOpenMemoSignedCopies = vi.fn();
    const contributions = [
      {
        id: 'contribution-1',
        type: 'memo',
        title: 'Decision',
        memoId: 'memo-1',
        signedCopiesCount: 2,
      },
    ];

    render(
      <ContributionGridConnector
        contributions={contributions as never}
        onContributionClick={onContributionClick}
        onOpenMemoSignedCopies={onOpenMemoSignedCopies}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Signed copies (2)' }));

    expect(onOpenMemoSignedCopies).toHaveBeenCalledWith('memo-1');
    expect(onContributionClick).not.toHaveBeenCalled();
  });

  it('does not expose a no-op history control when the parent capability is absent', () => {
    render(
      <ContributionGridConnector
        contributions={
          [
            {
              id: 'contribution-1',
              type: 'memo',
              title: 'Decision',
              memoId: 'memo-1',
              signedCopiesCount: 2,
            },
          ] as never
        }
      />
    );

    expect(screen.queryByRole('button', { name: 'Signed copies (2)' })).not.toBeInTheDocument();
  });
});
