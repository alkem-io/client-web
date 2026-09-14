import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { ContributionsPreviewConnector } from './ContributionsPreviewConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key: string, variables?: { count?: number }) => {
      if (key === 'memo.signing.signedCopiesCount') return `Signed copies (${variables?.count})`;
      if (key === 'callout.contributionsHeader') return `Contributions (${variables?.count})`;
      return key;
    },
  }),
}));

vi.mock(
  '@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutCollaborationPermissions',
  () => ({
    default: () => ({ canCreateContribution: false }),
  })
);

vi.mock('@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions', () => ({
  default: () => ({
    inViewRef: vi.fn(),
    loaded: true,
    contributions: {
      total: 1,
      items: [
        {
          id: 'contribution-1',
          memo: {
            id: 'memo-1',
            profile: { displayName: 'Decision' },
            markdown: 'Decision',
            signatures: [
              { id: 'signed-1', document: { id: 'document-1' } },
              { id: 'incomplete-1', document: null },
            ],
          },
        },
      ],
    },
  }),
}));

describe('ContributionsPreviewConnector signed copies', () => {
  it('routes history from a feed contribution preview without opening the memo', async () => {
    const user = userEvent.setup();
    const onContributionClick = vi.fn();
    const onOpenMemoSignedCopies = vi.fn();
    const callout = {
      id: 'callout-1',
      framing: {
        type: CalloutFramingType.None,
        profile: { displayName: 'Responses' },
      },
      settings: {
        framing: { commentsEnabled: true },
        contribution: {
          enabled: true,
          allowedTypes: [CalloutContributionType.Memo],
          canAddContributions: 'NONE',
          commentsEnabled: false,
        },
      },
      contributions: [{ id: 'contribution-1' }],
    };

    render(
      <ContributionsPreviewConnector
        callout={callout as never}
        onShowAll={vi.fn()}
        onContributionClick={onContributionClick}
        onOpenMemoSignedCopies={onOpenMemoSignedCopies}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Signed copies (1)' }));

    expect(onOpenMemoSignedCopies).toHaveBeenCalledWith('memo-1');
    expect(onContributionClick).not.toHaveBeenCalled();
  });

  it('does not expose a no-op history control when the parent capability is absent', () => {
    const callout = {
      id: 'callout-1',
      framing: {
        type: CalloutFramingType.None,
        profile: { displayName: 'Responses' },
      },
      settings: {
        framing: { commentsEnabled: true },
        contribution: {
          enabled: true,
          allowedTypes: [CalloutContributionType.Memo],
          canAddContributions: 'NONE',
          commentsEnabled: false,
        },
      },
      contributions: [{ id: 'contribution-1' }],
    };

    render(<ContributionsPreviewConnector callout={callout as never} onShowAll={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Signed copies (1)' })).not.toBeInTheDocument();
  });
});
